import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CheckoutLayout from '../components/Checkout/common/CheckoutLayout';
import OrderSummary from '../components/Checkout/common/OrderSummary';
import PaymentOptions from '../components/Checkout/Step3/PaymentOptions';
import ShippingOptions, { shippingOptions } from '../components/Checkout/Step3/ShippingOptions';
import { useCart } from '../context/CartContext';
import { auth } from '../firebaseConfig';
import { getCouponForUser } from '../services/couponService';

const CouponFeedbackModal = ({ message, onClose }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 font-['Montserrat'] backdrop-blur-sm">
    <div className="w-full max-w-sm rounded-[28px] bg-white p-7 text-center shadow-2xl">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-2xl text-amber-500">!</div>
      <h2 className="mt-5 text-xl font-black text-slate-900">Código no disponible</h2>
      <p className="mt-3 text-sm font-medium leading-6 text-slate-500">{message}</p>
      <button type="button" onClick={onClose} className="mt-6 w-full rounded-full bg-emerald-500 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-600">Entendido</button>
    </div>
  </div>
);

const CouponField = ({ appliedCoupon, onApply }) => {
  const [code, setCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleApply = async () => {
    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode || !auth.currentUser?.uid) return;
    setIsApplying(true);
    try {
      const coupon = await getCouponForUser(auth.currentUser.uid);
      if (!coupon || coupon.code !== normalizedCode) throw new Error('El código no es válido para esta cuenta.');
      if (coupon.status === 'used') throw new Error('Este código ya fue utilizado y no puede volver a usarse.');
      onApply({ code: coupon.code, discountRate: Number(coupon.discountRate) || 0.10 });
      setCode('');
    } catch (error) {
      setFeedback(error?.code === 'permission-denied' ? 'Firestore no permite consultar este cupón. Verifica que las reglas de welcomeCoupons estén publicadas.' : error.message || 'No pudimos validar el código.');
    } finally {
      setIsApplying(false);
    }
  };

  return <>
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-emerald-500">Cupón o código de descuento</p>
      {appliedCoupon ? <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-emerald-50 px-4 py-3"><span className="text-sm font-black text-emerald-700">{appliedCoupon.code} · 10% aplicado</span><span className="text-lg text-emerald-600">✓</span></div> : <div className="mt-3 flex gap-2"><input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} onKeyDown={(event) => { if (event.key === 'Enter') handleApply(); }} placeholder="Ej. FIRST10-ABC123" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-bold uppercase outline-none focus:border-emerald-400 focus:bg-white" /><button type="button" onClick={handleApply} disabled={isApplying || !code.trim()} className="rounded-xl bg-slate-900 px-4 py-3 text-xs font-black text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50">{isApplying ? 'Validando...' : 'Aplicar'}</button></div>}
    </div>
    {feedback && <CouponFeedbackModal message={feedback} onClose={() => setFeedback('')} />}
  </>;
};

const CheckoutShippingPayment = () => {
  const navigate = useNavigate();
  const { state: checkoutState } = useLocation();
  const { cartItems, totalItems, totalAmount } = useCart();
  const [selectedShipping, setSelectedShipping] = useState('estafeta');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [currentStep, setCurrentStep] = useState(3);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const shippingCost = useMemo(
    () => shippingOptions.find(({ id }) => id === selectedShipping)?.price || 0,
    [selectedShipping],
  );

  const isPaymentValid = Boolean(selectedPaymentMethod);
  const discountAmount = appliedCoupon ? totalAmount * appliedCoupon.discountRate : 0;

  const handlePaymentChange = (method) => setSelectedPaymentMethod(method);

  const handleContinue = () => {
    if (!isPaymentValid || !selectedShipping) return;

    setCurrentStep(4);
    navigate('/checkout/confirmacion', {
      state: {
        selectedAddressId: checkoutState?.selectedAddressId,
        selectedShipping,
        selectedPaymentMethod,
        coupon: appliedCoupon,
      },
    });
  };

  return (
    <CheckoutLayout
      currentStep={currentStep}
      title="Envío y pago"
      description="Elige cómo recibir tu compra y completa el pago."
      summary={(
        <OrderSummary
          totalItems={totalItems}
          uniqueProducts={cartItems.length}
          totalAmount={totalAmount}
          shippingCost={shippingCost}
          discountAmount={discountAmount}
          showShipping
          buttonText="Ir al siguiente paso"
          onProceed={handleContinue}
          isReadyToProceed={Boolean(selectedShipping && isPaymentValid)}
        >
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-emerald-500">Tu carrito</p>
            <div className="mt-4 space-y-3">
              {cartItems.slice(0, 3).map((item) => <div key={item.id} className="flex items-center justify-between gap-3 text-sm"><span className="truncate font-semibold text-slate-600">{item.name || item.title || 'Producto'}</span><span className="shrink-0 font-black text-slate-900">×{item.quantity}</span></div>)}
              {cartItems.length > 3 && <p className="text-xs font-bold text-slate-400">+ {cartItems.length - 3} producto(s) más</p>}
              {cartItems.length === 0 && <p className="text-sm font-semibold text-slate-400">Tu carrito está vacío.</p>}
            </div>
          </div>
        </OrderSummary>
      )}
    >
      <div className="space-y-7">
            <section>
              <div className="mb-4"><p className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-500">Paso 1</p><h3 className="mt-1 text-xl font-black text-slate-900">Forma de envío</h3></div>
              <ShippingOptions selectedShipping={selectedShipping} onShippingChange={setSelectedShipping} />
            </section>
            <section>
              <div className="mb-4"><p className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-500">Paso 2</p><h3 className="mt-1 text-xl font-black text-slate-900">Forma de pago</h3></div>
              <PaymentOptions selectedPaymentMethod={selectedPaymentMethod} onPaymentMethodChange={handlePaymentChange} />
            </section>
            <CouponField appliedCoupon={appliedCoupon} onApply={setAppliedCoupon} />
        </div>
    </CheckoutLayout>
  );
};

export default CheckoutShippingPayment;
