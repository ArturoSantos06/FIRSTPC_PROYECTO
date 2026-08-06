import ReceiptPdf from './Step4/ReceiptPdf';

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const formatDeadline = (value) => {
  const date = value?.toDate ? value.toDate() : value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
    : '24 horas después de confirmar';
};

const Section = ({ eyebrow, title, children }) => (
  <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-500">{eyebrow}</p>
    <h3 className="mt-2 text-lg font-black text-slate-900">{title}</h3>
    <div className="mt-4">{children}</div>
  </section>
);

const Detail = ({ label, children }) => (
  <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-sm font-bold text-slate-700">{children || '—'}</p></div>
);

const ConfirmOrderView = ({
  address, billing, cartItems, error, isLoading, order, orderNumber,
  paymentName, selectedPaymentMethod, shipping, onNavigate, orderTotal, totalItems, coupon, discountAmount,
  couponError, onCloseCouponError,
}) => (
  <>
    <div className="space-y-5">
      {isLoading ? <div className="rounded-[24px] bg-slate-50 p-8 text-center text-sm font-bold text-slate-500">Cargando información...</div> : <>
        <Section eyebrow="Envío" title="Dirección de envío"><div className="grid gap-4 sm:grid-cols-2"><Detail label="Destinatario">{address && `${address.firstName} ${address.lastName}`}</Detail><Detail label="Teléfono">{address?.phone}</Detail><div className="sm:col-span-2"><Detail label="Domicilio">{address && `${address.street} ${address.exteriorNumber}${address.interiorNumber ? ` Int. ${address.interiorNumber}` : ''}, ${address.neighborhood}, C.P. ${address.postalCode}, ${address.city}, ${address.state}`}</Detail></div><Detail label="Paquetería">{shipping.name}</Detail></div></Section>
        <Section eyebrow="Facturación" title="Datos fiscales">{billing ? <div className="grid gap-4 sm:grid-cols-2"><Detail label="Razón social">{billing.companyName}</Detail><Detail label="RFC">{billing.rfc}</Detail><Detail label="Régimen">{billing.taxRegimen}</Detail><Detail label="Uso de CFDI">{billing.cfdiUse}</Detail></div> : <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">Factura de público general con RFC genérico</p>}</Section>
        <Section eyebrow="Pago" title="Método seleccionado"><div className="flex items-center justify-between rounded-2xl bg-emerald-50/60 p-4"><span className="text-sm font-black text-slate-800">{paymentName}</span><span className="text-sm font-bold text-emerald-700">{selectedPaymentMethod === 'card' ? 'Tarjeta seleccionada' : 'Pago por procesar'}</span></div></Section>
        {coupon && <Section eyebrow="Descuento" title="Cupón aplicado"><div className="flex items-center justify-between rounded-2xl bg-emerald-50/60 p-4"><span className="text-sm font-black text-slate-800">{coupon.code}</span><span className="text-sm font-bold text-emerald-700">-{money.format(discountAmount)}</span></div></Section>}
        <Section eyebrow="Productos" title={`Artículos (${totalItems})`}><div className="divide-y divide-slate-100">{cartItems.map((item) => <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"><img src={item.images?.[0] || item.image || 'https://via.placeholder.com/300?text=FIRSTPC'} alt="" className="h-14 w-14 rounded-xl object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-black text-slate-800">{item.name || item.title || 'Producto'}</p><p className="mt-1 text-xs font-semibold text-slate-400">Cantidad: {item.quantity}</p></div><p className="text-sm font-black text-slate-900">{money.format(Number(item.price) || 0)}</p></div>)}</div></Section>
      </>}
      {error && <p className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-600">{error}</p>}
    </div>
    {couponError && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true"><div className="w-full max-w-sm rounded-[28px] bg-white p-7 text-center font-['Montserrat'] shadow-2xl"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-2xl text-amber-500">!</div><h2 className="mt-5 text-xl font-black text-slate-900">Código ya utilizado</h2><p className="mt-3 text-sm font-medium leading-6 text-slate-500">{couponError}</p><button type="button" onClick={onCloseCouponError} className="mt-6 w-full rounded-full bg-emerald-500 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-600">Entendido</button></div></div>}
    {order && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true" aria-labelledby="order-success-title"><div className="w-full max-w-md rounded-[32px] border border-emerald-100 bg-white p-6 text-center font-['Montserrat'] shadow-2xl sm:p-10"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">✓</div><p className="mt-6 text-[11px] font-bold uppercase tracking-[0.3em] text-emerald-500">Pedido confirmado</p><h2 id="order-success-title" className="mt-2 text-3xl font-black text-slate-900">¡Gracias por tu compra!</h2><p className="mt-3 text-sm font-medium text-slate-500">Tu número de orden es <strong className="text-slate-900">{orderNumber}</strong>.</p>{order.paymentMethod === 'oxxo' && <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700">Folio para pagar en OXXO</p><p className="mt-1 font-mono text-lg font-black tracking-wide text-slate-900">{order.oxxoReference}</p><p className="mt-2 text-xs font-semibold leading-5 text-amber-800">Paga en cualquier tienda OXXO antes del {formatDeadline(order.reservationExpiresAt)}. Si no se registra el pago dentro de 24 horas, la compra se cancelará automáticamente.</p></div>}<ReceiptPdf order={order} address={address} billing={billing} paymentName={paymentName} shippingName={order.shipping?.carrier || shipping.name} shippingCost={order.shippingCost ?? order.shipping?.cost ?? 0} ivaAmount={order.ivaAmount ?? 0} orderTotal={order.totalPaid ?? 0} /><p className="mt-5 text-xs font-semibold leading-5 text-slate-500">Tu comprobante quedó guardado en <strong className="text-slate-700">Mis pedidos</strong>. Desde ahí podrás consultarlo y descargarlo.</p>{order.paymentMethod !== 'oxxo' && <p className="mt-3 text-xs font-bold text-emerald-600">Consulta tu guía de envío en <strong>Mis pedidos</strong>.</p>}<div className="mt-5 flex flex-col gap-3 sm:flex-row"><button type="button" onClick={() => onNavigate('/perfil/compras')} className="flex-1 rounded-full bg-emerald-500 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-600">Ir a mis pedidos</button><button type="button" onClick={() => onNavigate('/')} className="flex-1 rounded-full border border-emerald-200 px-4 py-3 text-sm font-bold text-emerald-600 transition hover:bg-emerald-50">Volver a la tienda</button></div></div></div>}
  </>
);

export default ConfirmOrderView;
