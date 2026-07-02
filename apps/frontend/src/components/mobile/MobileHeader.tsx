export function MobileHeader({ title }: { title: string }) {
  return <div className="lg:hidden"><p className="text-xs font-bold uppercase text-slate-400">{title}</p></div>;
}
