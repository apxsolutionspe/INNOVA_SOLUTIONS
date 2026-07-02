import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { MainLayout } from '../components/layout/MainLayout';
import { LoginPage } from '../modules/auth/pages/LoginPage';
import { CashPage } from '../modules/cash/pages/CashPage';
import { CustomersPage } from '../modules/customers/pages/CustomersPage';
import { DashboardPage } from '../modules/dashboard/pages/DashboardPage';
import { InventoryPage } from '../modules/inventory/pages/InventoryPage';
import { PosPage } from '../modules/pos/pages/PosPage';
import { PurchaseOrderDetailPage } from '../modules/purchases/pages/PurchaseOrderDetailPage';
import { PurchasesPage } from '../modules/purchases/pages/PurchasesPage';
import { QuickServiceSalesPage } from '../modules/quick-services/pages/QuickServiceSalesPage';
import { QuickServicesPage } from '../modules/quick-services/pages/QuickServicesPage';
import { SalesHistoryPage } from '../modules/sales/pages/SalesHistoryPage';
import { ServiceOrderDetailPage } from '../modules/service-orders/pages/ServiceOrderDetailPage';
import { ServiceOrdersPage } from '../modules/service-orders/pages/ServiceOrdersPage';
import { SettingsPage } from '../modules/settings/pages/SettingsPage';
import { SuppliersPage } from '../modules/suppliers/pages/SuppliersPage';
import { UsersPage } from '../modules/users/pages/UsersPage';
import { AuthorizedRoute } from './routes/AuthorizedRoute';
import { ProtectedRoute } from './routes/ProtectedRoute';

const ReportsPage = lazy(() => import('../modules/reports/pages/ReportsPage').then((module) => ({ default: module.ReportsPage })));
const ProfitabilityPage = lazy(() => import('../modules/profitability/pages/ProfitabilityPage').then((module) => ({ default: module.ProfitabilityPage })));
const AuditLogsPage = lazy(() => import('../modules/audit/pages/AuditLogsPage').then((module) => ({ default: module.AuditLogsPage })));
const IntegrationsPage = lazy(() => import('../modules/integrations/pages/IntegrationsPage').then((module) => ({ default: module.IntegrationsPage })));
const SunatPage = lazy(() => import('../modules/sunat/pages/SunatPage').then((module) => ({ default: module.SunatPage })));
const WhatsappPage = lazy(() => import('../modules/whatsapp/pages/WhatsappPage').then((module) => ({ default: module.WhatsappPage })));
const PaymentsPage = lazy(() => import('../modules/payments/pages/PaymentsPage').then((module) => ({ default: module.PaymentsPage })));
const AiAnalyticsPage = lazy(() => import('../modules/ai-analytics/pages/AiAnalyticsPage').then((module) => ({ default: module.AiAnalyticsPage })));
const EcommercePage = lazy(() => import('../modules/ecommerce/pages/EcommercePage').then((module) => ({ default: module.EcommercePage })));
const OnlineOrdersPage = lazy(() => import('../modules/ecommerce/pages/OnlineOrdersPage').then((module) => ({ default: module.OnlineOrdersPage })));

function RouteLoader() {
  return <div className="p-6 text-sm font-semibold text-slate-500">Cargando modulo...</div>;
}

export function App() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/pos" element={<PosPage />} />
            <Route path="/sales" element={<SalesHistoryPage />} />
            <Route path="/service-orders" element={<ServiceOrdersPage />} />
            <Route path="/service-orders/:id" element={<ServiceOrderDetailPage />} />
            <Route path="/cash" element={<CashPage />} />
            <Route path="/quick-services" element={<QuickServicesPage />} />
            <Route path="/quick-service-sales" element={<QuickServiceSalesPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/purchases" element={<PurchasesPage />} />
            <Route path="/purchases/:id" element={<PurchaseOrderDetailPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route element={<AuthorizedRoute moduleKey="profitability" />}>
              <Route path="/profitability" element={<ProfitabilityPage />} />
            </Route>
            <Route element={<AuthorizedRoute moduleKey="settings" />}>
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route element={<AuthorizedRoute moduleKey="users" />}>
              <Route path="/users" element={<UsersPage />} />
            </Route>
            <Route element={<AuthorizedRoute moduleKey="audit" />}>
              <Route path="/audit" element={<AuditLogsPage />} />
            </Route>
            <Route element={<AuthorizedRoute moduleKey="integrations" />}>
              <Route path="/integrations" element={<IntegrationsPage />} />
            </Route>
            <Route element={<AuthorizedRoute moduleKey="sunat" />}>
              <Route path="/sunat" element={<SunatPage />} />
            </Route>
            <Route element={<AuthorizedRoute moduleKey="whatsapp" />}>
              <Route path="/whatsapp" element={<WhatsappPage />} />
            </Route>
            <Route element={<AuthorizedRoute moduleKey="payments" />}>
              <Route path="/payments" element={<PaymentsPage />} />
            </Route>
            <Route element={<AuthorizedRoute moduleKey="ai-analytics" />}>
              <Route path="/ai-analytics" element={<AiAnalyticsPage />} />
            </Route>
            <Route element={<AuthorizedRoute moduleKey="ecommerce" />}>
              <Route path="/ecommerce" element={<EcommercePage />} />
            </Route>
            <Route element={<AuthorizedRoute moduleKey="online-orders" />}>
              <Route path="/ecommerce/orders" element={<OnlineOrdersPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}
