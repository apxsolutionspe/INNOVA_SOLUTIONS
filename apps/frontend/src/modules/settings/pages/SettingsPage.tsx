import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, FileCheck2, Globe, MessageCircle, Plug, ShieldCheck, Store, Wallet, type LucideIcon } from 'lucide-react';

import { PageContainer } from '../../../components/layout/PageContainer';
import { BusinessSettingsForm } from '../components/BusinessSettingsForm';
import { TaxSettingsForm } from '../components/TaxSettingsForm';

type SettingsTab = 'general' | 'business' | 'security' | 'fiscal' | 'integrations' | 'whatsapp' | 'ecommerce';

type TabConfig = {
  id: SettingsTab;
  label: string;
};

type AccessCard = {
  title: string;
  description: string;
  path: string;
  icon: LucideIcon;
  badge: string;
};

const tabs: TabConfig[] = [
  { id: 'general', label: 'General' },
  { id: 'business', label: 'Empresa' },
  { id: 'security', label: 'Seguridad' },
  { id: 'fiscal', label: 'Fiscal/SUNAT' },
  { id: 'integrations', label: 'Integraciones' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'ecommerce', label: 'eCommerce' },
];

const accessCards: Record<Exclude<SettingsTab, 'general' | 'business' | 'security'>, AccessCard> = {
  fiscal: {
    title: 'Configuración fiscal y SUNAT',
    description: 'Gestiona documentos, modo de prueba/sandbox y preparación de comprobantes fiscales.',
    path: '/sunat',
    icon: FileCheck2,
    badge: 'Fiscal',
  },
  integrations: {
    title: 'Centro de integraciones',
    description: 'Administra proveedores externos, pruebas de conexión y estados de integracion.',
    path: '/integrations',
    icon: Plug,
    badge: 'Admin',
  },
  whatsapp: {
    title: 'WhatsApp Cloud API',
    description: 'Configura plantillas, pruebas de envío y trazabilidad de mensajes del sistema.',
    path: '/whatsapp',
    icon: MessageCircle,
    badge: 'Mensajeria',
  },
  ecommerce: {
    title: 'eCommerce interno',
    description: 'Revisa catálogo web, pedidos online y preparación futura de tienda pública.',
    path: '/ecommerce',
    icon: Store,
    badge: 'Futuro',
  },
};

function SettingsAccessCard({ card }: { card: AccessCard }) {
  const Icon = card.icon;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-brand-blue">
          <Icon size={21} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-black text-slate-950">{card.title}</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-slate-500">
              {card.badge}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
          <Link
            to={card.path}
            className="mt-4 inline-flex h-10 items-center rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-brand-blue"
          >
            Abrir módulo
          </Link>
        </div>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  return (
    <PageContainer title="Configuración" description="Parámetros del negocio, seguridad e integraciones internas.">
      <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`h-10 shrink-0 rounded-xl px-4 text-sm font-bold transition ${
                activeTab === tab.id ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'general' ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-50 text-cyan-700">
              <Building2 size={21} />
            </div>
            <h2 className="mt-4 text-base font-black text-slate-950">Operación del negocio</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Centraliza datos de empresa, comprobantes, canales de pago y configuraciones internas.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-violet-50 text-violet-700">
              <Plug size={21} />
            </div>
            <h2 className="mt-4 text-base font-black text-slate-950">Integraciones internas</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">SUNAT, WhatsApp, pagos online y eCommerce quedan disponibles como opciones internas.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <ShieldCheck size={21} />
            </div>
            <h2 className="mt-4 text-base font-black text-slate-950">Acceso administrativo</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Usuarios, auditoría y configuración se mantienen protegidos para administradores.</p>
          </div>
        </div>
      ) : null}

      {activeTab === 'business' ? <BusinessSettingsForm /> : null}

      {activeTab === 'security' ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700">
              <ShieldCheck size={21} />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-950">Seguridad y permisos</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                La administración de usuarios, roles y auditoría permanece separada para mantener trazabilidad y control de accesos.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to="/users" className="inline-flex h-10 items-center rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-brand-blue">
                  Gestionar usuarios
                </Link>
                <Link to="/audit" className="inline-flex h-10 items-center rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:border-brand-blue hover:text-brand-blue">
                  Ver auditoría
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === 'fiscal' ? (
        <div className="grid gap-4">
          <TaxSettingsForm />
          <SettingsAccessCard card={accessCards.fiscal} />
        </div>
      ) : null}
      {activeTab === 'integrations' ? <SettingsAccessCard card={accessCards.integrations} /> : null}
      {activeTab === 'whatsapp' ? <SettingsAccessCard card={accessCards.whatsapp} /> : null}
      {activeTab === 'ecommerce' ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
          <SettingsAccessCard card={accessCards.ecommerce} />
          <Link
            to="/ecommerce/orders"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-blue hover:shadow-md"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-50 text-cyan-700">
              <Globe size={21} />
            </div>
            <h2 className="mt-4 text-base font-black text-slate-950">Pedidos online</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Acceso directo al historial de pedidos web preparados para fases futuras.</p>
          </Link>
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-600">
        <Wallet className="mr-2 inline-block text-brand-blue" size={18} />
        WhatsApp sigue disponible en el flujo de comprobantes del POS. SUNAT, eCommerce e Integraciones quedan como accesos internos de configuración.
      </div>
    </PageContainer>
  );
}


