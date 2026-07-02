import { BarChart3, Boxes, CreditCard, type LucideIcon } from 'lucide-react';

const benefits: Array<{ title: string; description: string; icon: LucideIcon }> = [
  {
    title: 'Control de ventas y caja',
    description: 'POS, pagos, arqueo y movimientos conectados.',
    icon: CreditCard,
  },
  {
    title: 'Clientes e inventario',
    description: 'Personas, empresas, stock y servicios operativos.',
    icon: Boxes,
  },
  {
    title: 'Reportes, rentabilidad e IA',
    description: 'Indicadores para decidir con informacion real.',
    icon: BarChart3,
  },
];

export function LoginBenefits() {
  return (
    <div className="mt-8 grid gap-3">
      {benefits.map((benefit) => {
        const Icon = benefit.icon;
        return (
          <div key={benefit.title} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.055] p-4 shadow-sm backdrop-blur">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-400/12 text-cyan-100 ring-1 ring-cyan-200/15">
              <Icon size={20} />
            </div>
            <div>
              <p className="text-sm font-black text-white">{benefit.title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-300">{benefit.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
