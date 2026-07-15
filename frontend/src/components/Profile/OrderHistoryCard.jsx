import { createReceiptPdf } from '../Checkout/Step4/ReceiptPdf';

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

const statusStyles = {
  Procesado: 'bg-emerald-50 text-emerald-700',
  Entregado: 'bg-emerald-50 text-emerald-700',
  'Pendiente de pago': 'bg-amber-50 text-amber-700',
  Cancelado: 'bg-rose-50 text-rose-700',
};

const formatDate = (value) => {
  const date = value?.toDate ? value.toDate() : value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? 'Fecha no disponible' : new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(date);
};

const OrderHistoryCard = ({ order }) => {
  const products = order.products || [];
  const status = order.status || 'Procesado';

  const handleDownload = () => createReceiptPdf({
    order,
    address: order.shipping?.address,
    paymentName: order.paymentMethod === 'paypal' ? 'PayPal' : order.paymentMethod === 'oxxo' ? 'OXXO' : 'Tarjeta de débito o crédito',
    shippingName: order.shipping?.carrier,
    shippingCost: order.shipping?.cost ?? order.shippingCost,
    ivaAmount: order.ivaAmount,
    orderTotal: order.totalPaid,
  });

  return (
    <article className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(15,23,42,0.09)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-500">Orden</p><h3 className="mt-1 text-lg font-black text-slate-900">#{order.orderNumber || order.id}</h3><p className="mt-1 text-xs font-semibold text-slate-400">{formatDate(order.createdAt)}</p></div>
        <div className="text-right"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${statusStyles[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span><p className="mt-3 text-lg font-black text-slate-900">{money.format(Number(order.totalPaid) || 0)}</p></div>
      </div>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {products.slice(0, 4).map((product, index) => <div key={`${product.id || product.name}-${index}`} className="relative shrink-0"><img src={product.images?.[0] || product.image || 'https://via.placeholder.com/300?text=FIRSTPC'} alt={product.name || 'Producto'} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = 'https://via.placeholder.com/300?text=FIRSTPC'; }} className="h-12 w-12 rounded-xl border-2 border-white bg-slate-100 object-cover shadow-sm" /><span className="absolute -right-1 -top-1 rounded-full bg-slate-900 px-1.5 py-0.5 text-[9px] font-black text-white">×{product.quantity}</span></div>)}
          {products.length > 4 && <span className="ml-3 text-xs font-bold text-slate-400">+{products.length - 4} más</span>}
          {!products.length && <span className="text-xs font-semibold text-slate-400">Sin productos registrados</span>}
        </div>
        <button type="button" onClick={handleDownload} className="shrink-0 rounded-full bg-emerald-500 px-4 py-2.5 text-xs font-black text-white shadow-[0_8px_20px_rgba(16,185,129,0.2)] transition hover:bg-emerald-600">↓ <span className="hidden sm:inline">Descargar Comprobante</span><span className="sm:hidden">PDF</span></button>
      </div>
    </article>
  );
};

export default OrderHistoryCard;
