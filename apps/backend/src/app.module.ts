import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './database/prisma.module';
import { AiAnalyticsModule } from './modules/ai-analytics/ai-analytics.module';
import { AiLocalModule } from './modules/ai-local/ai-local.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { CashModule } from './modules/cash/cash.module';
import { CustomersModule } from './modules/customers/customers.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { DocumentLookupModule } from './modules/document-lookup/document-lookup.module';
import { EcommerceModule } from './modules/ecommerce/ecommerce.module';
import { HealthModule } from './modules/health/health.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PurchasesModule } from './modules/purchases/purchases.module';
import { PublicReceiptsModule } from './modules/public-receipts/public-receipts.module';
import { ProfitabilityModule } from './modules/profitability/profitability.module';
import { QuickServicesModule } from './modules/quick-services/quick-services.module';
import { ReportsModule } from './modules/reports/reports.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { RolesModule } from './modules/roles/roles.module';
import { SalesModule } from './modules/sales/sales.module';
import { ServiceOrdersModule } from './modules/service-orders/service-orders.module';
import { SettingsModule } from './modules/settings/settings.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SunatModule } from './modules/sunat/sunat.module';
import { UsersModule } from './modules/users/users.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/backend/.env', '.env', '../../.env'],
    }),
    PrismaModule,
    UsersModule,
    RolesModule,
    AuthModule,
    HealthModule,
    CashModule,
    CustomersModule,
    InventoryModule,
    SuppliersModule,
    PurchasesModule,
    QuickServicesModule,
    ReportsModule,
    RealtimeModule,
    ProfitabilityModule,
    AuditLogsModule,
    NotificationsModule,
    SettingsModule,
    IntegrationsModule,
    SunatModule,
    WhatsappModule,
    PaymentsModule,
    PublicReceiptsModule,
    AiAnalyticsModule,
    AiLocalModule,
    EcommerceModule,
    SalesModule,
    ServiceOrdersModule,
    DashboardModule,
    DocumentLookupModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
