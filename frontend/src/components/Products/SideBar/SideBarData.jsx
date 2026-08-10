import { CategoryIcon } from '../../icons/AppIcons';
import { DEFAULT_CATEGORIES } from '../../../services/categoryService';

export const renderCategoryIcon = (icon) => <CategoryIcon icon={icon} />;

const CATEGORY_ICONS = { procesadores: 'CPU', 'tarjetas-de-video': 'GPU', 'tarjetas-madre': 'MB', gabinetes: 'CASE', enfriamiento: 'COOL', 'memorias-ram': 'RAM', almacenamiento: 'SSD', 'fuentes-de-poder': 'PSU', monitores: 'MON', computadora: 'PC', teclados: 'KEYBOARD', mouses: 'MOUSE', 'audifonos-gaming': 'AUX' };
export const CATEGORIES = DEFAULT_CATEGORIES.map(({ slug, name }) => ({ id: slug, label: name, icon: CATEGORY_ICONS[slug] || 'AUX' }));

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
