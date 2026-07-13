import { Link } from 'react-router-dom';

const moneyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 2,
});

const OrderSummary = ({
  totalItems,
  uniqueProducts,
  totalAmount,
  shippingCost = 0,
  ivaAmount,
  showShipping = false,
  onProceed,
  isReadyToProceed,
  onButtonClick,
  buttonText = 'Ir al siguiente paso',
  isButtonDisabled = false,
  children,
  className = '',
}) => {
  
  const calculatedIvaAmount = ivaAmount ?? totalAmount * (0.16 / 1.16);
  const orderTotal = totalAmount + shippingCost;
  const proceedHandler = onProceed || onButtonClick;
  const isDisabled = isReadyToProceed === undefined ? isButtonDisabled : !isReadyToProceed;

  return (
    <aside className={`sticky top-28 h-fit w-full rounded-[30px] border border-slate-200/70 bg-slate-50 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.05)] sm:p-6 ${className}`}>
      {children && <div className="mb-6">{children}</div>}

      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-emerald-500">Resumen</p>
        <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Total de compra</h3>

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Productos</span>
            <span className="font-bold text-slate-900">{uniqueProducts}</span>
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

          {showShipping && <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Envío</span>
            <span className="font-bold text-slate-900">{moneyFormatter.format(shippingCost)}</span>
          </div>}

          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>IVA (16%)</span>
            <span className="font-bold text-slate-900">{moneyFormatter.format(calculatedIvaAmount)}</span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-base text-slate-600">
            <span className="font-medium">Total</span>
            <span className="text-xl font-black text-slate-900">{moneyFormatter.format(orderTotal)}</span>
          </div>
        </div>

        {proceedHandler ? (
          <button
            type="button"
            onClick={proceedHandler}
            disabled={isDisabled}
            className="mt-6 block w-full rounded-full bg-[#10B981] px-5 py-3 text-center text-sm font-bold text-white shadow-[0_14px_30px_rgba(16,185,129,0.24)] transition hover:bg-emerald-600 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {buttonText}
          </button>
        ) : (
          <Link
            to="/checkout/direccion"
            className="mt-6 block w-full rounded-full bg-[#10B981] px-5 py-3 text-center text-sm font-bold text-white shadow-[0_14px_30px_rgba(16,185,129,0.24)] transition hover:bg-emerald-600 hover:-translate-y-0.5"
          >
            {buttonText}
          </Link>
        )}
      </div>
    </aside>
  );
};

export default OrderSummary;
