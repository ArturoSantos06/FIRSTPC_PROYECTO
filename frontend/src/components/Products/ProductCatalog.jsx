import { useContext, useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "/src/firebaseConfig.js";
import ProductCard from "./ProductCard";
import AddProductModal from "./AddProductModal";
import { AuthContext } from "../../context/AuthContext";
import ProductCatalogHeader from "./CatalogHeader";
import ProductCatalogSidebar from "./SideBar/ProductCatalogSidebar";
import ProductCatalogEmptyState from "./EmptyState";
import {
  CATEGORIES,
  TRENDING_BRANDS,
  normalizeText,
  parsePrice,
} from "./SideBar/SideBarData";

const ProductCatalog = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortOrder, setSortOrder] = useState("featured");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsRef = collection(db, "products");
        const snapshot = await getDocs(productsRef);
        const productsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProducts(productsData);
      } catch (error) {
        console.error("Error cargando componentes:", error);
      }
    };

    fetchProducts();
  }, [refreshTrigger]);

  const availableBrands = useMemo(() => {
    const brandCounts = products.reduce((accumulator, product) => {
      const brand = product.brand?.trim();

      if (!brand) {
        return accumulator;
      }

      const normalizedBrand = brand.toUpperCase();
      accumulator.set(normalizedBrand, {
        label: brand,
        count: (accumulator.get(normalizedBrand)?.count || 0) + 1,
      });
      return accumulator;
    }, new Map());

    const prioritized = TRENDING_BRANDS.filter((brand) => brandCounts.has(brand.toUpperCase())).map((brand) => ({
      value: brand.toUpperCase(),
      label: brand,
      count: brandCounts.get(brand.toUpperCase())?.count || 0,
    }));

    const remaining = [...brandCounts.entries()]
      .filter(([brand]) => !TRENDING_BRANDS.some((trendingBrand) => trendingBrand.toUpperCase() === brand))
      .map(([value, metadata]) => ({ value, ...metadata }))
      .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));

    return [...prioritized, ...remaining].slice(0, 10);
  }, [products]);

  const filteredProducts = useMemo(() => {
    const minValue = priceMin === "" ? 0 : Number(priceMin);
    const maxValue = priceMax === "" ? Number.POSITIVE_INFINITY : Number(priceMax);
    const normalizedSearch = search.trim().toLowerCase();
    const activeBrands = new Set(selectedBrands.map((brand) => brand.toUpperCase()));

    const filtered = products.filter((product) => {
      const productName = normalizeText(product.name);
      const productBrand = normalizeText(product.brand);
      const productCategory = normalizeText(product.category);
      const productDescription = normalizeText(product.description);
      const productPrice = parsePrice(product.price);

      const matchesSearch =
        normalizedSearch.length === 0 ||
        productName.includes(normalizedSearch) ||
        productBrand.includes(normalizedSearch) ||
        productCategory.includes(normalizedSearch) ||
        productDescription.includes(normalizedSearch);

      const matchesCategory = selectedCategory ? productCategory === selectedCategory : true;
      const matchesBrands = activeBrands.size > 0 ? activeBrands.has(product.brand?.trim().toUpperCase()) : true;
      const matchesPrice = productPrice >= minValue && productPrice <= maxValue;

      return matchesSearch && matchesCategory && matchesBrands && matchesPrice;
    });

    if (sortOrder === "price-asc") {
      return [...filtered].sort((left, right) => parsePrice(left.price) - parsePrice(right.price));
    }

    if (sortOrder === "price-desc") {
      return [...filtered].sort((left, right) => parsePrice(right.price) - parsePrice(left.price));
    }

    return filtered;
  }, [products, search, selectedCategory, selectedBrands, priceMin, priceMax, sortOrder]);

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedBrands([]);
    setSortOrder("featured");
    setPriceMin("");
    setPriceMax("");
  };

  const toggleBrand = (brand) => {
    setSelectedBrands((currentBrands) =>
      currentBrands.includes(brand) ? currentBrands.filter((currentBrand) => currentBrand !== brand) : [...currentBrands, brand]
    );
  };

  return (
    <section className="relative w-full bg-[linear-gradient(180deg,rgba(248,250,252,0.65),rgba(255,255,255,0.94))] px-4 py-6 font-['Montserrat'] md:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <ProductCatalogHeader
          resultsCount={filteredProducts.length}
          isAdmin={user?.role === "admin"}
          onOpenAddProduct={() => setIsModalOpen(true)}
          onOpenFilters={() => setIsSidebarOpen(true)}
          onResetFilters={resetFilters}
        />

        <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
          <ProductCatalogSidebar
            categories={CATEGORIES}
            availableBrands={availableBrands}
            search={search}
            onSearchChange={setSearch}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedBrands={selectedBrands}
            onToggleBrand={toggleBrand}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
            priceMin={priceMin}
            onPriceMinChange={setPriceMin}
            priceMax={priceMax}
            onPriceMaxChange={setPriceMax}
            onResetFilters={resetFilters}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapsed={() => setIsSidebarCollapsed((currentValue) => !currentValue)}
          />

          <main className="min-w-0">
            <div className="mb-4 flex items-center justify-between rounded-[24px] border border-slate-200/70 bg-white/80 px-4 py-3 shadow-[0_16px_40px_rgba(15,23,42,0.04)] lg:hidden">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">Resultados</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">{filteredProducts.length} componentes</p>
              </div>

              <button
                type="button"
                onClick={resetFilters}
                className="rounded-full border border-slate-200 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500"
              >
                Limpiar
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)
              ) : (
                <ProductCatalogEmptyState onResetFilters={resetFilters} />
              )}
            </div>
          </main>
        </div>
      </div>

      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProductAdded={() => setRefreshTrigger((previousValue) => previousValue + 1)}
      />
    </section>
  );
};

export default ProductCatalog;