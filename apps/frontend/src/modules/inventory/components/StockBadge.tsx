interface StockBadgeProps {
  stock: number;
  minStock: number;
}

export function StockBadge({ stock, minStock }: StockBadgeProps) {
  const className =
    stock <= 0
      ? 'bg-red-50 text-red-700 border-red-200'
      : stock <= minStock
        ? 'bg-orange-50 text-orange-700 border-orange-200'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${className}`}>
      {stock}
    </span>
  );
}
