const ProductCatalogSidebarReset = ({ onResetFilters }) => {
  return (
    <button
      type="button"
      onClick={onResetFilters}
      className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-xs font-bold uppercase tracking-[0.3em] text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700"
    >
      Limpiar filtros
    </button>
  );
};

export default ProductCatalogSidebarReset;