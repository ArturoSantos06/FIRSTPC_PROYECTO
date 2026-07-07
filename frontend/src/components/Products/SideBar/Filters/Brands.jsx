const ProductCatalogSidebarBrands = ({ availableBrands, selectedBrands, onToggleBrand }) => {
  return (
    <div className="rounded-[24px] border border-slate-200/70 bg-slate-50/70 p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition hover:border-emerald-200/80 hover:bg-white">
      <label className="text-[11px] font-bold uppercase tracking-[0.32em] text-slate-400">Marcas</label>
      <div className="mt-4 space-y-2">
        {availableBrands.length > 0 ? (
          availableBrands.map((brand) => {
            const isChecked = selectedBrands.includes(brand.value);

            return (
              <label
                key={brand.value}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-3 py-3 transition ${
                  isChecked ? "border-emerald-500/30 bg-emerald-50" : "border-transparent bg-white hover:border-slate-200"
                }`}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleBrand(brand.value)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-800">{brand.label}</span>
                    <span className="block text-[11px] text-slate-400">{brand.count} productos</span>
                  </span>
                </span>
                <span className={`h-2.5 w-2.5 rounded-full ${isChecked ? "bg-emerald-500" : "bg-slate-200"}`} />
              </label>
            );
          })
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
            Las marcas aparecerán aquí cuando se cargue el inventario.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCatalogSidebarBrands;