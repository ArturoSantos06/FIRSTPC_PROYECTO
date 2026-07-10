import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import CheckoutStepper from './CheckoutStepper';
import CartItem from './CartItem';
import OrderSummary from './OrderSummary';

const ShoppingCart = ({ className = '' }) => {
  const { cartItems, totalItems, totalAmount, updateQuantity, removeItem, clearCart } = useCart();

  const itemDetails = useMemo(
    () =>
      cartItems.map((item) => {
        const quantity = Number.isFinite(Number(item.quantity)) ? Math.max(1, Number(item.quantity)) : 1;
        const price = Number(item.price) || 0;

        return {
          ...item,
          quantity,
          subtotal: price * quantity,
        };
      }),
    [cartItems]
  );

  const handleIncrement = (item) => {
    const maxStock = Number.isFinite(Number(item.stock)) && Number(item.stock) > 0 ? Number(item.stock) : Number.POSITIVE_INFINITY;
    updateQuantity(item.id, Math.min((Number(item.quantity) || 1) + 1, maxStock));
  };

  const handleDecrement = (item) => {
    updateQuantity(item.id, Math.max((Number(item.quantity) || 1) - 1, 1));
  };

  const handleQuantityInput = (item, value) => {
    updateQuantity(item.id, value);
  };

  return (
    <section className={`w-full font-['Montserrat'] ${className}`}>
      <div className="rounded-[32px] border border-slate-200/70 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)] overflow-hidden">
        <CheckoutStepper currentStep={1} />

        <div className="border-b border-slate-100 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,0.98))] px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-emerald-500">FIRSTPC Checkout</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Carrito de Compras</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">Administra cantidades, elimina productos y revisa el total en tiempo real.</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-slate-500 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                {totalItems} artículos
              </span>

              <button
                type="button"
                onClick={clearCart}
                disabled={itemDetails.length === 0}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-slate-500 transition hover:border-rose-200 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Vaciar
              </button>
            </div>
          </div>
        </div>

        {itemDetails.length === 0 ? (
          <div className="px-6 py-16 text-center sm:px-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-400">🛒</div>
            <h3 className="mt-5 text-xl font-black text-slate-800">Tu carrito está vacío</h3>
            <p className="mx-auto mt-2 max-w-md text-sm font-medium text-slate-500">
              Agrega productos desde el catálogo para comenzar a construir la compra.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 p-4 sm:p-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-8 xl:p-8">
            <div className="space-y-4">
              {itemDetails.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onIncrement={handleIncrement}
                  onDecrement={handleDecrement}
                  onChangeQuantity={handleQuantityInput}
                  onRemove={removeItem}
                />
              ))}
            </div>

            <OrderSummary totalItems={totalItems} uniqueProducts={itemDetails.length} totalAmount={totalAmount} />
          </div>
        )}
      </div>
    </section>
  );
};

export default ShoppingCart;