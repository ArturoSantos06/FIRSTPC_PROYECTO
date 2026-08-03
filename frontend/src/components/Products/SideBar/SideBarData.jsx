import { CategoryIcon } from '../../icons/AppIcons';

export const renderCategoryIcon = (icon) => <CategoryIcon icon={icon} />;

export const CATEGORIES = [
  { id: 'procesadores', label: 'Procesadores', icon: 'CPU' },
  { id: 'tarjetas-de-video', label: 'Tarjetas de Video', icon: 'GPU' },
  { id: 'tarjetas-madre', label: 'Tarjetas Madre', icon: 'MB' },
  { id: 'gabinetes', label: 'Gabinetes', icon: 'CASE' },
  { id: 'enfriamiento', label: 'Enfriamiento', icon: 'COOL' },
  { id: 'memorias-ram', label: 'Memorias RAM', icon: 'RAM' },
  { id: 'almacenamiento', label: 'Almacenamiento', icon: 'SSD' },
  { id: 'fuentes-de-poder', label: 'Fuentes de Poder', icon: 'PSU' },
  { id: 'monitores', label: 'Monitores', icon: 'MON' },
  { id: 'computadora', label: 'Computadoras', icon: 'PC' },
  { id: 'teclados', label: 'Teclados', icon: 'KEYBOARD' },
  { id: 'mouses', label: 'Mouses', icon: 'MOUSE' },
  { id: 'audifonos-gaming', label: 'Audífonos Gaming', icon: 'AUX' },
];

export const TRENDING_BRANDS = ['ASUS', 'AMD', 'Intel', 'Corsair', 'MSI', 'NVIDIA', 'Gigabyte', 'Logitech', 'Razer', 'HyperX'];

export const SORT_OPTIONS = [
  { value: 'featured', label: 'Más relevantes' },
  { value: 'price-asc', label: 'Precio: Menor a Mayor' },
  { value: 'price-desc', label: 'Precio: Mayor a Menor' },
];

export const parsePrice = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

export const normalizeText = (value) => value?.toString().trim().toLowerCase() || '';
