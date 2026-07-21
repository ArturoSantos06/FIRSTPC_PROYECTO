import { useCallback, useMemo, useState } from "react";
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

export function PCBuilderProvider({ children }) {
  const [selectedComponents, setSelectedComponents] = useState(INITIAL_COMPONENTS);
  const [currentStep, setCurrentStep] = useState(1);

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
  const goToStep = useCallback((step) => setCurrentStep(Math.min(Math.max(step, 1), 12)), []);

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
