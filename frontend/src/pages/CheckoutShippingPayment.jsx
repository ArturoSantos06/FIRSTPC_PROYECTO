import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CheckoutLayout from '../components/Checkout/common/CheckoutLayout';
import OrderSummary from '../components/Checkout/common/OrderSummary';
import PaymentOptions from '../components/Checkout/Step3/PaymentOptions';
import ShippingOptions, { shippingOptions } from '../components/Checkout/Step3/ShippingOptions';
import { useCart } from '../context/CartContext';

const CheckoutShippingPayment = () => {
  const navigate = useNavigate();
  const { state: checkoutState } = useLocation();
  const { cartItems, totalItems, totalAmount } = useCart();
  const [selectedShipping, setSelectedShipping] = useState('estafeta');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [currentStep, setCurrentStep] = useState(3);

  const shippingCost = useMemo(
    () => shippingOptions.find(({ id }) => id === selectedShipping)?.price || 0,
    [selectedShipping],
  );

  const isPaymentValid = Boolean(selectedPaymentMethod);

  const handlePaymentChange = (method) => setSelectedPaymentMethod(method);

  const handleContinue = () => {
    if (!isPaymentValid || !selectedShipping) return;

    setCurrentStep(4);
    navigate('/checkout/confirmacion', {
      state: {
        selectedAddressId: checkoutState?.selectedAddressId,
        selectedShipping,
        selectedPaymentMethod,
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
        </div>
    </CheckoutLayout>
  );
};

export default CheckoutShippingPayment;
