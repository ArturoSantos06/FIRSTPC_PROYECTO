import React from 'react';

const moneyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
});

const CartItem = ({ item, onIncrement, onDecrement, onChangeQuantity, onRemove }) => {
  return (
    <article className="grid gap-4 rounded-[28px] border border-slate-200/70 bg-slate-50/70 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] transition hover:border-emerald-200/80 hover:bg-white sm:grid-cols-[120px_minmax(0,1fr)]">
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
            onClick={() => onRemove(item.id)}
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
              onClick={() => onDecrement(item)}
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
                  onChangeQuantity(item, '');
                } else {
                  const maxStock = Number.isFinite(Number(item.stock)) && Number(item.stock) > 0 ? Number(item.stock) : Number.POSITIVE_INFINITY;
                  onChangeQuantity(item, Math.min(Number(val), maxStock));
                }
              }}
              onBlur={(e) => {
                if (!e.target.value || Number(e.target.value) < 1) {
                  onChangeQuantity(item, 1);
                }
              }}
              className="w-8 border-0 bg-transparent px-0 text-center text-sm font-bold text-slate-900 outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />

            <button
              type="button"
              onClick={() => onIncrement(item)}
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
  );
};

export default CartItem;