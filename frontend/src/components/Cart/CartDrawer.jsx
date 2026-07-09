import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const moneyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
});

const CartDrawer = ({ isOpen, onClose }) => {
  const { cartItems, totalItems, totalAmount, updateQuantity, removeItem } = useCart();

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose} 
        aria-label="Cerrar carrito"
      />

      <aside className="fixed right-4 sm:right-16 lg:right-[10%] xl:right-[14%] 2xl:right-[19%] top-[100px] z-50 flex w-full max-w-[380px] flex-col rounded-[32px] border border-slate-100 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.15)] font-['Montserrat']">
        
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900">Tu carrito</h2>
            <p className="mt-0.5 text-xs font-medium text-slate-500">{totalItems} artículos seleccionados</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        <div className="max-h-[45vh] overflow-y-auto px-5 py-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
              <span className="text-3xl">🛒</span>
              <h3 className="mt-3 text-base font-black text-slate-800">Carrito vacío</h3>
              <p className="mt-1 px-4 text-xs font-medium text-slate-500">Agrega productos desde el catálogo para empezar a comprar.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <article key={item.id} className="rounded-[24px] border border-slate-200/70 bg-slate-50/50 p-3 shadow-sm transition hover:shadow-md">
                  <div className="flex gap-3">
                    <img
                      src={item.image || 'https://via.placeholder.com/300?text=FIRSTPC'}
                      alt={item.name}
                      className="h-16 w-16 rounded-[16px] object-cover border border-slate-100"
                    />

                    <div className="flex flex-1 flex-col justify-between min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold text-slate-900">{item.name}</h3>
                          <p className="text-[10px] font-bold text-slate-400">{item.brand}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-slate-300 hover:text-rose-500 transition text-sm"
                        >
                          🗑
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-0.5">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, Number(item.quantity) - 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition"
                          >
                            -
                          </button>
                          <span className="min-w-[24px] text-center text-xs font-bold text-slate-900">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, Number(item.quantity) + 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition"
                          >
                            +
                          </button>
                        </div>
                        
                        <p className="text-sm font-black text-emerald-500">
                          {moneyFormatter.format((Number(item.price) || 0) * Number(item.quantity || 1))}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-5 rounded-b-[32px]">
          <div className="rounded-[24px] bg-slate-900 p-4 sm:p-5 text-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Total a pagar</span>
              <span className="text-xl font-black">{moneyFormatter.format(totalAmount)}</span>
            </div>

            <div className="mt-4 flex gap-2">
              <Link
                to="/carrito"
                onClick={onClose}
                className="flex-1 rounded-full border border-white/10 bg-white/5 py-2.5 text-center text-xs font-bold text-white transition hover:bg-white/10"
              >
                Ver carrito
              </Link>
              <Link
                to="/#"
                onClick={onClose}
                className="flex-1 rounded-full bg-[#10B981] py-2.5 text-center text-xs font-bold text-white shadow-[0_8px_20px_rgba(16,185,129,0.25)] transition hover:bg-emerald-600"
              >
                Pagar
              </Link>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
};

export default CartDrawer;