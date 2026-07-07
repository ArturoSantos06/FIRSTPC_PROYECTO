import { SORT_OPTIONS } from "../SideBarData";

const ProductCatalogSidebarSort = ({ sortOrder, onSortOrderChange }) => {
  return (
    <div className="rounded-[24px] border border-slate-200/70 bg-slate-50/70 p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition hover:border-emerald-200/80 hover:bg-white">
      <label className="text-[11px] font-bold uppercase tracking-[0.32em] text-slate-400">Ordenar precios</label>
      <div className="mt-3 grid grid-cols-1 gap-2">
        <select
          value={sortOrder}
          onChange={(event) => onSortOrderChange(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500/70"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ProductCatalogSidebarSort;