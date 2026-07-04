import React, { useState, useEffect, useMemo, useContext } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "/src/firebaseConfig.js";
import ProductCard from "./ProductCard";
import AddProductModal from "./AddProductModal";
import { AuthContext } from "../../context/AuthContext";

const CATEGORIES = [
  { id: "procesadores", label: "Procesadores", icon: "🧠" },
  { id: "graficas", label: "Tarjetas de Video", icon: "🎮" },
  { id: "tarjetas madre", label: "Tarjetas Madre", icon: "🔌" },
  { id: "gabinetes", label: "Gabinetes", icon: "🖥️" },
  { id: "enfriamiento", label: "Enfriamiento", icon: "❄️" },
  { id: "ram", label: "Memorias RAM", icon: "⚡" },
  { id: "almacenamiento", label: "Almacenamiento", icon: "💾" },
  { id: "fuentes", label: "Fuentes de Poder", icon: "🔋" },
  { id: "monitores", label: "Monitores", icon: "📺" },
  { id: "computadora", label: "Computadora", icon: "📦" },
  { id: "perifericos", label: "Teclados y Mouses", icon: "🖱️" },
  { id: "audio", label: "Audífonos Gaming", icon: "🎧" },
];

const ProductCatalog = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState([0, 99999]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = 
        product.name?.toLowerCase().includes(search.toLowerCase()) || 
        product.brand?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [products, search, selectedCategory, priceRange]);

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setPriceRange([0, 99999]);
  };

  return (
    <section className="relative w-full max-w-7xl mx-auto px-6 md:px-10 py-6 font-['Montserrat'] bg-transparent">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Catálogo de Hardware</h1>
          <p className="text-sm font-medium text-slate-400">Gestiona y explora todos los componentes de la plataforma</p>
        </div>
        
        {user?.role === 'admin' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="self-start sm:self-center bg-slate-900 hover:bg-[#10B981] text-white text-xs font-bold uppercase tracking-widest px-6 py-3.5 rounded-full transition-all duration-300 shadow-[0_10px_20px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 cursor-pointer"
          >
            <span className="text-sm font-semibold">+</span> Añadir Componente
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 bg-white p-5 rounded-[28px] border border-slate-100 shadow-[0_10px_30px_rgba(100,116,139,0.01)]">
        <div className="relative w-full md:flex-1">
          <span className="absolute left-4 top-3.5 text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Buscar componentes, marcas (AMD, Intel, ASUS)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#10B981] focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/60 p-1.5 rounded-2xl w-full md:w-auto justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-3">Precio MXN:</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
              className="w-20 text-center bg-white border border-slate-200 py-1.5 text-xs font-bold text-slate-700 rounded-xl focus:outline-none focus:border-[#10B981]"
            />
            <span className="text-slate-400 font-bold">-</span>
            <input
              type="number"
              placeholder="Max"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="w-24 text-center bg-white border border-slate-200 py-1.5 text-xs font-bold text-slate-700 rounded-xl focus:outline-none focus:border-[#10B981]"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none snap-x">
        <button
          onClick={() => setSelectedCategory("")}
          className={`px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all snap-start cursor-pointer ${
            selectedCategory === ""
              ? "bg-[#10B981] text-white shadow-[0_8px_20px_rgba(16,185,129,0.25)]"
              : "bg-white text-slate-600 border border-slate-100 hover:border-slate-300 shadow-[0_5px_15px_rgba(0,0,0,0.01)]"
          }`}
        >
          🚀 Todo el Hardware
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap flex items-center gap-2 transition-all snap-start cursor-pointer ${
              selectedCategory === cat.id
                ? "bg-[#10B981] text-white shadow-[0_8px_20px_rgba(16,185,129,0.25)]"
                : "bg-white text-slate-600 border border-slate-100 hover:border-slate-300 shadow-[0_5px_15px_rgba(0,0,0,0.01)]"
            }`}
          >
            <span>{cat.icon}</span> {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="col-span-full text-center py-16 bg-white border border-slate-100 rounded-[32px] p-8">
            <span className="text-4xl">📦</span>
            <h4 className="text-xl font-black text-slate-800 mt-3">No encontramos ese componente</h4>
            <p className="text-sm font-medium text-slate-400 mt-1 max-w-sm mx-auto">
              Intenta reduciendo el rango de precio o seleccionando otra clasificación de hardware.
            </p>
            <button
              onClick={resetFilters}
              className="mt-6 px-6 py-3 bg-slate-900 hover:bg-[#10B981] text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all cursor-pointer"
            >
              Restablecer Criterios
            </button>
          </div>
        )}
      </div>

      <AddProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onProductAdded={() => setRefreshTrigger(prev => prev + 1)}
      />
    </section>
  );
};

export default ProductCatalog;