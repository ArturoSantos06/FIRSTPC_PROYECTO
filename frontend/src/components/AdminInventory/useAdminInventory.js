import { useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { AlertTriangle, Check } from "lucide-react";
import { db } from "../../firebaseConfig";
import { DEFAULT_CATEGORIES, subscribeToCategories } from "../../services/categoryService";

const PRODUCT_COLLECTION = "products";
const DEFAULT_INVENTORY_CATEGORIES = DEFAULT_CATEGORIES.map(({ slug, name }) => [slug, name]);
const normalize = (value) => String(value ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");
const categoryMatches = (productCategory, selectedCategory) => !selectedCategory || normalize(productCategory) === normalize(selectedCategory);
export const getStock = (product) => Math.max(0, Number(product.stock) || 0);
const getImage = (product) => product.images?.[0] || product.image || "https://via.placeholder.com/160?text=FIRSTPC";
const money = (value) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(Number(value) || 0);
const stockState = (stock) => stock === 0 ? { label: "Sin existencias", detail: "Agotado", badgeColor: "bg-red-50 text-red-700 border-red-200", icon: AlertTriangle } : stock <= 4 ? { label: "Stock bajo", detail: "¡Quedan pocas unidades!", badgeColor: "bg-amber-50 text-amber-700 border-amber-200", icon: AlertTriangle } : { label: "Disponible", detail: "Disponibilidad normal", badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: Check };

const useAdminInventory = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalProduct, setModalProduct] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [categories, setCategories] = useState(DEFAULT_INVENTORY_CATEGORIES);

  useEffect(() => subscribeToCategories((items) => {
    if (items.length) setCategories(items.map(({ slug, name }) => [slug, name]));
  }, (snapshotError) => console.error("Error cargando categorías del inventario:", snapshotError)), []);

  useEffect(() => onSnapshot(collection(db, PRODUCT_COLLECTION), (snapshot) => {
    setProducts(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    setLoading(false); setError("");
  }, (snapshotError) => {
    console.error("Error cargando inventario:", snapshotError);
    setError("No se pudo conectar con Firebase Firestore."); setLoading(false);
  }), []);

  const filteredProducts = useMemo(() => {
    const query = normalize(search);
    return products.filter((product) => (!query || normalize(`${product.name} ${product.sku} ${product.mpn}`).includes(query)) && categoryMatches(product.category, category) && (!criticalOnly || getStock(product) <= 4)).sort((left, right) => getStock(left) - getStock(right));
  }, [products, search, category, criticalOnly]);

  const counts = useMemo(() => products.reduce((result, product) => { const stock = getStock(product); result.total += 1; if (stock === 0) result.out += 1; else if (stock <= 4) result.low += 1; else result.available += 1; return result; }, { total: 0, out: 0, low: 0, available: 0 }), [products]);

  const saveProduct = async (values) => {
    setSavingId(modalProduct.id);
    try { await updateDoc(doc(db, PRODUCT_COLLECTION, modalProduct.id), values); setModalProduct(null); }
    catch (updateError) { setError("No se pudieron guardar los datos."); console.error(updateError); }
    finally { setSavingId(null); }
  };

  return { products, search, setSearch, category, setCategory, criticalOnly, setCriticalOnly, loading, error, filteredProducts, counts, modalProduct, setModalProduct, savingId, saveProduct, CATEGORIES: [["", "Todas las categorías"], ...categories], getImage, getStock, money, stockState };
};

export default useAdminInventory;
