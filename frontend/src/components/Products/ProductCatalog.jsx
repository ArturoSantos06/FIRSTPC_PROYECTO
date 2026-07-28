import { useContext, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { db, storage } from "/src/firebaseConfig.js";
import ProductCard from "./ProductCard";
import AddProductModal from "./AddProductModal"; 
import { AuthContext } from "../../context/AuthContext";
import ProductCatalogHeader from "./CatalogHeader";
import ProductCatalogSidebar from "./SideBar/ProductCatalogSidebar";
import ProductCatalogEmptyState from "./EmptyState";
import DeleteProductModal from "./DeleteProductModal";
import {
  CATEGORIES,
  TRENDING_BRANDS,
  normalizeText,
  parsePrice,
} from "./SideBar/SideBarData";

const CATEGORY_ALIASES = {
  "tarjetas-de-video": ["tarjetas-de-video", "tarjetas video", "graficas", "gráficas"],
  "tarjetas-madre": ["tarjetas-madre", "tarjetas madre"],
  "memorias-ram": ["memorias-ram", "memorias ram", "ram"],
  "fuentes-de-poder": ["fuentes-de-poder", "fuentes de poder", "fuentes"],
  teclados: ["teclados", "teclado"],
  mouses: ["mouses", "mouse", "raton", "ratón"],
  "audifonos-gaming": ["audifonos-gaming", "audífonos gaming", "audio"],
};

const normalizeCategory = (value) =>
  normalizeText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const getProductImages = (product) => [
  ...(Array.isArray(product?.images) ? product.images : []),
  product?.image,
].filter(Boolean).filter((image, index, images) => images.indexOf(image) === index);

const deleteProductImages = async (product) => {
  await Promise.all(getProductImages(product).map(async (image) => {
    try {
      await deleteObject(ref(storage, image));
    } catch (error) {
      if (!['storage/object-not-found', 'storage/invalid-url'].includes(error?.code)) throw error;
    }
  }));
};

const ProductCatalog = () => {
  const { user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get("categoria")?.split(",").filter(Boolean) || []);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortOrder, setSortOrder] = useState("featured");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); 
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  
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
      if (!brand) return accumulator;
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

    return [...prioritized, ...remaining];
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
      const productDescription = normalizeText(
        typeof product.description === "string"
          ? product.description
          : `${product.description?.title || ""} ${product.description?.content || ""}`
      );
      const productPrice = parsePrice(product.price);

      const matchesSearch =
        normalizedSearch.length === 0 ||
        productName.includes(normalizedSearch) ||
        productBrand.includes(normalizedSearch) ||
        productCategory.includes(normalizedSearch) ||
        productDescription.includes(normalizedSearch);

      const matchesCategory = selectedCategory.length > 0
        ? selectedCategory.some((selected) => (CATEGORY_ALIASES[selected] || [selected]).some((category) => normalizeCategory(category) === normalizeCategory(productCategory)))
        : true;
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
    setSelectedCategory([]);
    setSelectedBrands([]);
    setSortOrder("featured");
    setPriceMin("");
    setPriceMax("");
    setSearchParams({}, { replace: true });
  };

  useEffect(() => {
    setSelectedCategory(searchParams.get("categoria")?.split(",").filter(Boolean) || []);
  }, [searchParams]);

  const handleCategoryChange = (category) => {
    setSelectedCategory((currentCategories) => {
      const nextCategories = currentCategories.includes(category)
        ? currentCategories.filter((currentCategory) => currentCategory !== category)
        : [...currentCategories, category];
      const nextParams = new URLSearchParams(searchParams);
      if (nextCategories.length > 0) nextParams.set("categoria", nextCategories.join(","));
      else nextParams.delete("categoria");
      setSearchParams(nextParams, { replace: true });
      return nextCategories;
    });
  };

  const toggleBrand = (brand) => {
    setSelectedBrands((currentBrands) =>
      currentBrands.includes(brand) ? currentBrands.filter((currentBrand) => currentBrand !== brand) : [...currentBrands, brand]
    );
  };

  const openEditProductModal = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const closeEditProductModal = () => {
    setIsEditModalOpen(false);
    setSelectedProduct(null);
  };

  const handleActionSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const openDeleteProductModal = (product) => {
    if (user?.role !== "admin") return;
    setDeleteError("");
    setProductToDelete(product);
  };

  const closeDeleteProductModal = () => {
    if (!isDeleting) setProductToDelete(null);
  };

  const handleDeleteProduct = async () => {
    if (user?.role !== "admin" || !productToDelete?.id) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      await deleteProductImages(productToDelete);
      await deleteDoc(doc(db, "products", productToDelete.id));
      setProductToDelete(null);
      setIsEditModalOpen(false);
      setSelectedProduct(null);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Error eliminando producto:", error);
      setDeleteError("No se pudo eliminar el producto. Intenta nuevamente.");
    } finally {
      setIsDeleting(false);
    }
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
            onCategoryChange={handleCategoryChange}
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
              <button type="button" onClick={resetFilters} className="rounded-full border border-slate-200 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
                Limpiar
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isAdmin={user?.role === "admin"}
                    onEditProduct={openEditProductModal}
                  />
                ))
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
        onActionSuccess={handleActionSuccess}
      />

      {user?.role === "admin" && <DeleteProductModal product={productToDelete} loading={isDeleting} errorMessage={deleteError} onClose={closeDeleteProductModal} onConfirm={handleDeleteProduct} />}

      <AddProductModal
        isOpen={isEditModalOpen}
        onClose={closeEditProductModal}
        product={selectedProduct}
        onActionSuccess={handleActionSuccess}
        onDeleteProduct={openDeleteProductModal}
      />
    </section>
  );
};

export default ProductCatalog;
