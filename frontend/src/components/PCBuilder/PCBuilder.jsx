import { useContext, useEffect, useMemo, useState } from "react";
import { arrayUnion, collection, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { ChevronLeft, ChevronRight, Check, Loader2, Save, ShoppingCart, Trash2, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth, db } from "/src/firebaseConfig.js";
import { AuthContext } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { usePCBuilder } from "../../context/PCBuilderContext.js";
import { formFactor, memoryType, sameMemoryType, socketType } from "./componentCompatibility.js";

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
const ASSEMBLY_STORAGE_KEY = "firstpc-pc-builder-assembly";
const formatPrice = (price) => `$${(Number(price) || 0).toLocaleString("es-MX")}`;
const productImage = (product) => product?.images?.[0] || product?.image || "https://via.placeholder.com/160?text=Hardware";

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
  const { selectedComponents, currentStep, totalPrice, selectComponent, removeComponent, nextStep, prevStep, skipStep, loadConfiguration, clearConfiguration, goToStep } = usePCBuilder();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [assemblySelected, setAssemblySelected] = useState(() => {
    const savedAssembly = localStorage.getItem(ASSEMBLY_STORAGE_KEY);
    return savedAssembly === "true" ? true : savedAssembly === "false" ? false : null;
  });
  const [feedback, setFeedback] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [loadingConfiguration, setLoadingConfiguration] = useState(false);
  const [showStepMenu, setShowStepMenu] = useState(false);
  const step = STEPS[currentStep - 1];
  const handleNextStep = () => {
    nextStep();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handlePreviousStep = () => {
    prevStep();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (assemblySelected === null) localStorage.removeItem(ASSEMBLY_STORAGE_KEY);
    else localStorage.setItem(ASSEMBLY_STORAGE_KEY, String(assemblySelected));
  }, [assemblySelected]);

  useEffect(() => {
    if (!showStepMenu) return undefined;
    const closeStepMenu = (event) => {
      const clickedButton = event.target.closest?.("button");
      if (clickedButton?.textContent?.includes("Paso")) return;
      setShowStepMenu(false);
    };
    document.addEventListener("click", closeStepMenu);
    return () => document.removeEventListener("click", closeStepMenu);
  }, [showStepMenu]);

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
      try {
        const constraints = [where("category", "in", step.firestoreCategories || [step.firestoreCategory])];
        const snapshot = await getDocs(query(collection(db, "products"), ...constraints));
        const loadedProducts = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        const compatibleProducts = currentStep === 2 && compatibility
          ? loadedProducts.filter((product) => sameMemoryType(socketType(product), compatibility))
          : (currentStep === 3 || currentStep === 9) && compatibility
            ? loadedProducts.filter((product) => sameMemoryType(memoryType(product), compatibility))
            : currentStep === 6 && compatibility
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
  const hasSelectedComponents = selectedEntries.length > 0;

  useEffect(() => {
    if (currentStep === 12 && !hasSelectedComponents) {
      goToStep(1);
      setAssemblySelected(null);
    }
  }, [currentStep, hasSelectedComponents, goToStep]);

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

  useEffect(() => {
    const recommendationProducts = location.state?.recommendation?.products || [];
    if (!recommendationProducts.length) return undefined;
    const components = Object.fromEntries(recommendationProducts
      .filter((entry) => entry?.key && entry.product)
      .map((entry) => [entry.key, entry.product]));
    if (Object.keys(components).length) loadConfiguration(components, 12);
    navigate(location.pathname, { replace: true, state: {} });
    return undefined;
  }, [location.pathname, location.state?.recommendation?.products, loadConfiguration, navigate]);

  const addToCart = () => {
    selectedEntries.forEach(([, product]) => addItem(product));
    if (assemblySelected) addItem({ id: "firstpc-assembly-service", name: "Servicio de ensamblado FIRSTPC", price: ASSEMBLY_COST, stock: 999999, category: "servicio", image: "" });
    setFeedback("Configuración agregada al carrito.");
    navigate("/carrito");
  };

  const saveConfiguration = async () => {
    const currentUser = auth.currentUser || user;
    if (!currentUser?.uid) {
      window.dispatchEvent(new CustomEvent("open-login-modal", { detail: { redirectTo: "/armar-pc" } }));
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
      setFeedback("");
      setShowSaveModal(true);
    } catch (saveError) {
      console.error("Error guardando la configuración:", saveError);
      setFeedback("No fue posible guardar la configuración. Intenta nuevamente.");
    }
  };

  const startNewBuild = () => {
    clearConfiguration();
    setAssemblySelected(null);
    setFeedback("");
    setShowSaveModal(false);
  };

  const clearBuild = () => {
    clearConfiguration();
    setAssemblySelected(null);
    setFeedback("");
  };

  const renderSummaryRows = (interactive = false) => (
    <div className="space-y-3">
      {selectedEntries.map(([key, product]) => {
        const item = STEPS.find((candidate) => candidate.key === key);
        const componentStep = STEPS.findIndex((candidate) => candidate.key === key) + 1;
        const goToComponent = () => { if (interactive && componentStep > 0) goToStep(componentStep); };
        return <div key={key} role={interactive ? "button" : undefined} tabIndex={interactive ? 0 : undefined} onClick={goToComponent} onKeyDown={(event) => { if (interactive && (event.key === "Enter" || event.key === " ")) goToComponent(); }} className={`flex min-w-0 items-center gap-3 overflow-hidden rounded-xl border border-slate-100 p-3 ${interactive ? "cursor-pointer transition hover:border-emerald-300 hover:bg-emerald-50/40" : ""}`}><img src={productImage(product)} alt="" className="h-12 w-12 shrink-0 rounded-lg bg-slate-50 object-contain" /><div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item?.label || key}</p><p className="truncate text-xs font-bold">{product.name}</p></div><p className="shrink-0 text-xs font-black text-emerald-600">{formatPrice(product.price)}</p><button type="button" onClick={(event) => { event.stopPropagation(); removeComponent(key); }} aria-label={`Eliminar ${item?.label || key}`} className="shrink-0 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button></div>;
      })}
      <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3 text-sm"><span className="font-bold">Ensamblado</span><span className={`font-black ${assemblySelected === false ? "text-slate-500" : ""}`}>{assemblySelected === true ? `Sí, ${formatPrice(ASSEMBLY_COST)}` : assemblySelected === false ? "No, sin ensamblado" : "No seleccionado"}</span></div>
      {interactive && selectedEntries.length > 0 && <div className="space-y-2"><button type="button" onClick={() => goToStep(12)} className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-600">Ir al resumen</button><button type="button" onClick={clearBuild} className="w-full rounded-xl border border-rose-200 px-4 py-2.5 text-xs font-black text-rose-600 transition hover:bg-rose-50">Vaciar selección</button></div>}
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-5 font-['Montserrat'] text-slate-800 sm:px-4 sm:py-8 md:px-8">
      <div className={`mx-auto max-w-7xl gap-6 ${step.summary ? "" : "grid lg:grid-cols-[minmax(0,1fr)_360px]"}`}>
        <section className="min-w-0 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5 md:p-8">
          <div className="relative mb-8 flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.25em] text-emerald-500">PC Builder</p><h1 className="mt-2 text-2xl font-black sm:text-3xl">Arma tu PC</h1></div><div className="relative shrink-0"><button type="button" onClick={() => setShowStepMenu((visible) => !visible)} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-600 sm:px-4 sm:text-sm">{loadingConfiguration ? "Cargando configuración..." : `Paso ${currentStep} de ${STEPS.length}`} <span className="ml-1 text-xs">⌄</span></button>{showStepMenu && <div className="absolute right-0 top-12 z-30 max-h-80 w-[min(16rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">{STEPS.map((item, index) => { const isSummaryStep = index + 1 === 12; return <button key={item.key} type="button" disabled={isSummaryStep && !hasSelectedComponents} onClick={() => { if (isSummaryStep && !hasSelectedComponents) return; goToStep(index + 1); setShowStepMenu(false); }} className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-bold transition ${currentStep === index + 1 ? "bg-emerald-50 text-emerald-600" : "text-slate-600 hover:bg-slate-50 hover:text-emerald-600"} disabled:cursor-not-allowed disabled:opacity-40`}><span>{index + 1}. {item.label}</span>{selectedComponents[item.key] && <span className="text-emerald-500">✓</span>}</button>; })}</div>}</div></div>
          <div className="mb-8 flex gap-1">{STEPS.map((item, index) => <div key={item.key} className={`h-2 flex-1 rounded-full ${index < currentStep ? "bg-emerald-500" : "bg-slate-100"}`} />)}</div>

          {step.summary ? (
            <div><h2 className="mb-2 text-2xl font-black">Resumen de tu configuración</h2><p className="mb-6 text-sm font-medium text-slate-500">Revisa tu selección antes de continuar.</p>{renderSummaryRows()}<div className="mt-6 flex items-center justify-between rounded-2xl bg-slate-900 px-5 py-4 text-white"><span className="text-xs font-bold uppercase tracking-[.2em] text-slate-400">Total de tu configuración</span><span className="text-2xl font-black text-emerald-400">{formatPrice(buildTotal)}</span></div><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><button type="button" onClick={() => goToStep(1)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:border-emerald-400 hover:text-emerald-600">Modificar componentes</button><button type="button" onClick={addToCart} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:border-emerald-400 hover:text-emerald-600"><ShoppingCart size={18} /> Agregar al carrito</button><button type="button" onClick={saveConfiguration} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:border-emerald-400 hover:text-emerald-600"><Save size={18} /> Guardar en mi perfil</button><button type="button" onClick={clearBuild} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:border-emerald-400 hover:text-emerald-600"><Trash2 size={18} /> Vaciar PC</button></div>{feedback && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-center text-sm font-bold text-emerald-700">{feedback}</p>}</div>
          ) : step.assembly ? (
            <div><h2 className="mb-2 text-xl font-extrabold">¿Quieres que ensamblemos tu PC?</h2><p className="mb-6 text-sm font-medium text-slate-500">El servicio de ensamblado tiene un costo adicional de {formatPrice(ASSEMBLY_COST)}.</p><div className="grid gap-4 sm:grid-cols-2"><button type="button" onClick={() => setAssemblySelected(true)} className={`rounded-2xl border p-6 text-left transition ${assemblySelected === true ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100" : "border-slate-200 hover:border-emerald-300"}`}><Check className="mb-3 text-emerald-600" /><p className="font-black">Sí, ensamblar mi PC</p><p className="mt-1 text-sm text-slate-500">+{formatPrice(ASSEMBLY_COST)}</p></button><button type="button" onClick={() => setAssemblySelected(false)} className={`rounded-2xl border p-6 text-left transition ${assemblySelected === false ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100" : "border-slate-200 hover:border-emerald-300"}`}><Check className="mb-3 text-slate-500" /><p className="font-black">No, lo armo por mi cuenta</p><p className="mt-1 text-sm text-slate-500">Sin costo adicional</p></button></div></div>
          ) : (
            <><div className="mb-5 flex items-start justify-between gap-3"><div><h2 className="text-xl font-extrabold">Elige tu {step.label}</h2>{step.optional && <p className="mt-1 text-sm font-medium text-slate-500">Este componente es opcional. Puedes continuar sin seleccionarlo.</p>}</div>{step.optional && <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-600">Opcional</span>}</div>{loading && <div className="flex items-center gap-2 py-12 text-slate-500"><Loader2 className="animate-spin" size={20} /> Cargando componentes compatibles...</div>}{!loading && error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</p>}{!loading && !error && products.length === 0 && <p className="rounded-xl bg-slate-50 p-6 text-slate-500">No hay componentes compatibles con tu selección actual.</p>}<div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">{products.map((product) => <article key={product.id} className={`flex min-w-0 flex-col rounded-2xl border p-3 transition hover:border-emerald-400 hover:shadow-md sm:p-4 ${selectedComponents[step.key]?.id === product.id ? "border-emerald-500 ring-2 ring-emerald-100" : "border-slate-100"}`}><img src={productImage(product)} alt={product.name} className="mb-3 h-28 w-full rounded-xl bg-slate-50 object-contain sm:h-36" /><h3 className="min-h-10 break-words [overflow-wrap:anywhere] text-xs font-bold sm:text-sm">{product.name}</h3><p className="my-3 text-base font-black text-emerald-600 sm:text-lg">{formatPrice(product.price)}</p><button type="button" onClick={() => selectComponent(step.key, product)} className={`mt-auto w-full rounded-xl px-2 py-3 text-xs font-bold text-white transition sm:px-4 sm:text-sm ${selectedComponents[step.key]?.id === product.id ? "bg-emerald-600" : "bg-slate-900 hover:bg-emerald-500"}`}>{selectedComponents[step.key]?.id === product.id ? "Seleccionado" : "Elegir componente"}</button></article>)}</div></>
          )}

          {!step.summary && <div className="mt-8 flex justify-between"><button type="button" onClick={handlePreviousStep} disabled={currentStep === 1} className="inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={18} /> Anterior</button>{step.assembly ? <button type="button" onClick={handleNextStep} disabled={assemblySelected === null || !hasSelectedComponents} className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Ver resumen <ChevronRight size={18} /></button> : <div className="flex gap-2"><button type="button" onClick={handleNextStep} className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white">Siguiente <ChevronRight size={18} /></button></div>}</div>}
        </section>

        {!step.summary && <aside className="min-w-0 h-fit rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-28"><h2 className="mb-2 text-xl font-black">Resumen de ensamble</h2><p className="mb-5 text-xs font-semibold text-slate-400">Haz clic en un componente para modificarlo.</p>{renderSummaryRows(true)}<div className="mt-6 rounded-2xl bg-slate-900 p-5 text-white"><p className="text-xs font-bold uppercase tracking-[.2em] text-slate-400">Total estimado</p><p className="mt-2 text-3xl font-black text-emerald-400">{formatPrice(buildTotal)}</p></div></aside>}
      </div>
      {showSaveModal && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"><div role="dialog" aria-modal="true" aria-labelledby="save-build-title" className="relative w-full max-w-md rounded-[28px] bg-white p-7 text-center shadow-[0_25px_80px_rgba(15,23,42,0.2)]"><button type="button" onClick={() => setShowSaveModal(false)} aria-label="Cerrar modal" className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X size={18} /></button><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-500"><Check size={28} /></div><h2 id="save-build-title" className="mt-5 text-2xl font-black text-slate-900">¡Configuración guardada!</h2><p className="mt-3 text-sm font-medium leading-6 text-slate-500">Tu PC se guardó exitosamente en tu perfil. ¿Qué deseas hacer ahora?</p><div className="mt-7 grid gap-3"><button type="button" onClick={() => navigate("/perfil/pc-configuradas")} className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-600">Ir a mis PCs configuradas</button><button type="button" onClick={startNewBuild} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 transition hover:border-emerald-400 hover:text-emerald-600">Hacer un nuevo build</button></div></div></div>}
    </main>
  );
}
