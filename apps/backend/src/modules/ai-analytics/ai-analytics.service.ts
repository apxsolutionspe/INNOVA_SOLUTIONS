import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CashMovementType, ServiceOrderStatus } from '@prisma/client';
import { createHash } from 'node:crypto';

import { PrismaService } from '../../database/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { AiQueryDto } from './dto/ai-query.dto';
import { businessSummaryPrompt } from './prompts/business-summary.prompt';
import { BusinessAiMode, BusinessAiProvider, BusinessAiProviderName } from './providers/ai-provider.interface';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenAiProvider } from './providers/openai.provider';

type InsightResponse = {
  success: boolean;
  provider: BusinessAiProviderName;
  model?: string;
  mode: BusinessAiMode;
  answer: string;
  insights: string[];
  warnings: string[];
  generatedAt: string;
  metadata?: Record<string, unknown>;
};

type BusinessContext = {
  generatedAt: string;
  sales: Record<string, unknown>;
  inventory: Record<string, unknown>;
  cash: Record<string, unknown>;
  purchases: Record<string, unknown>;
  serviceOrders: Record<string, unknown>;
  quickServices: Record<string, unknown>;
  profitability: Record<string, unknown>;
  alerts: string[];
};

type CachedAiResult = {
  expiresAt: number;
  result: {
    provider: BusinessAiProviderName;
    mode: BusinessAiMode;
    answer: string;
    model?: string;
    metadata?: Record<string, unknown>;
  };
};

