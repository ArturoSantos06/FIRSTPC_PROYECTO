const ProductCatalogSidebarSearch = ({ search, onSearchChange }) => {
  return (
    <div className="rounded-[24px] border border-slate-200/70 bg-slate-50/70 p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition hover:border-emerald-200/80 hover:bg-white">
      <label className="text-[11px] font-bold uppercase tracking-[0.32em] text-slate-400">Buscar</label>
      <div className="relative mt-3">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
        <input
          type="text"
          placeholder="Procesadores, ASUS, RTX 4090..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white/95 py-3 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500/70 focus:bg-white"
        />
      </div>
    </div>
  );
};

export default ProductCatalogSidebarSearch;