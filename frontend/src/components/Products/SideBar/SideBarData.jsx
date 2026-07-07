export const CATEGORIES = [
  { id: "procesadores", label: "Procesadores", icon: "CPU" },
  { id: "graficas", label: "Gráficas", icon: "GPU" },
  { id: "tarjetas madre", label: "Tarjetas Madre", icon: "MB" },
  { id: "gabinetes", label: "Gabinetes", icon: "CASE" },
  { id: "enfriamiento", label: "Enfriamiento", icon: "COOL" },
  { id: "ram", label: "RAM", icon: "RAM" },
  { id: "almacenamiento", label: "Almacenamiento", icon: "SSD" },
  { id: "fuentes", label: "Fuentes", icon: "PSU" },
  { id: "monitores", label: "Monitores", icon: "MON" },
  { id: "computadora", label: "Computadoras", icon: "PC" },
  { id: "perifericos", label: "Periféricos", icon: "IO" },
  { id: "audio", label: "Audio", icon: "AUX" },
];

export const TRENDING_BRANDS = ["ASUS", "AMD", "Intel", "Corsair", "MSI", "NVIDIA", "Gigabyte", "Logitech", "Razer", "HyperX"];

export const SORT_OPTIONS = [
  { value: "featured", label: "Relevancia visual" },
  { value: "price-asc", label: "Precio: Menor a Mayor" },
  { value: "price-desc", label: "Precio: Mayor a Menor" },
];

export const parsePrice = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

export const normalizeText = (value) => value?.toString().trim().toLowerCase() || "";

export const renderCategoryIcon = (icon) => {
  const common = "h-4 w-4 stroke-[1.8]";

  switch (icon) {
    case "CPU":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <rect x="6" y="6" width="12" height="12" rx="3" stroke="currentColor" />
          <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" />
          <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" stroke="currentColor" strokeLinecap="round" />
        </svg>
      );
    case "GPU":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <rect x="4" y="7" width="14" height="10" rx="2.5" stroke="currentColor" />
          <path d="M18 10h2v4h-2M8 10h4M8 14h4" stroke="currentColor" strokeLinecap="round" />
          <circle cx="10" cy="12" r="1.6" stroke="currentColor" />
        </svg>
      );
    case "MB":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <rect x="5" y="4" width="14" height="16" rx="3" stroke="currentColor" />
          <rect x="8" y="7" width="4" height="4" rx="1" stroke="currentColor" />
          <path d="M13 8h3M13 11h3M8 14h8M8 17h5" stroke="currentColor" strokeLinecap="round" />
        </svg>
      );
    case "CASE":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <rect x="6" y="3" width="12" height="18" rx="3" stroke="currentColor" />
          <path d="M9 7h6M9 11h6M9 15h3" stroke="currentColor" strokeLinecap="round" />
          <circle cx="10" cy="18" r="1" fill="currentColor" />
        </svg>
      );
    case "COOL":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <circle cx="12" cy="12" r="3" stroke="currentColor" />
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l2.8 2.8M15.7 15.7l2.8 2.8M18.5 5.5l-2.8 2.8M8.3 15.7l-2.8 2.8" stroke="currentColor" strokeLinecap="round" />
        </svg>
      );
    case "RAM":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <rect x="4" y="7" width="16" height="8" rx="2" stroke="currentColor" />
          <path d="M7 7v-2M10 7v-2M13 7v-2M16 7v-2M7 15v2M10 15v2M13 15v2M16 15v2" stroke="currentColor" strokeLinecap="round" />
          <path d="M8 10h2M11 10h2M14 10h2" stroke="currentColor" strokeLinecap="round" />
        </svg>
      );
    case "SSD":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <rect x="5" y="5" width="14" height="14" rx="3" stroke="currentColor" />
          <path d="M8 9h8M8 12h8M8 15h5" stroke="currentColor" strokeLinecap="round" />
        </svg>
      );
    case "PSU":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <rect x="4" y="6" width="16" height="12" rx="3" stroke="currentColor" />
          <circle cx="10" cy="12" r="3" stroke="currentColor" />
          <path d="M16 9h2M16 12h2M16 15h2" stroke="currentColor" strokeLinecap="round" />
        </svg>
      );
    case "MON":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <rect x="4" y="5" width="16" height="11" rx="2.5" stroke="currentColor" />
          <path d="M9 19h6M12 16v3" stroke="currentColor" strokeLinecap="round" />
        </svg>
      );
    case "PC":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <rect x="6" y="4" width="12" height="16" rx="3" stroke="currentColor" />
          <path d="M9 8h6M9 12h6M9 16h3" stroke="currentColor" strokeLinecap="round" />
        </svg>
      );
    case "IO":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <path d="M4 12h8M12 4v16M12 12h8" stroke="currentColor" strokeLinecap="round" />
          <circle cx="8" cy="12" r="2" stroke="currentColor" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <path d="M6 12h12" stroke="currentColor" strokeLinecap="round" />
          <circle cx="12" cy="12" r="5" stroke="currentColor" />
        </svg>
      );
  }
};