const shippingOptions = [
  {
    id: 'estafeta',
    name: 'Estafeta Terrestre',
    price: 133,
    startDays: 3,
    endDays: 5,
    logo: 'ESTAFETA',
    logoClassName: 'bg-[#e30613] text-white',
  },
  {
    id: 'dhl',
    name: 'DHL Terrestre',
    price: 502,
    startDays: 2,
    endDays: 4,
    logo: 'DHL',
    logoClassName: 'bg-[#ffcc00] text-[#d40511]',
  },
];

const moneyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
});

const formatDate = (date) => new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'short',
}).format(date).replace('.', '');

const getDeliveryDates = (startDays, endDays) => {
  const start = new Date();
  const end = new Date();
  start.setDate(start.getDate() + startDays);
  end.setDate(end.getDate() + endDays);
  return `${formatDate(start)} y ${formatDate(end)}`;
};

const ShippingOptions = ({ selectedShipping, onShippingChange, shippingQuotes = {}, isLoading = false }) => (
  <div className="space-y-3">
    {isLoading && <div className="space-y-3" aria-live="polite"><div className="h-[88px] animate-pulse rounded-[24px] border border-slate-200 bg-slate-100" /><div className="h-[88px] animate-pulse rounded-[24px] border border-slate-200 bg-slate-100" /><p className="text-center text-xs font-bold text-slate-400">Calculando opciones de envío...</p></div>}
    {!isLoading && shippingOptions.map((option) => {
      const isSelected = selectedShipping === option.id;

      return (
        <label
          key={option.id}
          className={`flex cursor-pointer items-center gap-4 rounded-[24px] border p-4 transition sm:p-5 ${
            isSelected
              ? 'border-emerald-400 bg-emerald-50/60 shadow-[0_10px_28px_rgba(16,185,129,0.10)]'
              : 'border-slate-200 bg-white hover:border-emerald-200'
          }`}
        >
          <input
            type="radio"
            name="shipping"
            value={option.id}
            checked={isSelected}
            onChange={() => onShippingChange(option.id)}
            className="h-5 w-5 accent-emerald-500"
          />
          <span className={`flex h-11 min-w-[76px] items-center justify-center rounded-xl px-2 text-center text-[10px] font-black italic tracking-tight ${option.logoClassName}`}>
            {option.logo}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-black text-slate-900">{option.name}</span>
            <span className="mt-1 block text-xs font-medium text-slate-500">
              Recíbelo entre el {shippingQuotes[option.id]
                ? getDeliveryDates(shippingQuotes[option.id].estimatedDays.min, shippingQuotes[option.id].estimatedDays.max)
                : getDeliveryDates(option.startDays, option.endDays)}
            </span>
          </span>
          <span className="text-right text-sm font-black text-slate-900">{moneyFormatter.format(shippingQuotes[option.id]?.price || option.price)}</span>
        </label>
      );
    })}
    {!isLoading && <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
      <span className="text-lg" aria-hidden="true">🛡️</span>
      <span>Tu envío está asegurado y cuenta con rastreo en línea.</span>
    </div>}
  </div>
);

export { shippingOptions };
export default ShippingOptions;
