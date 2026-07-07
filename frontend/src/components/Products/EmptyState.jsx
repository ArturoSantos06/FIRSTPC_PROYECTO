const ProductCatalogEmptyState = ({ onResetFilters }) => {
  return (
    <div className="col-span-full rounded-[32px] border border-dashed border-slate-200 bg-white/85 p-10 text-center shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-500">⌁</div>
      <h4 className="mt-4 text-xl font-black text-slate-900">No encontramos componentes con esos filtros</h4>
      <p className="mx-auto mt-2 max-w-md text-sm font-medium text-slate-500">
        Ajusta marcas, rango de presupuesto u ordenamiento para recuperar resultados.
      </p>
      <button
        type="button"
        onClick={onResetFilters}
        className="mt-6 rounded-full bg-slate-900 px-6 py-3 text-xs font-bold uppercase tracking-[0.3em] text-white transition hover:bg-emerald-500"
      >
        Restablecer filtros
      </button>
    </div>
  );
};

export default ProductCatalogEmptyState;