import { useState } from 'react';
import { motion } from 'framer-motion';
import { Boxes, Layers, PackageX, WalletCards } from 'lucide-react';

import { PageContainer } from '../../../components/layout/PageContainer';
import { AdjustStockModal } from '../components/AdjustStockModal';
import { LowStockPanel } from '../components/LowStockPanel';
import { ProductCategoryForm } from '../components/ProductCategoryForm';
import { ProductFilters } from '../components/ProductFilters';
import { ProductForm } from '../components/ProductForm';
import { ProductTable } from '../components/ProductTable';
import { useInventory } from '../hooks/useInventory';
import { AdjustStockPayload, Product, ProductPayload } from '../types/inventory.types';

export function InventoryPage() {
  const inventory = useInventory();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);

  const cards = [
    { label: 'Total productos', value: inventory.summary.productsCount, icon: Boxes, gradient: 'from-brand-blue to-brand-cyan' },
    { label: 'Categorías', value: inventory.summary.categoriesCount, icon: Layers, gradient: 'from-brand-violet to-brand-blue' },
    { label: 'Stock bajo', value: inventory.summary.lowStockCount, icon: PackageX, gradient: 'from-brand-warning to-red-400' },
    { label: 'Valor estimado', value: `S/ ${inventory.summary.inventoryValue.toFixed(2)}`, icon: WalletCards, gradient: 'from-brand-success to-emerald-400' },
  ];

  const handleSaveProduct = async (payload: ProductPayload) => {
    await inventory.saveProduct(payload, editingProduct?.id);
    setEditingProduct(null);
    setIsProductFormOpen(false);
  };

  const handleAdjustStock = async (payload: AdjustStockPayload) => {
    if (!stockProduct) return;
    await inventory.adjustStock(stockProduct.id, payload);
    setStockProduct(null);
  };

  return (
    <PageContainer title="Inventario" description="Gestión base de productos y stock para preparar POS y ventas.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.article key={card.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">{card.label}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-950">{card.value}</p>
                </div>
                <div className={`grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-br ${card.gradient} text-white`}>
                  <Icon size={22} />
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      <ProductFilters
        search={inventory.search}
        categoryId={inventory.categoryId}
        categories={inventory.categories}
        resultCount={inventory.products.length}
        onSearchChange={inventory.setSearch}
        onCategoryChange={inventory.setCategoryId}
        onCreate={() => setIsProductFormOpen(true)}
        onCreateCategory={() => setIsCategoryFormOpen(true)}
      />

      {inventory.message ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{inventory.message}</div> : null}
      {inventory.error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{inventory.error}</div> : null}

      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <ProductTable
          products={inventory.products}
          isLoading={inventory.isLoading}
          onEdit={(product) => {
            setEditingProduct(product);
            setIsProductFormOpen(true);
          }}
          onDeactivate={(product) => void inventory.deactivateProduct(product.id)}
          onAdjustStock={setStockProduct}
        />
        <LowStockPanel products={inventory.lowStockProducts} />
      </div>

      {isProductFormOpen ? <ProductForm product={editingProduct} categories={inventory.categories} onSubmit={handleSaveProduct} onClose={() => { setEditingProduct(null); setIsProductFormOpen(false); }} /> : null}
      {isCategoryFormOpen ? <ProductCategoryForm onSubmit={async (payload) => { await inventory.createCategory(payload); setIsCategoryFormOpen(false); }} onClose={() => setIsCategoryFormOpen(false)} /> : null}
      {stockProduct ? <AdjustStockModal product={stockProduct} onSubmit={handleAdjustStock} onClose={() => setStockProduct(null)} /> : null}
    </PageContainer>
  );
}

