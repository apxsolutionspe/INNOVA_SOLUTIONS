import {
  AlertTriangle,
  Boxes,
  ClipboardList,
  DollarSign,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import { AlertsPanel } from "../components/AlertsPanel";
import { DashboardChartCard } from "../components/DashboardChartCard";
import { DashboardErrorState } from "../components/DashboardErrorState";
import { DashboardHeader } from "../components/DashboardHeader";
import { DashboardLoadingState } from "../components/DashboardLoadingState";
import { KPIGrid } from "../components/KPIGrid";
import { OperationsSummary } from "../components/OperationsSummary";
import { QuickActionsPanel } from "../components/QuickActionsPanel";
import { useDashboardSummary } from "../hooks/useDashboardSummary";
import { ChartDatum, DashboardAlert, KPIStat } from "../types/dashboard.types";

const formatCurrency = (value: number) => `S/ ${value.toFixed(2)}`;

export function DashboardPage() {
  const { summary, isLoading, error, refresh } = useDashboardSummary();

  const digitalPayments =
    summary.totalYapeToday +
    summary.totalPlinToday +
    summary.totalTransferToday;
  const stockCritical = summary.lowStockCount + summary.productsToRestock;
  const profitTone = summary.netProfitEstimated < 0 ? "red" : "green";

  const kpis: KPIStat[] = [
    {
      label: "Ingresos del dia",
      value: formatCurrency(summary.incomeToday),
      description: `${summary.salesToday} ventas registradas hoy`,
      icon: DollarSign,
      tone: "green",
    },
    {
      label: "Ingresos del mes",
      value: formatCurrency(summary.incomeMonth),
      description: "Acumulado comercial del periodo",
      icon: TrendingUp,
      tone: "blue",
    },
    {
      label: "Ventas del dia",
      value: summary.salesToday,
      description: `${summary.productsSoldToday} productos vendidos`,
      icon: ShoppingCart,
      tone: "cyan",
    },
    {
      label: "Caja actual",
      value: summary.currentCashStatus === "OPEN" ? "Abierta" : "Cerrada",
      description: `Neto del dia ${formatCurrency(summary.netCashToday)}`,
      icon: WalletCards,
      tone: summary.currentCashStatus === "OPEN" ? "green" : "slate",
    },
    {
      label: "Ordenes pendientes",
      value: summary.serviceOrdersPending,
      description: `${summary.serviceOrdersInProgress} en proceso, ${summary.serviceOrdersReady} listas`,
      icon: ClipboardList,
      tone: summary.serviceOrdersPending > 0 ? "violet" : "green",
    },
    {
      label: "Stock critico",
      value: stockCritical,
      description: `${summary.lowStockCount} bajo minimo, ${summary.productsToRestock} por reponer`,
      icon: Boxes,
      tone: stockCritical > 0 ? "orange" : "green",
    },
    {
      label: "Compras pendientes",
      value: summary.pendingPurchases,
      description: `${summary.purchasesToday} compras creadas hoy`,
      icon: ShoppingBag,
      tone: summary.pendingPurchases > 0 ? "orange" : "green",
    },
    {
      label: "Utilidad estimada",
      value: formatCurrency(summary.netProfitEstimated),
      description: `Margen estimado ${summary.profitMarginEstimated.toFixed(1)}%`,
      icon: TrendingUp,
      tone: profitTone,
    },
  ];

  const revenueData: ChartDatum[] = [
    { name: "Ventas", value: summary.incomeToday, tone: "#2563EB" },
    {
      name: "Serv. rapidos",
      value: summary.quickServicesIncomeToday,
      tone: "#06B6D4",
    },
    { name: "Efectivo", value: summary.totalCashToday, tone: "#10B981" },
    { name: "Digital", value: digitalPayments, tone: "#7C3AED" },
    { name: "Gastos", value: summary.expensesToday, tone: "#EF4444" },
  ];

  const operationsData: ChartDatum[] = [
    {
      name: "Pendientes",
      value: summary.serviceOrdersPending,
      tone: "#2563EB",
    },
    {
      name: "En proceso",
      value: summary.serviceOrdersInProgress,
      tone: "#7C3AED",
    },
    { name: "Listas", value: summary.serviceOrdersReady, tone: "#10B981" },
    { name: "Stock crit.", value: stockCritical, tone: "#F97316" },
    { name: "Compras", value: summary.pendingPurchases, tone: "#EF4444" },
  ];

  const alerts: DashboardAlert[] = [
    {
      label: "Stock bajo",
      description: "Productos que requieren reposicion",
      value: stockCritical,
      severity: stockCritical > 0 ? "warning" : "success",
      icon: Boxes,
      path: "/inventory",
      isVisible: stockCritical > 0,
    },
    {
      label: "Ordenes pendientes",
      description: "Equipos por diagnosticar o atender",
      value: summary.serviceOrdersPending,
      severity: summary.serviceOrdersPending > 0 ? "info" : "success",
      icon: ClipboardList,
      path: "/service-orders",
      isVisible: summary.serviceOrdersPending > 0,
    },
    {
      label: "Compras pendientes",
      description: "Órdenes de compra sin recepción completa",
      value: summary.pendingPurchases,
      severity: summary.pendingPurchases > 0 ? "warning" : "success",
      icon: ShoppingBag,
      path: "/purchases",
      isVisible: summary.pendingPurchases > 0,
    },
    {
      label: "Diferencia de caja",
      description: "Revisar cierre o conciliacion",
      value: formatCurrency(Math.abs(summary.cashDifference)),
      severity: Math.abs(summary.cashDifference) > 0 ? "danger" : "success",
      icon: AlertTriangle,
      path: "/cash",
      isVisible: Math.abs(summary.cashDifference) > 0,
    },
    {
      label: "Notificaciones criticas",
      description: "Alertas internas de prioridad alta",
      value: summary.criticalNotifications,
      severity: summary.criticalNotifications > 0 ? "danger" : "success",
      icon: AlertTriangle,
      path: "/dashboard",
      isVisible: summary.criticalNotifications > 0,
    },
  ];

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <DashboardHeader isLoading={isLoading} onRefresh={() => void refresh()} />

      {error ? <DashboardErrorState message={error} /> : null}
      {isLoading ? (
        <DashboardLoadingState />
      ) : (
        <KPIGrid metrics={kpis} isLoading={isLoading} />
      )}

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
        <DashboardChartCard
          title="Flujo del negocio"
          description="Ingresos, caja y gastos relevantes del dia."
          data={revenueData}
          valuePrefix="S/ "
        />
        <AlertsPanel alerts={alerts} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <DashboardChartCard
          title="Carga operativa"
          description="Pendientes clave por ordenes, inventario y compras."
          data={operationsData}
        />
        <QuickActionsPanel />
      </div>

      <OperationsSummary summary={summary} />
    </section>
  );
}

