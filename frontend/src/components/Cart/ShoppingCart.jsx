import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const moneyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
});

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
        <div className="border-b border-slate-100 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,0.98))] px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-emerald-500">FIRSTPC Checkout</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Carrito de Compras</h2>
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
                <article
                  key={item.id}
                  className="grid gap-4 rounded-[28px] border border-slate-200/70 bg-slate-50/70 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] transition hover:border-emerald-200/80 hover:bg-white sm:grid-cols-[120px_minmax(0,1fr)]"
                >
                  <div className="flex items-center justify-center overflow-hidden rounded-[24px] border border-slate-100 bg-white p-3 shadow-[0_10px_25px_rgba(15,23,42,0.06)] sm:h-full">
                    <img
                      src={item.image || 'https://via.placeholder.com/300?text=FIRSTPC'}
                      alt={item.name}
                      className="h-full max-h-[100px] w-full object-contain sm:max-h-none"
                    />
                  </div>

                  <div className="flex min-w-0 flex-col gap-4 justify-between">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-white">
                            {item.brand || 'FIRSTPC'}
                          </span>
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-700">
                            {item.category || 'Producto'}
                          </span>
                        </div>

                        <h3 className="mt-3 truncate text-lg font-black tracking-tight text-slate-900 sm:text-xl">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-sm font-medium text-slate-500">
                          Stock disponible: {Number.isFinite(Number(item.stock)) ? Number(item.stock) : 'Ilimitado'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-rose-100 bg-rose-50 text-rose-600 transition hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-100"
                        aria-label={`Eliminar ${item.name}`}
                      >
                        🗑
                      </button>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-[0_10px_20px_rgba(15,23,42,0.05)]">
                        <button
                          type="button"
                          onClick={() => handleDecrement(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                          aria-label={`Disminuir cantidad de ${item.name}`}
                        >
                          -
                        </button>

                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            if (val === '') {
                              updateQuantity(item.id, '');
                            } else {
                              const maxStock = Number.isFinite(Number(item.stock)) && Number(item.stock) > 0 ? Number(item.stock) : Number.POSITIVE_INFINITY;
                              updateQuantity(item.id, Math.min(Number(val), maxStock));
                            }
                          }}
                          onBlur={(e) => {
                            if (!e.target.value || Number(e.target.value) < 1) {
                              updateQuantity(item.id, 1);
                            }
                          }}
                          className="w-8 border-0 bg-transparent px-0 text-center text-sm font-bold text-slate-900 outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />

                        <button
                          type="button"
                          onClick={() => handleIncrement(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                          aria-label={`Incrementar cantidad de ${item.name}`}
                        >
                          +
                        </button>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-[0_10px_20px_rgba(15,23,42,0.04)]">
                        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Precio unitario</p>
                        <p className="mt-0.5 text-sm font-bold text-slate-900">{moneyFormatter.format(Number(item.price) || 0)}</p>
                      </div>

                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 shadow-[0_10px_20px_rgba(16,185,129,0.06)]">
                        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-600">Subtotal</p>
                        <p className="mt-0.5 text-sm font-extrabold text-emerald-700">
                          {moneyFormatter.format(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="h-fit rounded-[30px] border border-slate-200/70 bg-slate-50 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.05)] sm:p-6">
              <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-emerald-500">Resumen</p>
                <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Total de compra</h3>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>Productos</span>
                    <span className="font-bold text-slate-900">{itemDetails.length}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>Artículos</span>
                    <span className="font-bold text-slate-900">
                      {totalItems}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-base text-slate-600">
                    <span className="font-medium">Subtotal</span>
                    <span className="text-xl font-black text-slate-900">{moneyFormatter.format(totalAmount)}</span>
                  </div>
                </div>

                <Link
                  to="/#"
                  className="mt-6 block w-full rounded-full bg-[#10B981] px-5 py-3 text-center text-sm font-bold text-white shadow-[0_14px_30px_rgba(16,185,129,0.24)] transition hover:bg-emerald-600 hover:-translate-y-0.5"
                >
                  Continuar compra
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
};

export default ShoppingCart;