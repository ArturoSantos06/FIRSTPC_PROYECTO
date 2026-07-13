const paymentMethods = [
  { id: 'paypal', title: 'PayPal', description: 'Paga de forma rápida y segura.', icon: 'P' },
  { id: 'card', title: 'Tarjeta de débito o crédito', description: 'Mastercard o Visa', icon: '▣' },
  { id: 'oxxo', title: 'Efectivo en tiendas OXXO', description: 'Generaremos una referencia para pagar en caja.', icon: 'OXXO' },
];

const PaymentOptions = ({ selectedPaymentMethod, onPaymentMethodChange }) => (
  <div className="space-y-3">
    {paymentMethods.map((method) => {
      const isSelected = selectedPaymentMethod === method.id;

      return (
        <div key={method.id} className={`overflow-hidden rounded-[24px] border transition ${isSelected ? 'border-emerald-400 bg-emerald-50/40' : 'border-slate-200 bg-white'}`}>
          <label className="flex cursor-pointer items-center gap-4 p-4 sm:p-5">
            <input type="radio" name="payment" value={method.id} checked={isSelected} onChange={() => onPaymentMethodChange(method.id)} className="h-5 w-5 accent-emerald-500" />
            <span className={`flex h-10 min-w-12 items-center justify-center rounded-lg px-2 text-xs font-black ${method.id === 'paypal' ? 'bg-[#ffc439] text-[#003087]' : method.id === 'oxxo' ? 'bg-[#e30613] text-white' : 'bg-slate-900 text-white'}`}>
              {method.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-black text-slate-900">{method.title}</span>
              <span className="mt-1 block text-xs font-medium text-slate-500">{method.description}</span>
            </span>
            {method.id === 'paypal' && <span className="hidden gap-1.5 text-[10px] font-black sm:flex"><span className="rounded bg-[#1434cb] px-1.5 py-1 text-white">VISA</span><span className="rounded bg-[#eb001b] px-1 py-1 text-white">MC</span></span>}
            <span className="text-slate-400" aria-hidden="true">{isSelected ? '⌃' : '⌄'}</span>
          </label>
        </div>
      );
    })}
  </div>
);

export default PaymentOptions;
