import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { createReceiptPdf } from '../Checkout/Step4/ReceiptPdf';

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

const statusStyles = {
  Procesado: 'bg-emerald-50 text-emerald-700',
  Entregado: 'bg-emerald-50 text-emerald-700',
  Reembolsado: 'bg-slate-100 text-slate-700',
  'Pendiente de pago': 'bg-amber-50 text-amber-700',
  Cancelado: 'bg-rose-50 text-rose-700',
};

const rmaStatusConfig = {
  PENDING: { label: '🟡 Garantía: En revisión', badge: 'bg-amber-50 text-amber-700 border-amber-200', description: 'Tu solicitud está siendo revisada por nuestro equipo.' },
  APPROVED: { label: '🔵 Garantía: Aprobada para envío', badge: 'bg-blue-50 text-blue-700 border-blue-200', description: 'Tu garantía fue aprobada y estamos coordinando el envío.' },
  TESTING: { label: '🟣 Garantía: En prueba técnica', badge: 'bg-purple-50 text-purple-700 border-purple-200', description: 'El producto se encuentra en evaluación técnica.' },
  RESOLVED: { label: '🟢 Garantía: Finalizada', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', description: 'El proceso de garantía ha finalizado.' },
  REJECTED: { label: '🔴 Garantía: No aplica', badge: 'bg-rose-50 text-rose-700 border-rose-200', description: 'La solicitud de garantía no aplica para este caso.' },
};

const formatDate = (value) => {
  const date = value?.toDate ? value.toDate() : value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? 'Fecha no disponible' : new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(date);
};

const OrderHistoryCard = ({ order }) => {
  const navigate = useNavigate();
  const products = order.products || [];
  const actionsRef = useRef(null);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [now, setNow] = useState(Date.now());
  const [rmaModalOpen, setRmaModalOpen] = useState(false);

  useEffect(() => {
    if (!actionsOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) setActionsOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, [actionsOpen]);

  const status = order.status || 'Procesado';
  const isReceived = status === 'Entregado';
  const receivedDate = order.receivedAt?.toDate ? order.receivedAt.toDate() : order.receivedAt ? new Date(order.receivedAt) : order.createdAt?.toDate ? order.createdAt.toDate() : order.createdAt ? new Date(order.createdAt) : null;
  const warrantyEnd = receivedDate && !Number.isNaN(receivedDate.getTime()) ? new Date(receivedDate.getFullYear() + 1, receivedDate.getMonth(), receivedDate.getDate()) : null;
  const remainingWarranty = warrantyEnd ? Math.max(0, warrantyEnd.getTime() - now) : 0;
  const remainingDays = Math.floor(remainingWarranty / 86_400_000);
  const remainingHours = Math.floor((remainingWarranty % 86_400_000) / 3_600_000);
  const remainingMinutes = Math.floor((remainingWarranty % 3_600_000) / 60_000);
  const selectedProduct = products.find((product) => product.id === selectedProductId) || products[0];
  const rmaStatus = String(order.rmaStatus || '').toUpperCase();
  const rmaDetails = rmaStatusConfig[rmaStatus];
  const currentRmaDetails = rmaDetails || rmaStatusConfig.PENDING;
  const hasActiveRma = order.hasActiveRma === true || Boolean(rmaStatus);
  const rmaTicket = order.rmaTicketNumber || order.rmaTicket || order.rmaId || `RMA-${String(order.orderNumber || order.id).replace(/^FPC-/, '').slice(-8)}`;
  const customerEmail = order.customer?.email || order.email || 'tu correo registrado';

  useEffect(() => {
    if (!isReceived) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, [isReceived]);

  const handleDownload = () => createReceiptPdf({
    order,
    address: order.shipping?.address,
    paymentName: order.paymentMethod === 'paypal' ? 'PayPal' : order.paymentMethod === 'oxxo' ? 'OXXO' : 'Tarjeta de débito o crédito',
    shippingName: order.shipping?.carrier,
    shippingCost: order.shipping?.cost ?? order.shippingCost,
    ivaAmount: order.ivaAmount,
    orderTotal: order.totalPaid,
  });


  const goToRequest = (type) => {
    const orderNumber = order.orderNumber || order.id;
    const product = selectedProduct?.name || 'Producto';
    const params = new URLSearchParams({ orden: orderNumber, producto: product });
    if (type === 'garantia') navigate(`/soporte?orderId=${encodeURIComponent(order.id)}&folio=${encodeURIComponent(order.folio || order.orderNumber || order.id)}&producto=${encodeURIComponent(product)}`);
    else navigate(`/soporte?tipo=${type === 'devolucion' ? 'devolucion' : 'reporte'}&${params.toString()}`);
    setActionsOpen(false);
  };

  const goToProduct = (action) => {
    if (!selectedProduct?.id) return;
    setActionsOpen(false);
    navigate(`/producto/${selectedProduct.id}${action === 'review' ? '#opiniones' : ''}`);
  };

  return (
    <article className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(15,23,42,0.09)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-500">Orden</p><h3 className="mt-1 text-lg font-black text-slate-900">#{order.orderNumber || order.id}</h3><p className="mt-1 text-xs font-semibold text-slate-400">{formatDate(order.createdAt)}</p></div>
        <div className="flex flex-col items-end gap-2 text-right"><div className="flex flex-wrap justify-end gap-2"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${statusStyles[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span>{rmaDetails && <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black ${rmaDetails.badge}`}>{rmaDetails.label}</span>}</div><p className="text-lg font-black text-slate-900">{money.format(Number(order.totalPaid) || 0)}</p></div>
      </div>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {products.slice(0, 4).map((product, index) => <div key={`${product.id || product.name}-${index}`} className="relative shrink-0"><img src={product.images?.[0] || product.image || 'https://via.placeholder.com/300?text=FIRSTPC'} alt={product.name || 'Producto'} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = 'https://via.placeholder.com/300?text=FIRSTPC'; }} className="h-12 w-12 rounded-xl border-2 border-white bg-slate-100 object-cover shadow-sm" /><span className="absolute -right-1 -top-1 rounded-full bg-slate-900 px-1.5 py-0.5 text-[9px] font-black text-white">×{product.quantity}</span></div>)}
          {products.length > 4 && <span className="ml-3 text-xs font-bold text-slate-400">+{products.length - 4} más</span>}
          {!products.length && <span className="text-xs font-semibold text-slate-400">Sin productos registrados</span>}
        </div>
        <div ref={actionsRef} className="relative flex flex-wrap justify-end gap-2"><button type="button" onClick={handleDownload} className="shrink-0 rounded-full bg-emerald-500 px-4 py-2.5 text-xs font-black text-white shadow-[0_8px_20px_rgba(16,185,129,0.2)] transition hover:bg-emerald-600">↓ <span className="hidden sm:inline">Descargar Comprobante</span><span className="sm:hidden">PDF</span></button>{isReceived && <><button type="button" onClick={() => setActionsOpen((open) => !open)} aria-expanded={actionsOpen} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 transition hover:border-emerald-400 hover:text-emerald-600">Acciones <ChevronDown size={14} className={actionsOpen ? 'rotate-180 transition-transform' : 'transition-transform'} /></button>{actionsOpen && <div className="absolute right-0 top-full z-30 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-2 font-['Montserrat'] shadow-[0_16px_40px_rgba(15,23,42,0.14)]">{products.length > 1 && <select aria-label="Seleccionar producto" value={selectedProductId} onChange={(event) => setSelectedProductId(event.target.value)} className="mb-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-400">{products.map((product, index) => <option key={`${product.id || product.name}-${index}`} value={product.id}>{product.name}</option>)}</select>}{hasActiveRma ? <button type="button" onClick={() => { setRmaModalOpen(true); setActionsOpen(false); }} className="block w-full rounded-xl px-3 py-2.5 text-left text-xs font-black text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700">Ver estado de Garantía</button> : <button type="button" onClick={() => goToRequest('garantia')} className="block w-full rounded-xl px-3 py-2.5 text-left text-xs font-black text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700">Solicitar Garantía (RMA)</button>}<button type="button" onClick={() => goToProduct('review')} className="block w-full rounded-xl px-3 py-2.5 text-left text-xs font-black text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700">Calificar producto</button><button type="button" onClick={() => goToProduct('repurchase')} className="block w-full rounded-xl px-3 py-2.5 text-left text-xs font-black text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700">Volver a comprar</button></div>}</>}</div>
      </div>
      {isReceived && <p className={`mt-4 text-xs font-bold ${remainingWarranty > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{warrantyEnd ? remainingWarranty > 0 ? `Garantía restante: ${remainingDays} días, ${remainingHours} h y ${remainingMinutes} min` : 'Garantía vencida' : 'Garantía de 1 año'}</p>}
      {rmaModalOpen && createPortal(<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 font-['Montserrat'] backdrop-blur-sm" role="presentation" onClick={() => setRmaModalOpen(false)}><div role="dialog" aria-modal="true" aria-labelledby="rma-status-title" className="w-full max-w-md rounded-[28px] border border-slate-100 bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500">Seguimiento de garantía</p><h2 id="rma-status-title" className="mt-2 text-xl font-black text-slate-900">{rmaTicket}</h2></div><button type="button" onClick={() => setRmaModalOpen(false)} className="rounded-full px-2 py-1 text-xl font-bold text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Cerrar">×</button></div><div className={`mt-5 rounded-2xl border p-4 ${currentRmaDetails.badge}`}><p className="text-sm font-black">{currentRmaDetails.label}</p><p className="mt-2 text-xs font-semibold leading-5">{currentRmaDetails.description}</p></div><p className="mt-5 rounded-2xl bg-slate-50 p-4 text-xs font-semibold leading-5 text-slate-600">Estamos en contacto contigo a través de tu correo: <span className="font-black text-slate-900">{customerEmail}</span></p></div></div>, document.body)}
    </article>
  );
};

export default OrderHistoryCard;
