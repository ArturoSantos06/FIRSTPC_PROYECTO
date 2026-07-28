import Search from "./Filters/Search";
import Categories from "./Filters/Categories";
import Brands from "./Filters/Brands";
import Sort from "./Filters/Sort";
import Budget from "./Filters/Budget";
import Reset from "./Filters/Reset";

const ProductCatalogSidebar = ({
  categories,
  availableBrands,
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedBrands,
  onToggleBrand,
  sortOrder,
  onSortOrderChange,
  priceMin,
  onPriceMinChange,
  priceMax,
  onPriceMaxChange,
  onResetFilters,
  isOpen,
  onClose,
}) => {
  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[88vw] max-w-[420px] transform flex-col overflow-hidden border-r border-slate-200/80 bg-white/95 p-4 backdrop-blur-xl transition-transform duration-300 lg:inset-auto lg:sticky lg:top-28 lg:z-auto lg:flex lg:h-[calc(100vh-12rem)] lg:max-h-[calc(100vh-12rem)] lg:w-[360px] lg:max-w-none lg:rounded-[32px] lg:border lg:shadow-[0_28px_90px_rgba(15,23,42,0.08)] ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-[28px] bg-[linear-gradient(180deg,rgba(248,250,252,0.9),rgba(255,255,255,0.98))] p-3 lg:p-4">
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <span className="text-xs font-bold uppercase tracking-[0.32em] text-slate-400">Filtros</span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-3 py-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-500"
            >
              Cerrar
            </button>
          </div>

          <div>
            <div className="flex flex-col">

              <div className="mt-6 space-y-6 pr-1">
                <Search search={search} onSearchChange={onSearchChange} />
                <Categories
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={onCategoryChange}
                />
                <Brands
                  availableBrands={availableBrands}
                  selectedBrands={selectedBrands}
                  onToggleBrand={onToggleBrand}
                />
                <Sort sortOrder={sortOrder} onSortOrderChange={onSortOrderChange} />
                <Budget
                  priceMin={priceMin}
                  onPriceMinChange={onPriceMinChange}
                  priceMax={priceMax}
                  onPriceMaxChange={onPriceMaxChange}
                />
                <Reset onResetFilters={onResetFilters} />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {isOpen && (
        <button
          type="button"
          aria-label="Cerrar filtros"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm lg:hidden"
        />
      )}
    </>
  );
};

export default ProductCatalogSidebar;