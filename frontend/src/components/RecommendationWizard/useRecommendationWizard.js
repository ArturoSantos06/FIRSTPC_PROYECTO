import { useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebaseConfig.js";
import { useCart } from "../../context/CartContext";
import { formFactor, memoryType, sameMemoryType, socketType } from "../PCBuilder/componentCompatibility.js";

const normalize = (value) => String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const categoryIs = (product, aliases) => aliases.some((alias) => normalize(product.category).replace(/[^a-z0-9]/g, "") === normalize(alias).replace(/[^a-z0-9]/g, ""));
const productText = (product) => normalize([product.name, product.description, product.brand, JSON.stringify(product.keySpecs), JSON.stringify(product.fullSpecs)].join(" "));
const matchesUse = (product, use) => {
  const text = productText(product);
  if (use === "office") return true;
  if (use === "gaming") return /(rtx|gtx|radeon|geforce|gpu|grafica dedicada|i5|i7|i9|ryzen 5|ryzen 7|ryzen 9)/.test(text);
  return /(rtx|gtx|radeon|geforce|grafica dedicada|32 ?gb|64 ?gb|i7|i9|ryzen 7|ryzen 9|threadripper)/.test(text);
};
const scoreProduct = (product, use, budget) => {
  const text = productText(product);
  const keywords = use === "gaming" ? ["rtx", "gtx", "radeon", "gaming", "144hz"] : use === "creative" ? ["32gb", "64gb", "rtx", "i7", "i9", "ryzen 7"] : ["ssd", "16gb", "ryzen 5", "i5"];
  return keywords.reduce((score, keyword) => score + (text.includes(keyword) ? 3 : 0), 0) - Math.abs(budget - Number(product.price || 0)) / Math.max(budget, 1);
};

export function useRecommendationWizard() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [step, setStep] = useState(1);
  const [equipment, setEquipment] = useState("");
  const [useCase, setUseCase] = useState("");
  const [budget, setBudget] = useState(15000);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runRecommendation = async () => {
    setLoading(true); setError("");
    try {
      const snapshot = await getDocs(collection(db, "products"));
      const products = snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).filter((item) => Number(item.stock ?? 1) > 0);
      if (equipment === "laptop") {
        const laptops = products.filter((item) => categoryIs(item, ["laptops", "laptop", "portatiles"]) && Number(item.price) <= budget && matchesUse(item, useCase));
        laptops.sort((a, b) => scoreProduct(b, useCase, budget) - scoreProduct(a, useCase, budget));
        setResult({ type: "product", products: laptops.slice(0, 3).map((product) => ({ product })) });
      } else {
        const desktops = products.filter((item) => categoryIs(item, ["pc armadas", "pc-armadas", "computadoras", "computadora", "ensambles", "ensamble", "desktop"]) && Number(item.price) <= budget && matchesUse(item, useCase));
        desktops.sort((a, b) => scoreProduct(b, useCase, budget) - scoreProduct(a, useCase, budget));
        if (desktops.length) setResult({ type: "product", products: desktops.slice(0, 3).map((product) => ({ product })) });
        else {
          const componentAliases = [
            ["cpu", ["procesadores"], useCase === "creative" ? 0.16 : useCase === "gaming" ? 0.16 : 0.15, true],
            ["motherboard", ["tarjetas madre", "tarjetas-madre"], 0.12, false],
            ["ram", ["ram", "memorias ram", "memorias-ram"], useCase === "creative" ? 0.18 : useCase === "gaming" ? 0.1 : 0.15, false],
            ["gpu", ["graficas", "tarjetas de video", "tarjetas-de-video"], useCase === "creative" ? 0.3 : useCase === "gaming" ? 0.38 : 0.15, true],
            ["storage", ["almacenamiento"], 0.08, false],
            ["case", ["gabinetes"], 0.06, false],
            ["powerSupply", ["fuentes", "fuentes-de-poder"], 0.07, false],
            ["cooling", ["enfriamiento"], 0.03, false],
          ];
          const selectedComponents = {};
          const bundle = componentAliases.map(([key, aliases, allocation, useFilter]) => {
            const target = Math.max(Math.round(budget * allocation), 500);
            const candidates = products.filter((item) => {
              if (!categoryIs(item, aliases) || Number(item.price) > target || (useFilter && !matchesUse(item, useCase))) return false;
              if (key === "motherboard" && selectedComponents.cpu) return sameMemoryType(socketType(item), socketType(selectedComponents.cpu));
              if (key === "ram" && selectedComponents.motherboard) return sameMemoryType(memoryType(item), memoryType(selectedComponents.motherboard));
              if (key === "case" && selectedComponents.motherboard) return sameMemoryType(formFactor(item), formFactor(selectedComponents.motherboard));
              return true;
            });
            candidates.sort((a, b) => {
              if (key === "gpu" || key === "cpu") return Number(b.price || 0) - Number(a.price || 0);
              return scoreProduct(b, useCase, target) - scoreProduct(a, useCase, target);
            });
            selectedComponents[key] = candidates[0];
            return { key, product: candidates[0] };
          }).filter((item) => item.product);
          setResult({ type: "bundle", products: bundle, total: bundle.reduce((sum, item) => sum + Number(item.product.price || 0), 0) });
        }
      }
      setStep(4);
    } catch (fetchError) { console.error("Error generando recomendación:", fetchError); setError("No pudimos consultar el catálogo. Intenta nuevamente."); }
    finally { setLoading(false); }
  };

  const addRecommendation = (products) => {
    products.forEach((item) => addItem(item.product || item));
    setResult((current) => ({ ...current, added: true }));
    navigate("/carrito");
  };
  const navigateWithRecommendation = (path, options = {}) => navigate(path, { ...options, state: { ...options.state, recommendation: { ...options.state?.recommendation, products: result?.products || [] } } });
  const reset = () => { setStep(1); setEquipment(""); setUseCase(""); setResult(null); setError(""); };
  return { step, setStep, equipment, setEquipment, useCase, setUseCase, budget, setBudget, result, loading, error, runRecommendation, addRecommendation, reset, navigate: navigateWithRecommendation };
}
