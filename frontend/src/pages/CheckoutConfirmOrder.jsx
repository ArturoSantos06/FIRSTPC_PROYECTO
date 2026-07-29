/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useLocation, useNavigate } from 'react-router-dom';
import CheckoutLayout from '../components/Checkout/common/CheckoutLayout';
import ConfirmOrderView from '../components/Checkout/ConfirmOrderView';
import OrderSummary from '../components/Checkout/common/OrderSummary';
import { useCart } from '../context/CartContext';
import { auth, db } from '../firebaseConfig';
import { createCheckoutOrder } from '../services/checkoutOrderService';
import { shippingOptions } from '../components/Checkout/Step3/ShippingOptions';

const IVA_RATE = 0.16;
const paymentLabels = { card: 'Tarjeta de débito o crédito', paypal: 'PayPal', oxxo: 'OXXO' };

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
  const ivaAmount = totalAmount * (IVA_RATE / (1 + IVA_RATE));
  const orderTotal = totalAmount + shippingCost;

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
      } finally {
        setIsLoading(false);
      }
    };

    loadCheckoutData();
  }, [state?.selectedAddressId]);

  const simulateReceiptEmail = (createdOrder) => {
    setEmailQueued(true);
    console.info('Preparar Cloud Function para enviar el comprobante:', { orderId: createdOrder.id, userId: auth.currentUser?.uid });
  };

  const handleConfirm = async () => {
    if (isProcessing || !cartItems.length || !auth.currentUser?.uid) return;
    setIsProcessing(true);
    setError('');

    try {
      const createdOrder = await createCheckoutOrder({
        cartItems,
        address,
        billing,
        shipping,
        selectedPaymentMethod,
        totalAmount,
        shippingCost,
        ivaAmount,
        orderTotal,
        userId: auth.currentUser.uid,
      });
      setOrder(createdOrder);
      clearCart();
      simulateReceiptEmail(createdOrder);
    } catch (saveError) {
      console.error('Error al crear el pedido:', saveError);
      if (saveError?.message?.startsWith('PRODUCT_NOT_FOUND:')) {
        setError('Uno de los productos del carrito ya no está disponible. Regresa al catálogo e inténtalo nuevamente.');
      } else if (saveError?.message?.startsWith('INSUFFICIENT_STOCK:')) {
        setError(`No hay stock suficiente ni integración de distribuidor para ${saveError.message.replace('INSUFFICIENT_STOCK:', '')}.`);
      } else {
        setError('No fue posible procesar el pedido con el distribuidor. Intenta nuevamente.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <CheckoutLayout
      currentStep={4}
      title="Confirmar pedido"
      description="Revisa tu información antes de finalizar la compra."
      summary={(
        <OrderSummary
          totalItems={totalItems}
          uniqueProducts={cartItems.length}
          totalAmount={totalAmount}
          shippingCost={shippingCost}
          ivaAmount={ivaAmount}
          showShipping
          buttonText={isProcessing ? 'Procesando con distribuidor...' : 'Confirmar y Pagar'}
          onProceed={handleConfirm}
          isReadyToProceed={!isLoading && Boolean(address) && cartItems.length > 0 && !isProcessing}
        />
      )}
    >
      <ConfirmOrderView
        address={address}
        billing={billing}
        cartItems={cartItems}
        emailQueued={emailQueued}
        error={error}
        isLoading={isLoading}
        isProcessing={isProcessing}
        order={order}
        orderNumber={order?.orderNumber}
        paymentName={paymentLabels[selectedPaymentMethod] || 'Tarjeta'}
        selectedPaymentMethod={selectedPaymentMethod}
        shipping={shipping}
        shippingCost={shippingCost}
        totalItems={totalItems}
        totalAmount={totalAmount}
        ivaAmount={ivaAmount}
        orderTotal={orderTotal}
        onProceed={handleConfirm}
        onNavigate={navigate}
      />
    </CheckoutLayout>
  );
};

export default CheckoutConfirmOrder;
