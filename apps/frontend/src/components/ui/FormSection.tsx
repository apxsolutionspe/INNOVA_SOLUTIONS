import { PropsWithChildren } from 'react';
import { Card } from './Card';

export function FormSection({ title, description, children }: PropsWithChildren<{ title: string; description?: string }>) {
  return (
    <Card className="p-4">
      <div className="mb-4">
        <h3 className="text-sm font-black text-slate-950">{title}</h3>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      {children}
    </Card>
  );
}
