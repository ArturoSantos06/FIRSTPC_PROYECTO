import { createContext, useContext } from "react";

export const PCBuilderContext = createContext(null);

export function usePCBuilder() {
  const context = useContext(PCBuilderContext);
  if (!context) throw new Error("usePCBuilder debe usarse dentro de PCBuilderProvider");
  return context;
}

export default PCBuilderContext;
