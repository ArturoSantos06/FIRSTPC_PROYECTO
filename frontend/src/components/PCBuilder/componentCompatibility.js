export const normalizeSpecKey = (value) => String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");

export const findSpecValue = (product, keys) => {
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

export const memoryType = (product) => findSpecValue(product, ["Tipo de memoria", "Tipo de memoria interna"]);
export const socketType = (product) => findSpecValue(product, ["Socket", "Socket del procesador"]);
export const formFactor = (product) => findSpecValue(product, ["Factor de forma"]);
export const sameMemoryType = (first, second) => {
  const left = String(first || "").toUpperCase().replace(/\s/g, "");
  const right = String(second || "").toUpperCase().replace(/\s/g, "");
  return Boolean(left && right) && (left === right || left.includes(right) || right.includes(left));
};
