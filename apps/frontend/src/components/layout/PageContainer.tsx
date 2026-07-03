import { PropsWithChildren } from 'react';
import { PageHeader } from '../ui';

interface PageContainerProps extends PropsWithChildren {
  title: string;
  description?: string;
}

export function PageContainer({ title, description, children }: PageContainerProps) {
  return (
    <section className="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-4 px-3 py-4 sm:gap-6 sm:px-6 sm:py-6 lg:px-8">
      <PageHeader title={title} description={description} />
      {children}
    </section>
  );
}