@Injectable()
export class AiAnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly gemini: GeminiProvider,
    private readonly openai: OpenAiProvider,
  ) {}

  private readonly responseCache = new Map<string, CachedAiResult>();

  async businessSummary(): Promise<InsightResponse> {
    const context = await this.buildBusinessContext();
    return this.ruleBasedResponse('Resumen general del negocio.', this.buildSummaryInsights(context), {
      dataSources: ['sales', 'inventory', 'cash', 'purchases', 'service-orders', 'quick-services'],
    });
  }

  async salesInsights(): Promise<InsightResponse> {
    const context = await this.buildBusinessContext();
    const sales = context.sales as {
      salesToday?: number;
      incomeToday?: number;
      incomeMonth?: number;
      salesMonth?: number;
      topProductsSold?: Array<{ name: string; quantity: number; total: number }>;
      paymentMethods?: Array<{ method: string; amount: number; count: number }>;
    };

    const insights = [
      `Ventas de hoy: ${sales.salesToday ?? 0}. Ingresos de hoy: S/ ${this.money(sales.incomeToday)}.`,
      `Ventas del mes: ${sales.salesMonth ?? 0}. Ingresos del mes: S/ ${this.money(sales.incomeMonth)}.`,
      ...(sales.topProductsSold ?? []).map((item) => `${item.name}: ${item.quantity} unidades vendidas, S/ ${this.money(item.total)}.`),
      ...(sales.paymentMethods ?? []).map((item) => `${item.method}: ${item.count} operaciones, S/ ${this.money(item.amount)}.`),
    ];

    return this.ruleBasedResponse('Ventas analizadas con datos reales. Prioriza productos con demanda alta y controla pagos por metodo.', insights, {
      dataSources: ['sales', 'payments'],
    });
  }

  async inventoryInsights(): Promise<InsightResponse> {
    const context = await this.buildBusinessContext();
    const inventory = context.inventory as {
      lowStock?: Array<{ name: string; stock: number; minStock: number; category: string }>;
      outOfStock?: Array<{ name: string; category: string }>;
      possibleLowRotation?: Array<{ name: string; stock: number; minStock: number }>;
    };

    const insights = [
      ...(inventory.lowStock ?? []).map((product) => `Reponer ${product.name}: stock ${product.stock}, minimo ${product.minStock}, categoria ${product.category}.`),
      ...(inventory.outOfStock ?? []).map((product) => `${product.name} esta sin stock en ${product.category}.`),
      ...(inventory.possibleLowRotation ?? []).map((product) => `${product.name} podria tener baja rotacion: stock ${product.stock} frente a minimo ${product.minStock}.`),
    ];

    return this.ruleBasedResponse('Inventario analizado con stock real, minimos y rotacion estimada.', insights, {
      dataSources: ['inventory', 'sales'],
    });
  }

  async profitabilityInsights(): Promise<InsightResponse> {
    const context = await this.buildBusinessContext();
    const profitability = context.profitability as {
      estimatedProductMargin?: number;
      estimatedServiceMargin?: number;
      expenses?: number;
      estimatedNetProfit?: number;
      topProductMargins?: Array<{ name: string; margin: number }>;
      topServiceMargins?: Array<{ name: string; margin: number }>;
    };

    const insights = [
      `Margen estimado de productos: S/ ${this.money(profitability.estimatedProductMargin)}.`,
      `Margen estimado de servicios rapidos: S/ ${this.money(profitability.estimatedServiceMargin)}.`,
      `Gastos registrados: S/ ${this.money(profitability.expenses)}.`,
      `Utilidad neta estimada: S/ ${this.money(profitability.estimatedNetProfit)}.`,
      ...(profitability.topProductMargins ?? []).map((item) => `${item.name}: margen unitario estimado S/ ${this.money(item.margin)}.`),
      ...(profitability.topServiceMargins ?? []).map((item) => `${item.name}: margen estimado S/ ${this.money(item.margin)}.`),
    ];

    return this.ruleBasedResponse('Rentabilidad revisada desde costos, precios e ingresos registrados.', insights, {
      dataSources: ['profitability', 'cash', 'inventory', 'quick-services'],
    });
  }

  async ask(dto: AiQueryDto, user: AuthenticatedUser) {
    const startedAt = Date.now();
    const question = dto.question.trim();
    const context = await this.buildBusinessContext();
    const internal = this.answerWithRules(question, context, user.role.name === 'ADMIN');
    const warnings: string[] = [...internal.warnings];
    let provider: BusinessAiProviderName = 'RULE_BASED';
    let mode: BusinessAiMode = 'RULE_BASED_FALLBACK';
    let answer = internal.answer;
    let metadata: Record<string, unknown> = {
      dataSources: this.resolveDataSources(question),
      contextGeneratedAt: context.generatedAt,
    };

    const cloudProvider = this.resolveCloudProvider();
    const limitedContext = this.limitContextForAi(context);
    const cacheKey = cloudProvider ? this.buildCacheKey(question, cloudProvider, limitedContext) : '';

    if (cloudProvider) {
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        provider = cached.provider;
        mode = cached.mode;
        answer = cached.answer;
        metadata = { ...metadata, ...(cached.metadata ?? {}), cached: true, fallbackUsed: false };
      } else {
        const external = await cloudProvider.askBusinessQuestion({
          question,
          systemPrompt: this.systemPrompt(),
          businessContext: limitedContext,
        });

        if (external.mode === 'CLOUD_AI') {
          provider = external.provider;
          mode = 'CLOUD_AI';
          answer = external.answer;
          metadata = { ...metadata, ...(external.metadata ?? {}), cached: false, fallbackUsed: false };
          this.setCachedResult(cacheKey, {
            provider,
            mode,
            answer,
            model: cloudProvider.modelName,
            metadata,
          });
        } else {
          metadata = { ...metadata, ...(external.metadata ?? {}), cached: false, fallbackUsed: true };
          warnings.push(...(external.warnings ?? [`${cloudProvider.providerName} no respondio. Se genero analisis interno.`]));
        }
      }
    } else {
      metadata = { ...metadata, cached: false, fallbackUsed: true };
      warnings.push(this.cloudDisabledReason());
    }

    await this.audit(user.id, 'ASK_AI', `Pregunta IA: ${question}`);

    return {
      success: true,
      question,
      provider,
      model: provider === 'RULE_BASED' ? undefined : this.resolveModelName(provider),
      mode,
      answer,
      insights: internal.insights,
      recommendations: internal.recommendations,
      warnings: [...new Set(warnings.filter(Boolean))],
      generatedAt: new Date().toISOString(),
      metadata: {
        ...metadata,
        durationMs: Date.now() - startedAt,
      },
    };
  }

  async testConnection(user: AuthenticatedUser) {
    const selectedProvider = this.resolveConfiguredProvider();
    const health = selectedProvider ? await selectedProvider.healthCheck() : await this.gemini.healthCheck();
    const providerEnabled = Boolean(selectedProvider);
    const result = selectedProvider
      ? await selectedProvider.testConnection()
      : {
          provider: 'RULE_BASED' as const,
          mode: 'RULE_BASED_FALLBACK' as const,
          answer: this.cloudDisabledReason(),
          warnings: [this.cloudDisabledReason()],
          metadata: { ...health, providerRequested: this.providerNameFromEnv() },
        };

    await this.audit(user.id, 'TEST_CONNECTION', `Prueba IA: ${result.provider} ${result.mode}`);

    return {
      success: true,
      provider: result.provider,
      model: health.model,
      mode: result.mode,
      configured: providerEnabled,
      keyConfigured: health.keyConfigured,
      timeoutMs: health.timeoutMs,
      answer: result.answer,
      warnings: result.warnings ?? [],
      metadata: {
        ...health,
        ...(result.metadata ?? {}),
      },
      generatedAt: new Date().toISOString(),
    };
  }

  private async buildBusinessContext(): Promise<BusinessContext> {
    const maxItems = this.maxContextItems();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(startOfToday);
    startOfMonth.setDate(1);

    const [
      lowStock,
      outOfStock,
      topSaleItems,
      salesToday,
      incomeToday,
      incomeMonth,
      paymentMethods,
      cashSession,
      cashMovements,
      quickServices,
      serviceOrders,
      purchases,
      productMargins,
      serviceMargins,
      pendingPurchases,
    ] = await Promise.all([
      this.prisma.product.findMany({
        where: { isActive: true, stock: { lte: this.prisma.product.fields.minStock } },
        select: { name: true, sku: true, stock: true, minStock: true, salePrice: true, category: { select: { name: true } } },
        orderBy: { stock: 'asc' },
        take: maxItems,
      }),
      this.prisma.product.findMany({
        where: { isActive: true, stock: 0 },
        select: { name: true, sku: true, stock: true, minStock: true, category: { select: { name: true } } },
        orderBy: { name: 'asc' },
        take: maxItems,
      }),
      this.prisma.saleItem.groupBy({
        by: ['description'],
        where: { sale: { status: 'COMPLETED' } },
        _sum: { quantity: true, total: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: maxItems,
      }),
      this.prisma.sale.count({ where: { status: 'COMPLETED', createdAt: { gte: startOfToday } } }),
      this.prisma.sale.aggregate({ where: { status: 'COMPLETED', createdAt: { gte: startOfToday } }, _sum: { total: true } }),
      this.prisma.sale.aggregate({ where: { status: 'COMPLETED', createdAt: { gte: startOfMonth } }, _sum: { total: true }, _count: true }),
      this.prisma.payment.groupBy({
        by: ['method'],
        _sum: { amount: true },
        _count: true,
        orderBy: { _sum: { amount: 'desc' } },
        take: maxItems,
      }),
      this.prisma.cashSession.findFirst({ where: { status: 'OPEN' }, orderBy: { openedAt: 'desc' } }),
      this.prisma.cashMovement.findMany({ orderBy: { createdAt: 'desc' }, take: maxItems }),
      this.prisma.quickServiceSaleItem.groupBy({
        by: ['description'],
        _sum: { quantity: true, subtotal: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: maxItems,
      }),
      this.prisma.serviceOrder.groupBy({ by: ['status'], _count: true }),
      this.prisma.purchaseOrder.groupBy({ by: ['status'], _sum: { total: true }, _count: true }),
      this.prisma.product.findMany({
        where: { isActive: true },
        select: { name: true, salePrice: true, purchasePrice: true, stock: true, minStock: true },
        take: maxItems,
      }),
      this.prisma.quickService.findMany({
        where: { isActive: true },
        select: { name: true, unitPrice: true, costPrice: true },
        take: maxItems,
      }),
      this.prisma.purchaseOrder.findMany({
        where: { status: { in: ['PENDING', 'PARTIALLY_RECEIVED'] } },
        select: { code: true, status: true, total: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: maxItems,
      }),
    ]);

    const incomeTypes: CashMovementType[] = [CashMovementType.INCOME, CashMovementType.SALE, CashMovementType.SERVICE_PAYMENT, CashMovementType.ADJUSTMENT];
    const cashIncome = cashMovements.filter((movement) => incomeTypes.includes(movement.type)).reduce((sum, movement) => sum + Number(movement.amount), 0);
    const cashExpenses = cashMovements.filter((movement) => movement.type === CashMovementType.EXPENSE).reduce((sum, movement) => sum + Number(movement.amount), 0);
    const topProductMargins = productMargins
      .map((product) => ({
        name: product.name,
        margin: Number(product.salePrice) - Number(product.purchasePrice),
        stock: product.stock,
        minStock: product.minStock,
      }))
      .sort((a, b) => b.margin - a.margin)
      .slice(0, 8);
    const topServiceMargins = serviceMargins
      .map((service) => ({
        name: service.name,
        margin: Number(service.unitPrice) - Number(service.costPrice ?? 0),
      }))
      .sort((a, b) => b.margin - a.margin)
      .slice(0, 8);
    const lowRotation = productMargins
      .filter((product) => product.stock > Math.max(product.minStock * 3, product.minStock + 5))
      .map((product) => ({ name: product.name, stock: product.stock, minStock: product.minStock }))
      .slice(0, 8);
    const pendingStatuses: ServiceOrderStatus[] = [ServiceOrderStatus.RECEIVED, ServiceOrderStatus.DIAGNOSIS, ServiceOrderStatus.IN_PROGRESS];
    const pendingOrderCount = serviceOrders
      .filter((item) => pendingStatuses.includes(item.status))
      .reduce((sum, item) => sum + item._count, 0);
    const readyOrderCount = serviceOrders.find((item) => item.status === ServiceOrderStatus.READY)?._count ?? 0;
    const expenses = cashExpenses;
    const estimatedProductMargin = topProductMargins.reduce((sum, product) => sum + product.margin * product.stock, 0);
    const estimatedServiceMargin = topServiceMargins.reduce((sum, service) => sum + service.margin, 0);

    const context: BusinessContext = {
      generatedAt: new Date().toISOString(),
      sales: {
        salesToday,
        incomeToday: Number(incomeToday._sum.total ?? 0),
        incomeMonth: Number(incomeMonth._sum.total ?? 0),
        salesMonth: incomeMonth._count,
        topProductsSold: topSaleItems.map((item) => ({
          name: item.description,
          quantity: item._sum.quantity ?? 0,
          total: Number(item._sum.total ?? 0),
        })),
        paymentMethods: paymentMethods.map((item) => ({
          method: item.method,
          amount: Number(item._sum.amount ?? 0),
          count: item._count,
        })),
      },
      inventory: {
        lowStock: lowStock.map((product) => ({
          name: product.name,
          sku: product.sku,
          stock: product.stock,
          minStock: product.minStock,
          salePrice: Number(product.salePrice),
          category: product.category.name,
        })),
        outOfStock: outOfStock.map((product) => ({
          name: product.name,
          sku: product.sku,
          stock: product.stock,
          minStock: product.minStock,
          category: product.category.name,
        })),
        possibleLowRotation: lowRotation,
      },
      cash: {
        currentCashStatus: cashSession?.status ?? 'CLOSED',
        openingAmount: cashSession ? Number(cashSession.openingAmount) : 0,
        expectedCashAmount: cashSession ? Number(cashSession.expectedCashAmount) : 0,
        difference: cashSession ? Number(cashSession.difference) : 0,
        income: cashIncome,
        expenses,
        net: cashIncome - expenses,
      },
      purchases: {
        byStatus: purchases.map((item) => ({ status: item.status, count: item._count, total: Number(item._sum.total ?? 0) })),
        pending: pendingPurchases.map((purchase) => ({
          code: purchase.code,
          status: purchase.status,
          total: Number(purchase.total),
          createdAt: purchase.createdAt,
        })),
      },
      serviceOrders: {
        byStatus: serviceOrders.map((item) => ({ status: item.status, count: item._count })),
        pending: pendingOrderCount,
        ready: readyOrderCount,
      },
      quickServices: {
        topServices: quickServices.map((item) => ({
          name: item.description,
          quantity: item._sum.quantity ?? 0,
          income: Number(item._sum.subtotal ?? 0),
        })),
      },
      profitability: {
        estimatedProductMargin,
        estimatedServiceMargin,
        expenses,
        estimatedNetProfit: Number(incomeMonth._sum.total ?? 0) + estimatedServiceMargin - expenses,
        topProductMargins,
        topServiceMargins,
      },
      alerts: [],
    };

    context.alerts = this.buildAlerts(context);
    return context;
  }

  private answerWithRules(question: string, context: BusinessContext, includeProfitability: boolean) {
    const normalized = question.toLowerCase();
    let base: InsightResponse;

    if (this.matches(normalized, ['reponer', 'stock', 'inventario', 'rotacion', 'rotación'])) {
      base = this.ruleBasedResponse('Con base en el inventario actual, debes priorizar los productos con stock bajo o sin stock.', this.buildInventoryInsights(context), {
        dataSources: ['inventory', 'sales'],
      });
    } else if (this.matches(normalized, ['vendidos', 'ventas', 'mes', 'demanda'])) {
      base = this.ruleBasedResponse('Las ventas muestran la demanda actual y los productos que conviene priorizar.', this.buildSalesInsights(context), {
        dataSources: ['sales', 'payments'],
      });
    } else if (this.matches(normalized, ['servicios', 'rapidos', 'rápidos'])) {
      base = this.ruleBasedResponse('Los servicios rapidos deben evaluarse por ingreso, frecuencia y margen estimado.', this.buildQuickServiceInsights(context), {
        dataSources: ['quick-services', 'cash'],
      });
    } else if (this.matches(normalized, ['rentabilidad', 'ganancia', 'margen', 'utilidad'])) {
      base = includeProfitability
        ? this.ruleBasedResponse('La rentabilidad estimada se calcula con ingresos, costos y gastos registrados.', this.buildProfitabilityInsights(context), {
            dataSources: ['profitability', 'cash', 'inventory'],
          })
        : this.ruleBasedResponse('Rentabilidad avanzada disponible solo para ADMIN.', [], { dataSources: ['profitability'] });
    } else if (this.matches(normalized, ['caja', 'movimiento', 'efectivo', 'gasto'])) {
      base = this.ruleBasedResponse('La caja se analiza desde movimientos recientes, ingresos, gastos y diferencia.', this.buildCashInsights(context), {
        dataSources: ['cash'],
      });
    } else if (this.matches(normalized, ['alerta', 'hoy', 'pendiente', 'orden', 'compra'])) {
      base = this.ruleBasedResponse('Estas son las alertas prioritarias para revisar hoy.', this.buildSummaryInsights(context), {
        dataSources: ['inventory', 'purchases', 'service-orders', 'cash'],
      });
    } else {
      base = this.ruleBasedResponse('Analisis general del negocio con datos operativos agregados.', this.buildSummaryInsights(context), {
        dataSources: ['sales', 'inventory', 'cash', 'purchases', 'service-orders', 'quick-services'],
      });
    }

    const recommendations = this.recommendations(base.insights);
    return {
      answer: this.composeAnswer(question, base.answer, base.insights, recommendations),
      insights: base.insights,
      recommendations,
      warnings: base.insights.length ? [] : ['Aun no hay suficientes datos para generar un analisis completo.'],
    };
  }

  private buildSummaryInsights(context: BusinessContext) {
    return [
      ...this.buildSalesInsights(context).slice(0, 2),
      ...this.buildInventoryInsights(context).slice(0, 4),
      ...this.buildCashInsights(context).slice(0, 2),
      ...this.buildServiceOrderInsights(context).slice(0, 2),
      ...this.buildPurchaseInsights(context).slice(0, 2),
      ...context.alerts,
    ];
  }

  private buildSalesInsights(context: BusinessContext) {
    const sales = context.sales as {
      salesToday?: number;
      incomeToday?: number;
      incomeMonth?: number;
      salesMonth?: number;
      topProductsSold?: Array<{ name: string; quantity: number; total: number }>;
    };

    return [
      `Hoy se registran ${sales.salesToday ?? 0} ventas por S/ ${this.money(sales.incomeToday)}.`,
      `En el mes se registran ${sales.salesMonth ?? 0} ventas por S/ ${this.money(sales.incomeMonth)}.`,
      ...(sales.topProductsSold ?? []).map((item) => `${item.name}: ${item.quantity} unidades vendidas, S/ ${this.money(item.total)}.`),
    ];
  }

  private buildInventoryInsights(context: BusinessContext) {
    const inventory = context.inventory as {
      lowStock?: Array<{ name: string; stock: number; minStock: number; category: string }>;
      outOfStock?: Array<{ name: string; category: string }>;
      possibleLowRotation?: Array<{ name: string; stock: number; minStock: number }>;
    };

    return [
      ...(inventory.lowStock ?? []).map((product) => `Reponer ${product.name}: stock ${product.stock}, minimo ${product.minStock}, categoria ${product.category}.`),
      ...(inventory.outOfStock ?? []).map((product) => `${product.name} esta sin stock en ${product.category}.`),
      ...(inventory.possibleLowRotation ?? []).map((product) => `${product.name} podria tener baja rotacion: stock ${product.stock}, minimo ${product.minStock}.`),
    ];
  }

  private buildCashInsights(context: BusinessContext) {
    const cash = context.cash as { currentCashStatus?: string; income?: number; expenses?: number; net?: number; difference?: number };
    const insights = [
      `Caja actual: ${cash.currentCashStatus ?? 'CLOSED'}. Ingresos recientes S/ ${this.money(cash.income)}, gastos S/ ${this.money(cash.expenses)}, neto S/ ${this.money(cash.net)}.`,
    ];
    if (Number(cash.difference ?? 0) !== 0) {
      insights.push(`Diferencia de caja registrada: S/ ${this.money(cash.difference)}.`);
    }
    return insights;
  }

  private buildPurchaseInsights(context: BusinessContext) {
    const purchases = context.purchases as {
      pending?: Array<{ code: string; status: string; total: number }>;
      byStatus?: Array<{ status: string; count: number; total: number }>;
    };
    return [
      ...((purchases.byStatus ?? []).map((item) => `Compras ${item.status}: ${item.count}, monto S/ ${this.money(item.total)}.`)),
      ...((purchases.pending ?? []).map((item) => `Compra pendiente ${item.code}: ${item.status}, S/ ${this.money(item.total)}.`)),
    ];
  }

  private buildServiceOrderInsights(context: BusinessContext) {
    const orders = context.serviceOrders as { pending?: number; ready?: number; byStatus?: Array<{ status: string; count: number }> };
    return [
      `Ordenes tecnicas pendientes/en proceso: ${orders.pending ?? 0}.`,
      `Ordenes listas para entregar: ${orders.ready ?? 0}.`,
      ...((orders.byStatus ?? []).map((item) => `Ordenes ${item.status}: ${item.count}.`)),
    ];
  }

  private buildQuickServiceInsights(context: BusinessContext) {
    const quick = context.quickServices as { topServices?: Array<{ name: string; quantity: number; income: number }> };
    return (quick.topServices ?? []).map((item) => `${item.name}: ${item.quantity} operaciones/unidades, ingreso S/ ${this.money(item.income)}.`);
  }

  private buildProfitabilityInsights(context: BusinessContext) {
    const profitability = context.profitability as {
      estimatedProductMargin?: number;
      estimatedServiceMargin?: number;
      expenses?: number;
      estimatedNetProfit?: number;
      topProductMargins?: Array<{ name: string; margin: number }>;
      topServiceMargins?: Array<{ name: string; margin: number }>;
    };
    return [
      `Margen estimado de productos: S/ ${this.money(profitability.estimatedProductMargin)}.`,
      `Margen estimado de servicios rapidos: S/ ${this.money(profitability.estimatedServiceMargin)}.`,
      `Gastos recientes registrados: S/ ${this.money(profitability.expenses)}.`,
      `Utilidad neta estimada: S/ ${this.money(profitability.estimatedNetProfit)}.`,
      ...((profitability.topProductMargins ?? []).map((item) => `${item.name}: margen unitario S/ ${this.money(item.margin)}.`)),
      ...((profitability.topServiceMargins ?? []).map((item) => `${item.name}: margen estimado S/ ${this.money(item.margin)}.`)),
    ];
  }

  private buildAlerts(context: BusinessContext) {
    const inventory = context.inventory as { lowStock?: unknown[]; outOfStock?: unknown[] };
    const purchases = context.purchases as { pending?: unknown[] };
    const serviceOrders = context.serviceOrders as { pending?: number; ready?: number };
    const cash = context.cash as { difference?: number };
    const alerts: string[] = [];

    if ((inventory.lowStock?.length ?? 0) > 0) alerts.push(`Stock bajo: ${inventory.lowStock?.length ?? 0} productos requieren revision.`);
    if ((inventory.outOfStock?.length ?? 0) > 0) alerts.push(`Sin stock: ${inventory.outOfStock?.length ?? 0} productos no tienen disponibilidad.`);
    if ((purchases.pending?.length ?? 0) > 0) alerts.push(`Compras pendientes: ${purchases.pending?.length ?? 0} ordenes por revisar.`);
    if ((serviceOrders.pending ?? 0) > 0) alerts.push(`Ordenes tecnicas pendientes/en proceso: ${serviceOrders.pending}.`);
    if ((serviceOrders.ready ?? 0) > 0) alerts.push(`Ordenes listas para entregar: ${serviceOrders.ready}.`);
    if (Number(cash.difference ?? 0) !== 0) alerts.push(`Diferencia de caja detectada: S/ ${this.money(cash.difference)}.`);

    return alerts;
  }

  private ruleBasedResponse(answer: string, insights: string[], metadata?: Record<string, unknown>): InsightResponse {
    return {
      success: true,
      provider: 'RULE_BASED',
      mode: 'RULE_BASED_FALLBACK',
      answer,
      insights: insights.length ? insights : ['Aun no hay suficientes datos para generar un analisis completo.'],
      warnings: [],
      generatedAt: new Date().toISOString(),
      metadata,
    };
  }

  private composeAnswer(question: string, base: string, insights: string[], recommendations: string[]) {
    if (!insights.length) return 'Aun no hay suficientes datos para generar un analisis completo.';
    return [
      `Para la pregunta "${question}", el sistema analizo datos reales agregados del negocio.`,
      base,
      recommendations.length ? `Accion prioritaria: ${recommendations[0]}` : 'Accion prioritaria: revisar los indicadores criticos antes de tomar decisiones.',
    ].join(' ');
  }

  private recommendations(insights: string[]) {
    const text = insights.join(' ').toLowerCase();
    const output: string[] = [];
    if (text.includes('sin stock') || text.includes('reponer') || text.includes('stock bajo')) {
      output.push('Prioriza reposicion de productos criticos y valida proveedores antes de que impacte ventas.');
    }
    if (text.includes('margen') || text.includes('utilidad')) {
      output.push('Impulsa productos y servicios con mejor margen y revisa gastos operativos frecuentes.');
    }
    if (text.includes('ventas') || text.includes('vendidas')) {
      output.push('Usa los productos mas vendidos para planificar compras, combos y promociones controladas.');
    }
    if (text.includes('caja') || text.includes('gastos')) {
      output.push('Revisa movimientos de caja y diferencias antes del cierre diario.');
    }
    if (!output.length) {
      output.push('Revisa primero stock, caja, compras pendientes y ordenes tecnicas activas.');
    }
    return output;
  }

  private resolveCloudProvider(): BusinessAiProvider | null {
    return this.resolveConfiguredProvider();
  }

  private resolveConfiguredProvider(): BusinessAiProvider | null {
    const enabled = (this.config.get<string>('AI_ENABLED') ?? this.config.get<string>('AI_MODE') ?? 'false').toLowerCase();
    const provider = (this.config.get<string>('AI_PROVIDER') ?? '').toLowerCase();
    if (!['true', '1', 'yes', 'real', 'production'].includes(enabled)) return null;
    if (provider === 'gemini' && this.config.get<string>('GEMINI_API_KEY')?.trim()) return this.gemini;
    if (provider === 'openai' && this.config.get<string>('OPENAI_API_KEY')?.trim()) return this.openai;
    return null;
  }

  private providerNameFromEnv() {
    const provider = (this.config.get<string>('AI_PROVIDER') ?? 'gemini').toLowerCase();
    return provider === 'openai' ? 'OPENAI' : provider === 'gemini' ? 'GEMINI' : 'RULE_BASED';
  }

  private resolveModelName(provider: BusinessAiProviderName) {
    if (provider === 'GEMINI') return this.gemini.modelName;
    if (provider === 'OPENAI') return this.openai.modelName;
    return undefined;
  }

  private cloudDisabledReason() {
    const provider = (this.config.get<string>('AI_PROVIDER') ?? 'gemini').toLowerCase();
    const enabled = (this.config.get<string>('AI_ENABLED') ?? this.config.get<string>('AI_MODE') ?? 'false').toLowerCase();

    if (!['true', '1', 'yes', 'real', 'production'].includes(enabled)) {
      return 'IA cloud deshabilitada. Se usara analisis interno.';
    }
    if (provider === 'gemini' && !this.config.get<string>('GEMINI_API_KEY')?.trim()) {
      return 'Gemini no esta configurado. Se usara analisis interno.';
    }
    if (provider === 'openai' && !this.config.get<string>('OPENAI_API_KEY')?.trim()) {
      return 'OpenAI no esta configurado. Se usara analisis interno.';
    }
    if (!['gemini', 'openai'].includes(provider)) {
      return 'AI_PROVIDER no esta configurado como gemini u openai. Se usara analisis interno.';
    }
    return 'Se usara analisis interno.';
  }

  private maxContextItems() {
    const value = Number(this.config.get<string>('AI_MAX_CONTEXT_ITEMS') ?? 10);
    return Number.isFinite(value) && value > 0 ? Math.min(value, 50) : 10;
  }

  private cacheEnabled() {
    return (this.config.get<string>('AI_USE_CACHE') ?? 'true').toLowerCase() !== 'false';
  }

  private cacheTtlMs() {
    const seconds = Number(this.config.get<string>('AI_CACHE_TTL_SECONDS') ?? 300);
    return (Number.isFinite(seconds) && seconds > 0 ? seconds : 300) * 1000;
  }

  private buildCacheKey(question: string, provider: BusinessAiProvider, context: Record<string, unknown>) {
    const hash = createHash('sha256')
      .update(provider.providerName)
      .update(provider.modelName)
      .update(question.trim().toLowerCase())
      .update(JSON.stringify({ ...context, generatedAt: undefined }))
      .digest('hex');
    return hash;
  }

  private getCachedResult(cacheKey: string) {
    if (!this.cacheEnabled() || !cacheKey) return null;
    const cached = this.responseCache.get(cacheKey);
    if (!cached) return null;
    if (cached.expiresAt < Date.now()) {
      this.responseCache.delete(cacheKey);
      return null;
    }
    return cached.result;
  }

  private setCachedResult(cacheKey: string, result: CachedAiResult['result']) {
    if (!this.cacheEnabled() || !cacheKey) return;
    if (this.responseCache.size > 100) {
      const firstKey = this.responseCache.keys().next().value as string | undefined;
      if (firstKey) this.responseCache.delete(firstKey);
    }
    this.responseCache.set(cacheKey, { expiresAt: Date.now() + this.cacheTtlMs(), result });
  }

  private limitContextForAi(context: BusinessContext) {
    const max = this.maxContextItems();
    return {
      ...context,
      alerts: context.alerts.slice(0, max),
      sales: this.limitNestedArrays(context.sales, max),
      inventory: this.limitNestedArrays(context.inventory, max),
      cash: context.cash,
      purchases: this.limitNestedArrays(context.purchases, max),
      serviceOrders: context.serviceOrders,
      quickServices: this.limitNestedArrays(context.quickServices, max),
      profitability: this.limitNestedArrays(context.profitability, max),
    };
  }

  private limitNestedArrays(value: Record<string, unknown>, max: number) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, Array.isArray(entry) ? entry.slice(0, max) : entry]),
    );
  }

  private resolveDataSources(question: string) {
    const normalized = question.toLowerCase();
    const sources = new Set<string>(['sales', 'inventory', 'cash']);
    if (this.matches(normalized, ['compra', 'proveedor', 'reponer'])) sources.add('purchases');
    if (this.matches(normalized, ['orden', 'tecnica', 'técnica'])) sources.add('service-orders');
    if (this.matches(normalized, ['servicio', 'rapido', 'rápido'])) sources.add('quick-services');
    if (this.matches(normalized, ['rentabilidad', 'ganancia', 'margen', 'utilidad'])) sources.add('profitability');
    return [...sources];
  }

  private systemPrompt() {
    return [
      'Eres un analista empresarial experto integrado a un sistema de gestion de ventas, inventario, caja, compras, servicios tecnicos, reportes y rentabilidad.',
      'Responde unicamente con base en los datos entregados por el sistema. No inventes cifras ni hechos.',
      'Si faltan datos, indicalo claramente. Prioriza recomendaciones accionables, riesgos, oportunidades y decisiones concretas para el negocio.',
      'No solicites ni reveles passwords, tokens, claves, documentos personales completos ni informacion sensible.',
      'Responde en espanol profesional, claro, ejecutivo y estructurado.',
      'Incluye cuando corresponda: diagnostico, hallazgos relevantes, recomendaciones, acciones prioritarias, riesgos, datos usados y nivel de confianza.',
      businessSummaryPrompt,
    ].join(' ');
  }

  private matches(value: string, terms: string[]) {
    return terms.some((term) => value.includes(term));
  }

  private money(value: unknown) {
    return Number(value ?? 0).toFixed(2);
  }

  private async audit(userId: string, action: string, description: string) {
    try {
      await this.prisma.auditLog.create({ data: { userId, module: 'AI_ANALYTICS', action, description, entityType: 'AI' } });
    } catch {
      // La auditoria no debe bloquear una respuesta analitica.
    }
  }
}
