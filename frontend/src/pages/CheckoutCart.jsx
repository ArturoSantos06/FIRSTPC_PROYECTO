import { useMemo } from 'react';
import { useCart } from '../context/CartContext';
import CheckoutLayout from '../components/Checkout/common/CheckoutLayout';
import CartItem from '../components/Checkout/Step1/CartItem';
import OrderSummary from '../components/Checkout/common/OrderSummary';

const CheckoutCart = ({ className = '' }) => {
  const { cartItems, totalItems, totalAmount, updateQuantity, removeItem, clearCart } = useCart();

  const itemDetails = useMemo(
    () => cartItems.map((item) => {
      const quantity = Number.isFinite(Number(item.quantity)) ? Math.max(1, Number(item.quantity)) : 1;
      const price = Number(item.price) || 0;
      return { ...item, quantity, subtotal: price * quantity };
    }),
    [cartItems],
  );

  const handleIncrement = (item) => {
    const maxStock = Number.isFinite(Number(item.stock)) && Number(item.stock) > 0 ? Number(item.stock) : Number.POSITIVE_INFINITY;
    updateQuantity(item.id, Math.min((Number(item.quantity) || 1) + 1, maxStock));
  };

  const handleDecrement = (item) => updateQuantity(item.id, Math.max((Number(item.quantity) || 1) - 1, 1));
  const handleQuantityInput = (item, value) => updateQuantity(item.id, value);

  return (
    <div className={className}>
      <CheckoutLayout
        currentStep={1}
        title="Carrito de Compras"
        description="Administra cantidades, elimina productos y revisa el total en tiempo real."
        headerExtra={(
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 min-w-[140px] items-center justify-center whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">{totalItems} artículos</span>
            <button type="button" onClick={clearCart} disabled={itemDetails.length === 0} className="inline-flex h-10 min-w-[112px] items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 transition hover:border-rose-200 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-50">Vaciar</button>
          </div>
        )}
        summary={<OrderSummary totalItems={totalItems} uniqueProducts={itemDetails.length} totalAmount={totalAmount} />}
      >
        {itemDetails.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-400">🛒</div>
            <h3 className="mt-5 text-xl font-black text-slate-800">Tu carrito está vacío</h3>
            <p className="mx-auto mt-2 max-w-md text-sm font-medium text-slate-500">Agrega productos desde el catálogo para comenzar a construir la compra.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {itemDetails.map((item) => <CartItem key={item.id} item={item} onIncrement={handleIncrement} onDecrement={handleDecrement} onChangeQuantity={handleQuantityInput} onRemove={removeItem} />)}
          </div>
        )}
      </CheckoutLayout>
    </div>
  );
};

export default CheckoutCart;
