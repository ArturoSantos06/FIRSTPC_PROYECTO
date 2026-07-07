/* eslint-disable react/prop-types */

const ProductCatalogSidebarBudget = ({ priceMin, onPriceMinChange, priceMax, onPriceMaxChange }) => {
  return (
    <div className="rounded-[24px] border border-slate-200/70 bg-slate-50/70 p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition hover:border-emerald-200/80 hover:bg-white">
      <label className="text-[11px] font-bold uppercase tracking-[0.32em] text-slate-400">Presupuesto MXN</label>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <input
          type="number"
          min="0"
          placeholder="Mín"
          value={priceMin}
          onChange={(event) => onPriceMinChange(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500/70"
        />
        <input
          type="number"
          min="0"
          placeholder="Máx"
          value={priceMax}
          onChange={(event) => onPriceMaxChange(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500/70"
        />
      </div>
    </div>
  );
};

export default ProductCatalogSidebarBudget;