/* eslint-disable react/prop-types, react-refresh/only-export-components */
import { useContext, useEffect, useMemo, useState } from "react";
import { arrayUnion, collection, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { ChevronLeft, ChevronRight, Check, Loader2, Save, ShoppingCart, Trash2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth, db } from "/src/firebaseConfig.js";
import { AuthContext } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { usePCBuilder } from "../../context/PCBuilderContext.js";

const STEPS = [
  { key: "cpu", label: "Procesador", firestoreCategory: "procesadores" },
  { key: "motherboard", label: "Tarjeta madre", firestoreCategories: ["tarjetas madre", "tarjetas-madre"] },
  { key: "ram", label: "Memoria RAM", firestoreCategories: ["ram", "memorias-ram"] },
  { key: "gpu", label: "Tarjeta de video", firestoreCategories: ["graficas", "tarjetas-de-video"] },
  { key: "storage", label: "Almacenamiento", firestoreCategory: "almacenamiento" },
  { key: "case", label: "Gabinete", firestoreCategory: "gabinetes" },
  { key: "powerSupply", label: "Fuente de poder", firestoreCategories: ["fuentes", "fuentes-de-poder"] },
  { key: "cooling", label: "Enfriamiento", firestoreCategory: "enfriamiento" },
  { key: "additionalRam", label: "Memoria RAM adicional", firestoreCategories: ["ram", "memorias-ram"], optional: true },
  { key: "additionalStorage", label: "Almacenamiento adicional", firestoreCategories: ["almacenamiento"], optional: true },
  { key: "assembly", label: "Servicio de ensamblado", assembly: true },
  { key: "summary", label: "Resumen", summary: true },
];

const ASSEMBLY_COST = 300;
const formatPrice = (price) => `$${(Number(price) || 0).toLocaleString("es-MX")}`;
const productImage = (product) => product?.images?.[0] || product?.image || "https://via.placeholder.com/160?text=Hardware";
const normalizeSpecKey = (value) => String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
const findSpecValue = (product, keys) => {
  const wantedKeys = keys.map(normalizeSpecKey);
  const search = (value) => {
    if (!value || typeof value !== "object") return undefined;
    for (const [key, nestedValue] of Object.entries(value)) {
      if (wantedKeys.includes(normalizeSpecKey(key)) && (typeof nestedValue === "string" || typeof nestedValue === "number")) return nestedValue;
      const found = search(nestedValue);
      if (found !== undefined) return found;
    }
    return undefined;
  };
  return search({ keySpecs: product?.keySpecs, fullSpecs: product?.fullSpecs });
};
const memoryType = (product) => findSpecValue(product, ["Tipo de memoria", "Tipo de memoria interna"]);
const socketType = (product) => findSpecValue(product, ["Socket", "Socket del procesador"]);
const formFactor = (product) => findSpecValue(product, ["Factor de forma"]);
const sameMemoryType = (first, second) => {
  const left = String(first || "").toUpperCase().replace(/\s/g, "");
  const right = String(second || "").toUpperCase().replace(/\s/g, "");
  return left === right || left.includes(right) || right.includes(left);
};

const serializeProduct = (product, key) => product && ({
  key,
  id: product.id,
  name: product.name,
  price: Number(product.price) || 0,
  image: productImage(product),
  category: product.category || "",
});

export default function PCBuilder() {
  const { user } = useContext(AuthContext);
  const { addItem } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedComponents, currentStep, totalPrice, selectComponent, removeComponent, nextStep, prevStep, skipStep, loadConfiguration, goToStep } = usePCBuilder();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [assemblySelected, setAssemblySelected] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [loadingConfiguration, setLoadingConfiguration] = useState(false);
  const step = STEPS[currentStep - 1];

  const compatibility = useMemo(() => {
    if (currentStep === 2) return socketType(selectedComponents.cpu);
    if ([3, 9].includes(currentStep)) return memoryType(selectedComponents.motherboard);
    if (currentStep === 6) return formFactor(selectedComponents.motherboard);
    return null;
  }, [currentStep, selectedComponents]);

  useEffect(() => {
    let cancelled = false;
    if (!step || step.assembly || step.summary) return undefined;

    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      if ([2, 3, 6, 9].includes(currentStep) && !compatibility) {
        setProducts([]);
        setError("No se encontró la especificación de compatibilidad necesaria para filtrar opciones seguras.");
        setLoading(false);
        return;
      }
      try {
        const constraints = [where("category", "in", step.firestoreCategories || [step.firestoreCategory])];
        const snapshot = await getDocs(query(collection(db, "products"), ...constraints));
        const loadedProducts = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        const compatibleProducts = currentStep === 2
          ? loadedProducts.filter((product) => sameMemoryType(socketType(product), compatibility))
          : currentStep === 3 || currentStep === 9
            ? loadedProducts.filter((product) => sameMemoryType(memoryType(product), compatibility))
            : currentStep === 6
              ? loadedProducts.filter((product) => sameMemoryType(formFactor(product), compatibility))
              : loadedProducts;
        if (!cancelled) setProducts(compatibleProducts);
      } catch (fetchError) {
        console.error("Error cargando componentes del PC Builder:", fetchError);
        if (!cancelled) setError("No se pudieron cargar los componentes. Intenta nuevamente.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProducts();
    return () => { cancelled = true; };
  }, [currentStep, step, compatibility]);

  const assemblyCost = assemblySelected ? ASSEMBLY_COST : 0;
  const buildTotal = totalPrice + assemblyCost;
  const selectedEntries = Object.entries(selectedComponents).filter(([, product]) => product);

  useEffect(() => {
    const configuration = location.state?.configuration;
    if (!configuration?.id) return undefined;
    let cancelled = false;
    const loadSavedConfiguration = async () => {
      setLoadingConfiguration(true);
      try {
        const entries = await Promise.all((configuration.components || []).map(async (component) => {
          if (!component.id) return [component.key, component];
          const snapshot = await getDoc(doc(db, "products", component.id));
          return [component.key, snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : component];
        }));
        if (!cancelled) {
          loadConfiguration(Object.fromEntries(entries.filter(([key]) => key)), 12);
          setAssemblySelected(Boolean(configuration.assembly));
          navigate(location.pathname, { replace: true, state: {} });
        }
      } catch (loadError) {
        console.error("Error cargando la configuración guardada:", loadError);
        if (!cancelled) setFeedback("No se pudo cargar la configuración para editarla.");
      } finally {
        if (!cancelled) setLoadingConfiguration(false);
      }
    };
    loadSavedConfiguration();
    return () => { cancelled = true; };
  }, [location.pathname, location.state?.configuration, loadConfiguration, navigate]);

  const addToCart = () => {
    selectedEntries.forEach(([, product]) => addItem(product));
    if (assemblySelected) addItem({ id: "firstpc-assembly-service", name: "Servicio de ensamblado FIRSTPC", price: ASSEMBLY_COST, stock: 999999, category: "servicio", image: "" });
    setFeedback("Configuración agregada al carrito.");
    navigate("/carrito");
  };

  const saveConfiguration = async () => {
    const currentUser = auth.currentUser || user;
    if (!currentUser?.uid) {
      navigate("/login", { state: { from: "/armar-pc" } });
      return;
    }
    try {
      const configuration = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        name: `PC personalizada ${new Date().toLocaleDateString("es-MX")}`,
        components: selectedEntries.map(([key, product]) => serializeProduct(product, key)),
        assembly: Boolean(assemblySelected),
        assemblyCost,
        total: buildTotal,
      };
      await setDoc(doc(db, "users", currentUser.uid), { pcConfigurations: arrayUnion(configuration) }, { merge: true });
      setFeedback("Configuración guardada en Mis PCs configuradas.");
    } catch (saveError) {
      console.error("Error guardando la configuración:", saveError);
      setFeedback("No fue posible guardar la configuración. Intenta nuevamente.");
    }
  };

  const renderSummaryRows = (interactive = false) => (
    <div className="space-y-3">
      {selectedEntries.map(([key, product]) => {
        const item = STEPS.find((candidate) => candidate.key === key);
        const componentStep = STEPS.findIndex((candidate) => candidate.key === key) + 1;
        const goToComponent = () => { if (interactive && componentStep > 0) goToStep(componentStep); };
        return <div key={key} role={interactive ? "button" : undefined} tabIndex={interactive ? 0 : undefined} onClick={goToComponent} onKeyDown={(event) => { if (interactive && (event.key === "Enter" || event.key === " ")) goToComponent(); }} className={`flex items-center gap-3 rounded-xl border border-slate-100 p-3 ${interactive ? "cursor-pointer transition hover:border-emerald-300 hover:bg-emerald-50/40" : ""}`}><img src={productImage(product)} alt="" className="h-12 w-12 rounded-lg bg-slate-50 object-contain" /><div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item?.label || key}</p><p className="truncate text-xs font-bold">{product.name}</p></div><p className="text-xs font-black text-emerald-600">{formatPrice(product.price)}</p><button type="button" onClick={(event) => { event.stopPropagation(); removeComponent(key); }} aria-label={`Eliminar ${item?.label || key}`} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button></div>;
      })}
      <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3 text-sm"><span className="font-bold">Ensamblado</span><span className={`font-black ${assemblySelected === false ? "text-slate-500" : ""}`}>{assemblySelected === true ? `Sí, ${formatPrice(ASSEMBLY_COST)}` : assemblySelected === false ? "No, sin ensamblado" : "No seleccionado"}</span></div>
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 font-['Montserrat'] text-slate-800 md:px-8">
      <div className={`mx-auto max-w-7xl gap-6 ${step.summary ? "" : "grid lg:grid-cols-[minmax(0,1fr)_360px]"}`}>
        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-8">
          <div className="mb-8 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.25em] text-emerald-500">PC Builder</p><h1 className="mt-2 text-3xl font-black">Arma tu PC</h1></div><span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold">{loadingConfiguration ? "Cargando configuración..." : `Paso ${currentStep} de ${STEPS.length}`}</span></div>
          <div className="mb-8 flex gap-1">{STEPS.map((item, index) => <div key={item.key} className={`h-2 flex-1 rounded-full ${index < currentStep ? "bg-emerald-500" : "bg-slate-100"}`} />)}</div>

          {step.summary ? (
            <div><h2 className="mb-2 text-2xl font-black">Resumen de tu configuración</h2><p className="mb-6 text-sm font-medium text-slate-500">Revisa tu selección antes de continuar.</p>{renderSummaryRows()}<div className="mt-6 grid gap-3 sm:grid-cols-3"><button type="button" onClick={() => goToStep(1)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 transition hover:border-emerald-400 hover:text-emerald-600">Modificar componentes</button><button type="button" onClick={addToCart} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-600"><ShoppingCart size={18} /> Agregar al carrito</button><button type="button" onClick={saveConfiguration} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 transition hover:border-emerald-400 hover:text-emerald-600"><Save size={18} /> Guardar en mi perfil</button></div>{feedback && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-center text-sm font-bold text-emerald-700">{feedback}</p>}</div>
          ) : step.assembly ? (
            <div><h2 className="mb-2 text-xl font-extrabold">¿Quieres que ensamblemos tu PC?</h2><p className="mb-6 text-sm font-medium text-slate-500">El servicio de ensamblado tiene un costo adicional de {formatPrice(ASSEMBLY_COST)}.</p><div className="grid gap-4 sm:grid-cols-2"><button type="button" onClick={() => setAssemblySelected(true)} className={`rounded-2xl border p-6 text-left transition ${assemblySelected === true ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100" : "border-slate-200 hover:border-emerald-300"}`}><Check className="mb-3 text-emerald-600" /><p className="font-black">Sí, ensamblar mi PC</p><p className="mt-1 text-sm text-slate-500">+{formatPrice(ASSEMBLY_COST)}</p></button><button type="button" onClick={() => setAssemblySelected(false)} className={`rounded-2xl border p-6 text-left transition ${assemblySelected === false ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100" : "border-slate-200 hover:border-emerald-300"}`}><Check className="mb-3 text-slate-500" /><p className="font-black">No, lo armo por mi cuenta</p><p className="mt-1 text-sm text-slate-500">Sin costo adicional</p></button></div></div>
          ) : (
            <><div className="mb-5 flex items-start justify-between gap-3"><div><h2 className="text-xl font-extrabold">Elige tu {step.label}</h2>{step.optional && <p className="mt-1 text-sm font-medium text-slate-500">Este componente es opcional. Puedes continuar sin seleccionarlo.</p>}</div>{step.optional && <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-600">Opcional</span>}</div>{loading && <div className="flex items-center gap-2 py-12 text-slate-500"><Loader2 className="animate-spin" size={20} /> Cargando componentes compatibles...</div>}{!loading && error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</p>}{!loading && !error && products.length === 0 && <p className="rounded-xl bg-slate-50 p-6 text-slate-500">No hay componentes compatibles con tu selección actual.</p>}<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{products.map((product) => <article key={product.id} className={`rounded-2xl border p-4 transition hover:border-emerald-400 hover:shadow-md ${selectedComponents[step.key]?.id === product.id ? "border-emerald-500 ring-2 ring-emerald-100" : "border-slate-100"}`}><img src={productImage(product)} alt={product.name} className="mb-3 h-36 w-full rounded-xl bg-slate-50 object-contain" /><h3 className="line-clamp-2 min-h-10 text-sm font-bold">{product.name}</h3><p className="my-3 text-lg font-black text-emerald-600">{formatPrice(product.price)}</p><button type="button" onClick={() => selectComponent(step.key, product)} className={`w-full rounded-xl px-4 py-3 text-sm font-bold text-white transition ${selectedComponents[step.key]?.id === product.id ? "bg-emerald-600" : "bg-slate-900 hover:bg-emerald-500"}`}>{selectedComponents[step.key]?.id === product.id ? "Seleccionado" : "Elegir componente"}</button></article>)}</div></>
          )}

          {!step.summary && <div className="mt-8 flex justify-between"><button type="button" onClick={prevStep} disabled={currentStep === 1} className="inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={18} /> Anterior</button>{step.assembly ? <button type="button" onClick={nextStep} disabled={assemblySelected === null} className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Ver resumen <ChevronRight size={18} /></button> : <div className="flex gap-2">{step.optional && <button type="button" onClick={skipStep} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600">Omitir</button>}<button type="button" onClick={nextStep} disabled={!selectedComponents[step.key]} className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Siguiente <ChevronRight size={18} /></button></div>}</div>}
        </section>

        {!step.summary && <aside className="h-fit rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6"><h2 className="mb-2 text-xl font-black">Resumen de ensamble</h2><p className="mb-5 text-xs font-semibold text-slate-400">Haz clic en un componente para modificarlo.</p>{renderSummaryRows(true)}<div className="mt-6 rounded-2xl bg-slate-900 p-5 text-white"><p className="text-xs font-bold uppercase tracking-[.2em] text-slate-400">Total estimado</p><p className="mt-2 text-3xl font-black text-emerald-400">{formatPrice(buildTotal)}</p></div></aside>}
      </div>
    </main>
  );
}
