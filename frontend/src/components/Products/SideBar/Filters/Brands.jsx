import { useState } from "react";

const ProductCatalogSidebarBrands = ({ availableBrands, selectedBrands, onToggleBrand }) => {
  const [showAll, setShowAll] = useState(false);
  const visibleBrands = showAll ? availableBrands : availableBrands.slice(0, 10);

  return (
    <div className="rounded-[24px] border border-slate-200/70 bg-slate-50/70 p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition hover:border-emerald-200/80 hover:bg-white">
      <label className="text-[11px] font-bold uppercase tracking-[0.32em] text-slate-400">Marcas</label>
      <div className="mt-4 grid grid-cols-2 gap-1.5">
        {availableBrands.length > 0 ? (
          visibleBrands.map((brand) => {
            const isChecked = selectedBrands.includes(brand.value);

            return (
              <button
                type="button"
                key={brand.value}
                aria-pressed={isChecked}
                onClick={() => onToggleBrand(brand.value)}
                className={`flex min-w-0 cursor-pointer items-center justify-between gap-1.5 rounded-xl border px-2 py-2 transition ${
                  isChecked ? "border-emerald-500/30 bg-emerald-50" : "border-transparent bg-white hover:border-slate-200"
                }`}
              >
                <span className="whitespace-nowrap text-left text-[10px] font-bold text-slate-800">{brand.label}</span>
                <span className={`shrink-0 text-[9px] font-bold ${isChecked ? "text-emerald-600" : "text-slate-400"}`}>{brand.count}</span>
              </button>
            );
          })
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
            Las marcas aparecerán aquí cuando se cargue el inventario.
          </p>
        )}
      </div>
      {availableBrands.length > 10 && (
        <button
          type="button"
          onClick={() => setShowAll((currentValue) => !currentValue)}
          className="mt-3 w-full rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700 transition hover:bg-emerald-100"
        >
          {showAll ? "Ver menos" : `Ver más`}
        </button>
      )}
    </div>
  );
};

export default ProductCatalogSidebarBrands;