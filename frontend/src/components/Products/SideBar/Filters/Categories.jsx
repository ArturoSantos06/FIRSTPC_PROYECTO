import { renderCategoryIcon } from "../SideBarData";

const ProductCatalogSidebarCategories = ({ categories, selectedCategory, onCategoryChange }) => {
  return (
    <div className="rounded-[24px] border border-slate-200/70 bg-slate-50/70 p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition hover:border-emerald-200/80 hover:bg-white">
      <div className="flex items-center justify-between gap-3">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-[0.32em] text-slate-400">Categorías</label>
          <p className="mt-1 text-xs text-slate-500">12 familias del inventario.</p>
        </div>

        <button
          type="button"
          onClick={() => onCategoryChange("")}
          className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-600 transition hover:text-emerald-700"
        >
          Todo
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {categories.map((category) => {
          const isActive = selectedCategory === category.id;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onCategoryChange(category.id)}
              className={`group flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all duration-200 ${
                isActive
                  ? "border-emerald-500/30 bg-emerald-50 text-emerald-700 shadow-[0_14px_24px_rgba(16,185,129,0.08)]"
                  : "border-transparent bg-white text-slate-600 hover:border-slate-200 hover:bg-white hover:text-slate-900"
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-2xl border text-[10px] font-black tracking-[0.28em] ${
                  isActive ? "border-emerald-200 bg-white text-emerald-600" : "border-slate-200 bg-slate-50 text-slate-500"
                }`}
              >
                {renderCategoryIcon(category.icon)}
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold leading-tight">{category.label}</span>
                <span className="block text-[11px] text-slate-400 group-hover:text-slate-500">Filtrar por familia</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProductCatalogSidebarCategories;