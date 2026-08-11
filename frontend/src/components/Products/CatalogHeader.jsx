const ProductCatalogHeader = ({ resultsCount, isAdmin, onOpenAddProduct, onOpenFilters, onResetFilters }) => {
  return (
    <>
      <div className="flex items-start justify-between gap-4 lg:hidden">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Catálogo FIRSTPC</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">Explora el inventario con filtros avanzados.</p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              type="button"
              onClick={onOpenAddProduct}
              className="rounded-full bg-[#10B981] px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-[0_14px_28px_rgba(16,185,129,0.24)] transition hover:bg-[#0ea472]"
            >
              + Añadir
            </button>
          )}

          <button
            type="button"
            onClick={onOpenFilters}
            className="rounded-full border border-emerald-200 bg-white px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700 shadow-[0_14px_28px_rgba(15,23,42,0.06)] transition hover:border-emerald-400"
          >
            Filtros
          </button>
        </div>
      </div>

      <div className="mb-5 hidden items-start justify-between gap-4 lg:flex">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Catálogo FIRSTPC</h1>
          <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500">
            Un layout de filtros premium para navegar hardware con más velocidad y menos ruido visual.
          </p>
        </div>

        <div className="flex items-center gap-3">
            <div className="rounded-full border border-slate-200 bg-white px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500 shadow-[0_14px_28px_rgba(15,23,42,0.06)]">
            {resultsCount} resultados
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={onOpenAddProduct}
              className="rounded-full bg-[#10B981] px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-[0_16px_32px_rgba(16,185,129,0.24)] transition hover:bg-[#0ea472]"
            >
              + Añadir Componente
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductCatalogHeader;
