import { useCallback, useEffect, useMemo, useState } from "react";
import { PCBuilderContext } from "./PCBuilderContext";

export const PC_BUILDER_CATEGORIES = [
  "cpu",
  "motherboard",
  "ram",
  "gpu",
  "storage",
  "case",
  "powerSupply",
  "cooling",
  "additionalRam",
  "additionalStorage",
];

const DEPENDENCIES_BY_CATEGORY = {
  cpu: ["motherboard", "ram", "additionalRam"],
  motherboard: ["ram", "additionalRam"],
  ram: ["additionalRam"],
};

const INITIAL_COMPONENTS = PC_BUILDER_CATEGORIES.reduce(
  (components, category) => ({ ...components, [category]: null }),
  {}
);

const STORAGE_KEY = "firstpc-pc-builder-state";

const getInitialBuilderState = () => {
  try {
    const savedState = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!savedState) return { selectedComponents: INITIAL_COMPONENTS, currentStep: 1 };
    return {
      selectedComponents: { ...INITIAL_COMPONENTS, ...(savedState.selectedComponents || {}) },
      currentStep: Math.min(Math.max(Number(savedState.currentStep) || 1, 1), 12),
    };
  } catch {
    return { selectedComponents: INITIAL_COMPONENTS, currentStep: 1 };
  }
};

export function PCBuilderProvider({ children }) {
  const [initialState] = useState(getInitialBuilderState);
  const [selectedComponents, setSelectedComponents] = useState(initialState.selectedComponents);
  const [currentStep, setCurrentStep] = useState(initialState.currentStep);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ selectedComponents, currentStep }));
  }, [selectedComponents, currentStep]);

  const selectComponent = (category, product) => {
    if (!PC_BUILDER_CATEGORIES.includes(category)) return;

    setSelectedComponents((current) => {
      const next = { ...current, [category]: product };
      (DEPENDENCIES_BY_CATEGORY[category] || []).forEach((dependentCategory) => {
        next[dependentCategory] = null;
      });
      return next;
    });
  };

  const removeComponent = (category) => {
    if (!PC_BUILDER_CATEGORIES.includes(category)) return;
    setSelectedComponents((current) => ({ ...current, [category]: null }));
  };

  const nextStep = () => setCurrentStep((step) => Math.min(step + 1, 12));
  const prevStep = () => setCurrentStep((step) => Math.max(step - 1, 1));
  const skipStep = () => setCurrentStep((step) => Math.min(step + 1, 12));
  const loadConfiguration = useCallback((components = {}, step = 1) => {
    setSelectedComponents({ ...INITIAL_COMPONENTS, ...components });
    setCurrentStep(step);
  }, []);
  const goToStep = useCallback((step) => {
    setCurrentStep((current) => {
      const targetStep = Math.min(Math.max(step, 1), 12);
      const hasComponents = Object.values(selectedComponents).some(Boolean);
      return targetStep === 12 && !hasComponents ? current : targetStep;
    });
  }, [selectedComponents]);

  const totalPrice = useMemo(
    () => Object.values(selectedComponents).reduce((total, product) => total + (Number(product?.price) || 0), 0),
    [selectedComponents]
  );

  const value = useMemo(
    () => ({ selectedComponents, currentStep, totalPrice, selectComponent, removeComponent, nextStep, prevStep, skipStep, loadConfiguration, goToStep }),
    [selectedComponents, currentStep, totalPrice, loadConfiguration, goToStep]
  );

  return <PCBuilderContext.Provider value={value}>{children}</PCBuilderContext.Provider>;
}

export default PCBuilderProvider;
