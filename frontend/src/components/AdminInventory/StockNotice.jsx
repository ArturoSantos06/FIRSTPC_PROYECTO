/* eslint-disable react/prop-types */
import { getFulfillment, getLocalStock, isDistributorIntegrated } from './inventory';

const StockNotice = ({ product, quantity = 1, compact = false }) => {
  const localStock = getLocalStock(product);
  const { localQuantity, distributorQuantity, isDropship } = getFulfillment(product, quantity);
  const textSize = compact ? 'text-[11px]' : 'text-xs';

  if (!isDistributorIntegrated(product)) {
    return <p className="text-xs font-bold text-emerald-600">● {localStock} piezas disponibles en tienda</p>;
  }

  if (localStock === 0) {
    return <p className={`${textSize} rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 font-semibold text-sky-800`}>📦 Solicitaremos esta pieza al distribuidor para surtirla en nuestra tienda. Después enviaremos tu pedido completo (3 a 10 días hábiles).</p>;
  }

  if (isDropship) {
    return <p className={`${textSize} rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 font-semibold text-amber-900`}>⚠️ Tenemos {localQuantity} {localQuantity === 1 ? 'pieza' : 'piezas'} en tienda y solicitaremos {distributorQuantity} {distributorQuantity === 1 ? 'pieza' : 'piezas'} al distribuidor para completar tu pedido. Recibirás todo en un solo envío desde FIRSTPC.</p>;
  }

  return <p className="text-xs font-bold text-emerald-600">● {localStock} piezas disponibles en tienda</p>;
};

export default StockNotice;
