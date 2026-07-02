import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CashMovementType, ServiceOrderStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { AiQueryDto } from './dto/ai-query.dto';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenAiProvider } from './providers/openai.provider';

type InsightResponse = {
  mode: 'MOCK' | 'REAL';
  answer: string;
  insights: string[];
  generatedAt: string;
};

@Injectable()
export class AiAnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly gemini: GeminiProvider,
    private readonly openai: OpenAiProvider,
  ) {}

  async businessSummary(): Promise<InsightResponse> {
    const [sales, salesAmount, quickServicesAmount, lowStock, outOfStock, pendingOrders, readyOrders, pendingPurchases, cashMovements] = await Promise.all([
      this.prisma.sale.count({ where: { status: 'COMPLETED' } }),
      this.prisma.sale.aggregate({ where: { status: 'COMPLETED' }, _sum: { total: true } }),
      this.prisma.quickServiceSale.aggregate({ where: { status: 'COMPLETED' }, _sum: { total: true } }),
      this.prisma.product.count({ where: { isActive: true, stock: { lte: this.prisma.product.fields.minStock } } }),
      this.prisma.product.count({ where: { isActive: true, stock: 0 } }),
      this.prisma.serviceOrder.count({ where: { status: { in: [ServiceOrderStatus.RECEIVED, ServiceOrderStatus.DIAGNOSIS, ServiceOrderStatus.IN_PROGRESS] } } }),
      this.prisma.serviceOrder.count({ where: { status: ServiceOrderStatus.READY } }),
      this.prisma.purchaseOrder.count({ where: { status: { in: ['PENDING', 'PARTIALLY_RECEIVED'] } } }),
      this.prisma.cashMovement.findMany({ orderBy: { createdAt: 'desc' }, take: 30 }),
    ]);

    const incomeTypes: CashMovementType[] = [CashMovementType.INCOME, CashMovementType.SALE, CashMovementType.SERVICE_PAYMENT];
    const income = cashMovements
      .filter((movement) => incomeTypes.includes(movement.type))
      .reduce((sum, movement) => sum + Number(movement.amount), 0);
    const expenses = cashMovements.filter((movement) => movement.type === CashMovementType.EXPENSE).reduce((sum, movement) => sum + Number(movement.amount), 0);
    const insights = [
      `Ventas completadas: ${sales}, ingresos acumulados por ventas: S/ ${Number(salesAmount._sum.total ?? 0).toFixed(2)}.`,
      `Ingresos por servicios rapidos: S/ ${Number(quickServicesAmount._sum.total ?? 0).toFixed(2)}.`,
      `Inventario: ${lowStock} productos en stock bajo y ${outOfStock} sin stock.`,
      `Ordenes tecnicas: ${pendingOrders} pendientes/en proceso y ${readyOrders} listas para entregar.`,
      `Compras pendientes o parciales: ${pendingPurchases}.`,
      `Caja reciente: ingresos S/ ${income.toFixed(2)}, gastos S/ ${expenses.toFixed(2)}, neto S/ ${(income - expenses).toFixed(2)}.`,
    ];

    return {
      mode: 'MOCK',
      answer: 'Resumen operativo generado con datos reales del sistema.',
      insights,
      generatedAt: new Date().toISOString(),
    };
  }

  async salesInsights(): Promise<InsightResponse> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const [topProducts, monthSales, recentSales] = await Promise.all([
      this.prisma.saleItem.groupBy({ by: ['description'], _sum: { quantity: true, total: true }, orderBy: { _sum: { quantity: 'desc' } }, take: 5 }),
      this.prisma.sale.aggregate({ where: { status: 'COMPLETED', createdAt: { gte: startOfMonth } }, _sum: { total: true }, _count: true }),
      this.prisma.sale.findMany({ where: { status: 'COMPLETED' }, orderBy: { createdAt: 'desc' }, take: 5, include: { payments: true } }),
    ]);

    const insights = [
      `Ventas del mes: ${monthSales._count}, ingresos del mes: S/ ${Number(monthSales._sum.total ?? 0).toFixed(2)}.`,
      ...topProducts.map((item) => `${item.description}: ${item._sum.quantity ?? 0} unidades vendidas, S/ ${Number(item._sum.total ?? 0).toFixed(2)}.`),
      ...recentSales.map((sale) => `Venta reciente ${sale.code}: S/ ${Number(sale.total).toFixed(2)} via ${sale.payments[0]?.method ?? 'sin metodo registrado'}.`),
    ];

    return this.buildResponse('Ventas analizadas con datos reales. Prioriza reposicion y promociones sobre los productos con mayor rotacion.', insights);
  }

  async inventoryInsights(): Promise<InsightResponse> {
    const [lowStock, outOfStock, recentMovements, products] = await Promise.all([
      this.prisma.product.findMany({ where: { isActive: true, stock: { lte: this.prisma.product.fields.minStock } }, include: { category: true }, orderBy: { stock: 'asc' }, take: 10 }),
      this.prisma.product.findMany({ where: { isActive: true, stock: 0 }, include: { category: true }, orderBy: { name: 'asc' }, take: 10 }),
      this.prisma.inventoryMovement.findMany({ orderBy: { createdAt: 'desc' }, take: 10, include: { product: true } }),
      this.prisma.product.findMany({ where: { isActive: true }, orderBy: { stock: 'desc' }, take: 10 }),
    ]);
    const lowRotation = products.filter((product) => product.stock > product.minStock * 3).slice(0, 5);
    const insights = [
      ...lowStock.map((product) => `Reponer ${product.name}: stock ${product.stock}, minimo ${product.minStock}, categoria ${product.category.name}.`),
      ...outOfStock.map((product) => `${product.name} esta sin stock y debe priorizarse si tiene demanda.`),
      ...lowRotation.map((product) => `${product.name} podria tener baja rotacion: stock ${product.stock} frente a minimo ${product.minStock}.`),
      ...recentMovements.map((movement) => `Movimiento reciente ${movement.type}: ${movement.product.name}, cantidad ${movement.quantity}.`),
    ];
    return this.buildResponse('Inventario analizado con stock real, minimos y movimientos recientes.', insights);
  }

  async profitabilityInsights(): Promise<InsightResponse> {
    const [products, quickServices, expenses] = await Promise.all([
      this.prisma.product.findMany({ where: { isActive: true }, orderBy: { salePrice: 'desc' }, take: 10 }),
      this.prisma.quickService.findMany({ where: { isActive: true }, include: { category: true }, orderBy: { unitPrice: 'desc' }, take: 10 }),
      this.prisma.cashMovement.aggregate({ where: { type: CashMovementType.EXPENSE }, _sum: { amount: true } }),
    ]);
    const productInsights = products.map((product) => {
      const margin = Number(product.salePrice) - Number(product.purchasePrice);
      return `${product.name}: margen unitario estimado S/ ${margin.toFixed(2)} (${product.purchasePrice} -> ${product.salePrice}).`;
    });
    const serviceInsights = quickServices.map((service) => {
      const margin = Number(service.unitPrice) - Number(service.costPrice ?? 0);
      return `${service.name}: margen estimado S/ ${margin.toFixed(2)} por ${service.unit}, categoria ${service.category.name}.`;
    });
    return this.buildResponse(`Rentabilidad revisada. Gastos registrados: S/ ${Number(expenses._sum.amount ?? 0).toFixed(2)}.`, [...productInsights, ...serviceInsights]);
  }

  async ask(dto: AiQueryDto, user: AuthenticatedUser) {
    const question = dto.question.trim();
    const normalized = question.toLowerCase();
    const [summary, sales, inventory, profitability] = await Promise.all([
      this.businessSummary(),
      this.salesInsights(),
      this.inventoryInsights(),
      user.role.name === 'ADMIN' ? this.profitabilityInsights() : Promise.resolve(this.buildResponse('Rentabilidad avanzada disponible solo para ADMIN.', [])),
    ]);

    const selected = this.selectInsights(normalized, { summary, sales, inventory, profitability });
    let answer = this.composeAnswer(question, selected.insights, selected.answer);
    let mode: 'MOCK' | 'REAL' = 'MOCK';

    if (this.shouldUseExternalProvider()) {
      const prompt = this.buildSafePrompt(question, selected.insights);
      const provider = (this.config.get<string>('AI_PROVIDER') ?? 'gemini').toLowerCase() === 'gemini' ? this.gemini : this.openai;
      const external = await provider.ask(prompt);
      if (external.mode === 'REAL') {
        answer = external.answer;
        mode = 'REAL';
      }
    }

    await this.audit(user.id, 'ASK_AI', `Pregunta IA: ${question}`);
    return { question, answer, insights: selected.insights, mode, generatedAt: new Date().toISOString() };
  }

  async testConnection(user: AuthenticatedUser) {
    const provider = (this.config.get<string>('AI_PROVIDER') ?? 'gemini').toLowerCase() === 'gemini' ? this.gemini : this.openai;
    const result = this.shouldUseExternalProvider() ? await provider.testConnection() : { mode: 'MOCK' as const, answer: 'AI_MODE=mock. Se usara analisis interno.' };
    await this.audit(user.id, 'TEST_CONNECTION', result.answer);
    return result;
  }

  private selectInsights(normalizedQuestion: string, data: Record<string, InsightResponse>) {
    if (this.matches(normalizedQuestion, ['reponer', 'stock', 'inventario', 'rotacion', 'rotación'])) return data.inventory;
    if (this.matches(normalizedQuestion, ['vendidos', 'ventas', 'mes', 'demanda'])) return data.sales;
    if (this.matches(normalizedQuestion, ['servicios', 'rapidos', 'rápidos'])) {
      return this.buildResponse('Servicios rapidos revisados dentro del resumen y la rentabilidad.', [...data.summary.insights, ...data.profitability.insights.filter((item) => item.toLowerCase().includes('categoria'))]);
    }
    if (this.matches(normalizedQuestion, ['rentabilidad', 'ganancia', 'margen', 'utilidad'])) return data.profitability;
    if (this.matches(normalizedQuestion, ['caja', 'movimiento', 'efectivo', 'gasto'])) return data.summary;
    if (this.matches(normalizedQuestion, ['alerta', 'hoy', 'pendiente', 'orden'])) return data.summary;
    return this.buildResponse('Analisis general del negocio.', [...data.summary.insights, ...data.sales.insights.slice(0, 4), ...data.inventory.insights.slice(0, 4), ...data.profitability.insights.slice(0, 4)]);
  }

  private composeAnswer(question: string, insights: string[], fallback: string) {
    if (!insights.length) return 'Aun no hay suficientes datos para generar un analisis completo.';
    const intro = `Para la pregunta "${question}", el analisis con datos actuales indica lo siguiente:`;
    const recommendation = this.recommendationFromInsights(insights);
    return `${intro} ${fallback} ${recommendation}`;
  }

  private recommendationFromInsights(insights: string[]) {
    const text = insights.join(' ').toLowerCase();
    if (text.includes('sin stock') || text.includes('reponer')) return 'Recomendacion: prioriza reposicion de productos criticos, revisa proveedores activos y evita vender productos sin disponibilidad real.';
    if (text.includes('margen')) return 'Recomendacion: enfoca promociones en productos y servicios con mejor margen, y revisa gastos operativos para proteger la utilidad.';
    if (text.includes('ventas')) return 'Recomendacion: usa los productos mas vendidos para planificar compras, combos y campanas de venta.';
    return 'Recomendacion: revisa estos indicadores diariamente y toma acciones primero sobre stock, caja y ordenes pendientes.';
  }

  private buildSafePrompt(question: string, insights: string[]) {
    return [
      'Actua como analista de negocio. Usa solo datos agregados y no solicites informacion sensible.',
      `Pregunta: ${question}`,
      `Datos resumidos: ${insights.slice(0, 15).join(' | ')}`,
      'Responde en espanol, claro, profesional y accionable.',
    ].join('\n');
  }

  private buildResponse(answer: string, insights: string[]): InsightResponse {
    return { mode: 'MOCK', answer, insights, generatedAt: new Date().toISOString() };
  }

  private matches(value: string, terms: string[]) {
    return terms.some((term) => value.includes(term));
  }

  private shouldUseExternalProvider() {
    const mode = (this.config.get<string>('AI_MODE') ?? 'mock').toLowerCase();
    return mode === 'real' || mode === 'production' || mode === 'gemini';
  }

  private audit(userId: string, action: string, description: string) {
    return this.prisma.auditLog.create({ data: { userId, module: 'AI_ANALYTICS', action, description, entityType: 'AI' } });
  }
}
