import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { openReceiptPdf } from '../components/Checkout/Step4/ReceiptPdf';
import MonthYearPicker from '../components/MonthYearPicker';
import Navbar from '../components/Navbar';
import Footer from '../components/Home/Footer';
import { WarningIcon } from '../components/icons/AppIcons';
import { db } from '../firebaseConfig';

const PAYMENT_NAMES = { card: 'Tarjeta', paypal: 'PayPal', oxxo: 'OXXO' };
const STATUSES = ['Pendiente de pago', 'Procesado', 'Enviado', 'Entregado', 'Reembolsado', 'Cancelado por falta de pago'];
const RMA_STATUS_OPTIONS = [
  ['PENDING', 'En revisión'],
  ['APPROVED', 'Aprobada para envío'],
  ['TESTING', 'En prueba técnica'],
  ['RESOLVED', 'Finalizada'],
  ['REJECTED', 'No aplica'],
];
const RMA_STATUS_LABELS = Object.fromEntries(RMA_STATUS_OPTIONS);

const toDate = (value) => {
  const date = value?.toDate ? value.toDate() : value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value) => {
  const date = toDate(value);
  return date ? new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(date) : 'Sin fecha';
};

const formatRemaining = (value, now) => {
  const expires = toDate(value);
  if (!expires) return 'Sin límite registrado';
  const milliseconds = expires.getTime() - now;
  if (milliseconds <= 0) return 'Vencido; esperando liberación';
  const hours = Math.floor(milliseconds / 3_600_000);
  const minutes = Math.floor((milliseconds % 3_600_000) / 60_000);
  return `${hours} h ${minutes.toString().padStart(2, '0')} min restantes`;
};

const getCustomerName = (order) => order.customer?.name
  || `${order.shipping?.address?.firstName || ''} ${order.shipping?.address?.lastName || ''}`.trim()
  || 'Cliente registrado';

const getCustomerEmail = (order) => order.customer?.email || order.email || 'No disponible';
const getProductQuantity = (order) => (order.products || []).reduce((total, product) => total + (Number(product.quantity) || 0), 0);
const getDistributorItems = (order) => (order.products || []).filter((product) => Number(product.distributorQuantity) > 0);
const normalize = (value) => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const getDateParts = (value) => {
  const date = toDate(value);
  return date ? { year: String(date.getFullYear()), month: String(date.getMonth() + 1) } : null;
};

const AdminOrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState('');
  const [now, setNow] = useState(Date.now());
  const [selectedDistributorItems, setSelectedDistributorItems] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const nextOrders = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      nextOrders.sort((left, right) => (toDate(right.createdAt)?.getTime() || 0) - (toDate(left.createdAt)?.getTime() || 0));
      setOrders(nextOrders);
      setLoading(false);
    }, (snapshotError) => {
      console.error('Error cargando historial de compras:', snapshotError);
      setError('No fue posible cargar el historial de compras.');
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  const filteredOrders = useMemo(() => {
    const query = normalize(search.trim());
    return orders.filter((order) => {
      const rmaStatus = String(order.rmaStatus || '').toUpperCase();
      const searchable = normalize(`${order.orderNumber} ${order.id} ${getCustomerName(order)} ${getCustomerEmail(order)} ${order.rmaTicket || ''} ${order.rmaTicketNumber || ''} ${order.rmaId || ''} ${rmaStatus} ${RMA_STATUS_LABELS[rmaStatus] || ''} ${order.rmaCreatedAt || ''} ${order.rmaStatus ? 'rma garantia garantia' : ''}`);
      const matchesStatus = statusFilter === 'all'
        || (statusFilter.startsWith('rma:') ? rmaStatus === statusFilter.slice(4) : (order.status || 'Procesado') === statusFilter);
      return (!query || searchable.includes(query))
        && matchesStatus
        && (!monthFilter || getDateParts(order.createdAt)?.month === monthFilter)
        && (!yearFilter || getDateParts(order.createdAt)?.year === yearFilter);
    });
  }, [orders, search, statusFilter, monthFilter, yearFilter]);

  const handleStatusChange = async (order, status) => {
    setSavingId(order.id);
    setError('');
    try {
      const shipmentUpdates = order.shipping?.shipment?.isDemo && status === 'Procesado'
        ? {
          'shipping.shipment.status': 'preparacion',
          'shipping.shipment.labelStatus': 'En preparación',
          'shipping.shipment.demoStartedAt': new Date().toISOString(),
          'shipping.shipment.updatedAt': new Date(),
        }
        : order.shipping?.shipment?.isDemo && status === 'Entregado'
        ? {
          'shipping.shipment.status': 'entregado',
          'shipping.shipment.labelStatus': 'Entregado',
          'shipping.shipment.updatedAt': new Date(),
        }
        : {};
      await updateDoc(doc(db, 'orders', order.id), {
        status,
        ...(status === 'Entregado' ? { receivedAt: order.receivedAt || new Date() } : {}),
        ...(status !== 'Pendiente de pago' ? { isReserved: false, reservationExpiresAt: null } : {}),
        ...shipmentUpdates,
      });
    } catch (saveError) {
      console.error('Error actualizando estado de compra:', saveError);
      setError('No fue posible actualizar el estado de esta compra.');
    } finally {
      setSavingId('');
    }
  };

  const handleRmaStatusChange = async (order, rmaStatus) => {
    setSavingId(`${order.id}-rma`);
    setError('');
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        rmaStatus,
        hasActiveRma: !['RESOLVED', 'REJECTED'].includes(rmaStatus),
      });
    } catch (saveError) {
      console.error('Error actualizando estado de garantía:', saveError);
      setError('No fue posible actualizar el estado de garantía.');
    } finally {
      setSavingId('');
    }
  };

  const viewReceipt = (order) => openReceiptPdf({
    order,
    address: order.shipping?.address,
    billing: order.billing,
    paymentName: PAYMENT_NAMES[order.paymentMethod] || 'Tarjeta',
    shippingName: order.shipping?.carrier || 'Envío',
    shippingCost: order.shipping?.cost ?? order.shippingCost ?? 0,
    ivaAmount: order.ivaAmount,
    orderTotal: order.totalPaid,
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC]/50 px-4 pb-12 font-['Montserrat'] pt-28 md:px-6 lg:px-10">
      <Navbar />
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 rounded-[32px] border border-slate-200/70 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.06)] sm:p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-emerald-500">Administración</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Historial de compras</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">Consulta pedidos, descarga comprobantes y actualiza su estado.</p>
        </header>

        <section className="mb-6 flex flex-col gap-3 rounded-[28px] border border-slate-200/70 bg-white p-4 shadow-sm lg:flex-row">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por folio, RMA, ticket, nombre o correo..." className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-emerald-400 focus:bg-white" />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-emerald-400 lg:w-64"><option value="all">Todos los estados</option><optgroup label="Estado de compra">{STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</optgroup><optgroup label="Estado de garantía">{RMA_STATUS_OPTIONS.map(([value, label]) => <option key={value} value={`rma:${value}`}>Garantía: {label}</option>)}</optgroup></select>
          <MonthYearPicker value={monthFilter && yearFilter ? `${yearFilter}-${monthFilter.padStart(2, '0')}` : ''} onChange={(value) => { const [year, month] = value.split('-'); setYearFilter(year || ''); setMonthFilter(month ? String(Number(month)) : ''); }} ariaLabel="Filtrar por mes y año" />
        </section>

        {error && <p role="alert" className="mb-5 rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</p>}
        <section className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
          <div className="border-b border-slate-100 px-5 py-4"><p className="text-sm font-black text-slate-800">{loading ? 'Cargando...' : `${filteredOrders.length} compra${filteredOrders.length === 1 ? '' : 's'}`}</p></div>
          {loading && <div className="p-8 text-center text-sm font-semibold text-slate-400">Cargando historial...</div>}
          {!loading && !filteredOrders.length && <div className="p-12 text-center text-sm font-semibold text-slate-400">No hay compras que coincidan con los filtros.</div>}
          {!loading && filteredOrders.length > 0 && <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left"><thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400"><tr><th className="px-5 py-4">Comprador</th><th className="px-4 py-4">Folio / fecha</th><th className="px-4 py-4">Pago</th><th className="px-4 py-4">Cantidad</th><th className="px-4 py-4">Estado</th><th className="px-5 py-4 text-right">Comprobante</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredOrders.map((order) => { const status = order.status || 'Procesado'; const isOxxoPending = order.paymentMethod === 'oxxo' && status === 'Pendiente de pago'; const distributorItems = getDistributorItems(order); return <tr key={order.id} className="align-top transition hover:bg-slate-50/70"><td className="px-5 py-4"><p className="max-w-[220px] truncate text-sm font-black text-slate-800" title={getCustomerName(order)}>{getCustomerName(order)}</p><p className="mt-1 max-w-[230px] truncate text-xs font-semibold text-slate-400" title={getCustomerEmail(order)}>{getCustomerEmail(order)}</p></td><td className="px-4 py-4"><p className="text-xs font-black text-slate-800">#{order.orderNumber || order.id}</p><p className="mt-1 whitespace-nowrap text-xs font-semibold text-slate-400">{formatDate(order.createdAt)}</p>{order.rmaStatus && <div className="mt-2 border-t border-slate-100 pt-2"><p className="text-[10px] font-black text-amber-700">RMA: {order.rmaTicket || order.rmaId || 'Sin folio'}</p><p className="mt-0.5 whitespace-nowrap text-[10px] font-semibold text-amber-600">Solicitud: {formatDate(order.rmaCreatedAt)}</p></div>}</td><td className="px-4 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">{PAYMENT_NAMES[order.paymentMethod] || 'Tarjeta'}</span>{isOxxoPending && <p className="mt-2 whitespace-nowrap text-[11px] font-black text-amber-600">{formatRemaining(order.reservationExpiresAt, now)}</p>}</td><td className="px-4 py-4 text-sm font-black text-slate-700"><div className="relative flex items-center gap-2"><p>{getProductQuantity(order)} pieza{getProductQuantity(order) === 1 ? '' : 's'}</p>{distributorItems.length > 0 && <button type="button" onClick={() => setSelectedDistributorItems({ items: distributorItems, orderId: order.distributorOrderId })} className="inline-flex items-center text-amber-500 transition hover:text-amber-600" aria-label="Ver desglose de cantidades"><WarningIcon className="h-4 w-4" strokeWidth={2.5} /></button>}</div></td><td className="px-4 py-4"><select value={status} onChange={(event) => handleStatusChange(order, event.target.value)} disabled={savingId === order.id} className={`rounded-xl border px-3 py-2 text-xs font-black outline-none disabled:opacity-50 ${status === 'Pendiente de pago' ? 'border-amber-200 bg-amber-50 text-amber-700' : status.includes('Cancelado') ? 'border-rose-200 bg-rose-50 text-rose-700' : status === 'Reembolsado' ? 'border-slate-200 bg-slate-100 text-slate-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>{STATUSES.map((option) => <option key={option}>{option}</option>)}</select>{order.rmaStatus && <select value={String(order.rmaStatus).toUpperCase()} onChange={(event) => handleRmaStatusChange(order, event.target.value)} disabled={savingId === `${order.id}-rma`} aria-label="Estado de garantía" className="mt-2 block rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-black text-amber-800 outline-none disabled:opacity-50">{RMA_STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>Garantía: {label}</option>)}</select>}</td><td className="px-5 py-4 text-right"><button type="button" onClick={() => viewReceipt(order)} className="rounded-full bg-emerald-500 px-4 py-2.5 text-xs font-black text-white transition hover:bg-emerald-600">Ver PDF</button></td></tr>; })}</tbody></table></div>}
        </section>
      </div>
      {selectedDistributorItems && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4" role="presentation" onClick={() => setSelectedDistributorItems(null)}><div className="w-full max-w-md rounded-2xl border border-amber-200 bg-white p-5 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="distributor-details-title" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><p id="distributor-details-title" className="text-sm font-black text-slate-900">Desglose de cantidades</p><p className="mt-1 text-xs font-semibold text-slate-500">Unidades solicitadas al distribuidor</p>{selectedDistributorItems.orderId && <p className="mt-2 text-xs font-black text-emerald-600">ID del distribuidor: {selectedDistributorItems.orderId}</p>}</div><button type="button" onClick={() => setSelectedDistributorItems(null)} className="rounded-lg px-2 py-1 text-lg font-bold text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Cerrar">×</button></div><div className="mt-4 space-y-3">{selectedDistributorItems.items.map((product) => <div key={product.id} className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-slate-700"><p className="font-black text-slate-900">{product.name}</p><p className="mt-1">Local: {product.localQuantity || 0} · Distribuidor: {product.distributorQuantity}</p></div>)}</div></div></div>}
      <div className="mt-12"><Footer /></div>
    </div>
  );
};

export default AdminOrderHistory;
