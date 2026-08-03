import { getLocalStock } from './inventory';

const StockNotice = ({ product, quantity = 1, compact = false }) => {
  const stockLocal = getLocalStock(product);
  const selectedQuantity = Math.max(1, Number(quantity) || 1);
  const textSize = compact ? 'text-[11px]' : 'text-xs';

  if (stockLocal === 0) {
    return <p className={`${textSize} rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 font-semibold text-amber-900`}>🟡 Disponible sobre pedido (Envío estimado: 3 a 10 días hábiles)</p>;
  }

  if (selectedQuantity > stockLocal) {
    const piezasDistribuidor = selectedQuantity - stockLocal;

    return <div className={`${textSize} rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900`}><p className="font-black">📦 Disponibilidad combinada para este pedido:</p><ul className="mt-1 list-disc space-y-0.5 pl-5"><li>{stockLocal} pieza{stockLocal === 1 ? '' : 's'} disponible{stockLocal === 1 ? '' : 's'} en almacén local.</li><li>{piezasDistribuidor} pieza{piezasDistribuidor === 1 ? '' : 's'} adicional{piezasDistribuidor === 1 ? '' : 'es'} sobre pedido con distribuidor.</li></ul><p className="mt-2 font-semibold">🚚 Tu pedido completo se enviará en un solo paquete (Tiempo estimado: 3 a 10 días hábiles).</p></div>;
  }

  return <p className={`${textSize} font-bold text-emerald-600`}>🟢 En stock local (Disponible para envío inmediato - 1 a 5 días hábiles)</p>;
};

export default StockNotice;
