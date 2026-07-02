import { PropsWithChildren } from 'react';
import { PageHeader } from '../ui';

interface PageContainerProps extends PropsWithChildren {
  title: string;
  description?: string;
}

export function PageContainer({ title, description, children }: PageContainerProps) {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <PageHeader title={title} description={description} />
      {children}
    </section>
  );
}
