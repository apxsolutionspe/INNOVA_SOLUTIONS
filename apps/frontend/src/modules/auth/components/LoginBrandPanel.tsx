import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles } from 'lucide-react';

import { LoginBenefits } from './LoginBenefits';

export function LoginBrandPanel() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55 }}
      className="relative z-10 text-white"
    >
      <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-bold text-cyan-50 shadow-sm backdrop-blur">
        <Sparkles size={16} />
        Gestión multiservicios tecnológicos
      </div>

      <h1 className="mt-7 max-w-2xl text-4xl font-black leading-tight tracking-tight sm:text-5xl xl:text-6xl">
        Innova Solutions
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
        Sistema integral para operaciones, ventas, servicios, inventario y rentabilidad empresarial.
      </p>

      <LoginBenefits />

      <div className="mt-8 inline-flex items-center gap-2 rounded-2xl border border-emerald-300/15 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-100">
        <ShieldCheck size={18} />
        Autenticacion protegida para usuarios autorizados.
      </div>
    </motion.section>
  );
}

