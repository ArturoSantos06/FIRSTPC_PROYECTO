import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import CheckoutLayout from '../components/Checkout/common/CheckoutLayout';
import OrderSummary from '../components/Checkout/common/OrderSummary';
import ReceiptPdf from '../components/Checkout/Step4/ReceiptPdf';
import { useCart } from '../context/CartContext';
import { auth, db } from '../firebaseConfig';
import { shippingOptions } from '../components/Checkout/Step3/ShippingOptions';

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const IVA_RATE = 0.16;

const paymentLabels = { card: 'Tarjeta de débito o crédito', paypal: 'PayPal', oxxo: 'OXXO' };

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

const CheckoutConfirmOrder = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { cartItems, totalItems, totalAmount, clearCart } = useCart();
  const [address, setAddress] = useState(null);
  const [billing, setBilling] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);
  const [emailQueued, setEmailQueued] = useState(false);

  const selectedShipping = state?.selectedShipping || 'estafeta';
  const selectedPaymentMethod = state?.selectedPaymentMethod || 'card';
  const shipping = shippingOptions.find((option) => option.id === selectedShipping) || shippingOptions[0];
  const shippingCost = cartItems.length ? shipping.price : 0;
  const subtotalWithShipping = totalAmount + shippingCost;
  const ivaAmount = totalAmount * (IVA_RATE / (1 + IVA_RATE));
  const orderTotal = subtotalWithShipping;

  useEffect(() => {
    const loadCheckoutData = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) { setIsLoading(false); return; }
      try {
        const [addressesSnapshot, billingSnapshot] = await Promise.all([
          getDocs(query(collection(db, 'addresses'), where('userId', '==', userId))),
          getDocs(query(collection(db, 'billing_profiles'), where('userId', '==', userId))),
        ]);
        const selectedAddress = addressesSnapshot.docs.find((document) => document.id === state?.selectedAddressId) || addressesSnapshot.docs[0];
        setAddress(selectedAddress ? { id: selectedAddress.id, ...selectedAddress.data() } : null);
        setBilling(billingSnapshot.docs[0]?.data() || null);
      } catch (loadError) {
        console.error('Error al cargar los datos del checkout:', loadError);
        setError('No fue posible cargar la información del pedido.');
      } finally { setIsLoading(false); }
    };
    loadCheckoutData();
  }, []);

  const paymentName = paymentLabels[selectedPaymentMethod] || 'Tarjeta';
  const cardLabel = 'Tarjeta seleccionada';

  const orderNumber = order?.orderNumber;

  const simulateReceiptEmail = (createdOrder) => {
    setEmailQueued(true);
    console.info('Preparar Cloud Function para enviar el comprobante:', { orderId: createdOrder.id, userId: auth.currentUser?.uid });
  };

  const handleConfirm = async () => {
    if (isProcessing || !cartItems.length || !auth.currentUser?.uid) return;
    setIsProcessing(true); setError('');
    const createdAt = new Date();
    const orderData = {
      userId: auth.currentUser.uid,
      orderNumber: `FPC-${createdAt.getTime().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`,
      products: cartItems.map(({ id, name, title, image, price, quantity }) => ({ id, name: name || title || 'Producto', image: image || '', price: Number(price) || 0, quantity })),
      shipping: { carrier: shipping.name, id: shipping.id, cost: shippingCost, address },
      billing: billing || { note: 'Factura de público general con RFC genérico' },
      paymentMethod: selectedPaymentMethod,
      subtotal: totalAmount,
      ivaRate: IVA_RATE,
      ivaAmount,
      shippingCost,
      totalPaid: orderTotal,
      createdAt: serverTimestamp(),
      status: selectedPaymentMethod === 'oxxo' ? 'Pendiente de pago' : 'Procesado',
    };
    try {
      const document = await addDoc(collection(db, 'orders'), orderData);
      const createdOrder = { id: document.id, ...orderData, createdAt };
      setOrder(createdOrder);
      clearCart();
      simulateReceiptEmail(createdOrder);
    } catch (saveError) {
      console.error('Error al crear el pedido:', saveError);
      setError('No fue posible procesar el pedido. Intenta nuevamente.');
    } finally { setIsProcessing(false); }
  };

  return (
    <>
    <CheckoutLayout
      currentStep={4}
      title="Confirmar pedido"
      description="Revisa tu información antes de finalizar la compra."
      summary={<OrderSummary totalItems={totalItems} uniqueProducts={cartItems.length} totalAmount={totalAmount} shippingCost={shippingCost} ivaAmount={ivaAmount} showShipping buttonText={isProcessing ? 'Procesando...' : 'Confirmar y Pagar'} onProceed={handleConfirm} isReadyToProceed={!isLoading && Boolean(address) && cartItems.length > 0 && !isProcessing} />}
    >
          <div className="space-y-5">
            {isLoading ? <div className="rounded-[24px] bg-slate-50 p-8 text-center text-sm font-bold text-slate-500">Cargando información...</div> : <>
              <Section eyebrow="Envío" title="Dirección de envío"><div className="grid gap-4 sm:grid-cols-2"><Detail label="Destinatario">{address && `${address.firstName} ${address.lastName}`}</Detail><Detail label="Teléfono">{address?.phone}</Detail><div className="sm:col-span-2"><Detail label="Domicilio">{address && `${address.street} ${address.exteriorNumber}${address.interiorNumber ? ` Int. ${address.interiorNumber}` : ''}, ${address.neighborhood}, C.P. ${address.postalCode}, ${address.city}, ${address.state}`}</Detail></div><Detail label="Paquetería">{shipping.name}</Detail></div></Section>
              <Section eyebrow="Facturación" title="Datos fiscales">{billing ? <div className="grid gap-4 sm:grid-cols-2"><Detail label="Razón social">{billing.companyName}</Detail><Detail label="RFC">{billing.rfc}</Detail><Detail label="Régimen">{billing.taxRegimen}</Detail><Detail label="Uso de CFDI">{billing.cfdiUse}</Detail></div> : <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">Factura de público general con RFC genérico</p>}</Section>
              <Section eyebrow="Pago" title="Método seleccionado"><div className="flex items-center justify-between rounded-2xl bg-emerald-50/60 p-4"><span className="text-sm font-black text-slate-800">{paymentName}</span><span className="text-sm font-bold text-emerald-700">{selectedPaymentMethod === 'card' ? cardLabel : 'Pago simulado'}</span></div></Section>
              <Section eyebrow="Productos" title={`Artículos (${totalItems})`}><div className="divide-y divide-slate-100">{cartItems.map((item) => <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"><img src={item.image} alt="" className="h-14 w-14 rounded-xl object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-black text-slate-800">{item.name || item.title || 'Producto'}</p><p className="mt-1 text-xs font-semibold text-slate-400">Cantidad: {item.quantity}</p></div><p className="text-sm font-black text-slate-900">{money.format(Number(item.price) || 0)}</p></div>)}</div></Section>
            </>}
            {error && <p className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-600">{error}</p>}
      </div>
    </CheckoutLayout>
      {order && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="order-success-title">
        <div className="w-full max-w-md rounded-[32px] border border-emerald-100 bg-white p-6 text-center font-['Montserrat'] shadow-2xl sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">✓</div>
          <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.3em] text-emerald-500">Pedido confirmado</p>
          <h2 id="order-success-title" className="mt-2 text-3xl font-black text-slate-900">¡Gracias por tu compra!</h2>
          <p className="mt-3 text-sm font-medium text-slate-500">Tu número de orden es <strong className="text-slate-900">{orderNumber}</strong>.</p>
          <ReceiptPdf
            order={order}
            address={address}
            paymentName={paymentName}
            shippingName={order.shipping?.carrier || shipping.name}
            shippingCost={order.shippingCost ?? order.shipping?.cost ?? 0}
            ivaAmount={order.ivaAmount ?? 0}
            orderTotal={order.totalPaid ?? 0}
          />
          <p className="mt-5 text-xs font-semibold text-slate-500">{emailQueued && 'Hemos enviado una copia de tu comprobante al correo electrónico registrado.'}</p>
          <button type="button" onClick={() => navigate('/')} className="mt-5 text-sm font-bold text-emerald-600 hover:text-emerald-700">Volver a la tienda</button>
        </div>
      </div>}
    </>
  );
};

export default CheckoutConfirmOrder;
