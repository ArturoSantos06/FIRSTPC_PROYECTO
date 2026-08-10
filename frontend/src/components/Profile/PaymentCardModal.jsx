import { useEffect, useState } from 'react';

const emptyForm = { cardNumber: '', cardholderName: '', expiration: '', cvv: '' };
const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-400';

const getBrand = (number) => {
  if (/^4/.test(number)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(number)) return 'Mastercard';
  return 'Tarjeta';
};

const PaymentCardModal = ({ isOpen, onClose, initialData, onSave }) => {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({ ...emptyForm, cardholderName: initialData?.cardholderName || '', expiration: initialData?.cardExpiry || '' });
      setError('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValue = name === 'cardNumber' ? value.replace(/\D/g, '').slice(0, 16) : name === 'expiration' ? value.replace(/\D/g, '').slice(0, 4) : value;
    setForm((current) => ({ ...current, [name]: nextValue }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const expiration = form.expiration.length === 4 ? `${form.expiration.slice(0, 2)}/${form.expiration.slice(2)}` : form.expiration;
    const month = Number(form.expiration.slice(0, 2));
    if (form.cardNumber.length !== 16 || !form.cardholderName.trim() || form.expiration.length !== 4 || month < 1 || month > 12 || !/^\d{3,4}$/.test(form.cvv)) {
      setError('Completa los datos de una tarjeta válida.');
      return;
    }
    setIsSaving(true);
    try {
      await onSave({ cardBrand: getBrand(form.cardNumber), cardLast4: form.cardNumber.slice(-4), cardholderName: form.cardholderName.trim(), cardExpiry: expiration });
      onClose();
    } catch (saveError) {
      console.error('Error al guardar los datos de pago:', saveError);
      setError('No fue posible guardar los datos de pago. Intenta nuevamente.');
    } finally { setIsSaving(false); }
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="card-modal-title"><div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-500">Pago seguro</p><h3 id="card-modal-title" className="mt-2 text-2xl font-black text-slate-900">Agregar tarjeta</h3></div><button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-full px-2 text-2xl text-slate-400 hover:bg-slate-100">×</button></div><p className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-800">Esta demostración no procesa cargos reales. Por seguridad, nunca guardamos el número completo ni el código de seguridad.</p><form onSubmit={handleSubmit} className="mt-6 space-y-5"><div><label htmlFor="cardNumber" className="mb-1.5 block text-[13px] font-bold text-slate-700">Número de tarjeta</label><input id="cardNumber" name="cardNumber" value={form.cardNumber} onChange={handleChange} inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000" className={inputClass} /></div><div><label htmlFor="cardholderName" className="mb-1.5 block text-[13px] font-bold text-slate-700">Nombre en la tarjeta</label><input id="cardholderName" name="cardholderName" value={form.cardholderName} onChange={handleChange} autoComplete="cc-name" className={inputClass} /></div><div className="grid gap-5 sm:grid-cols-2"><div><label htmlFor="expiration" className="mb-1.5 block text-[13px] font-bold text-slate-700">Vencimiento (MM/AA)</label><input id="expiration" name="expiration" value={form.expiration} onChange={handleChange} inputMode="numeric" autoComplete="cc-exp" placeholder="MM/AA" className={inputClass} /></div><div><label htmlFor="cvv" className="mb-1.5 block text-[13px] font-bold text-slate-700">CVV</label><input id="cvv" name="cvv" value={form.cvv} onChange={handleChange} inputMode="numeric" autoComplete="cc-csc" maxLength="4" type="password" className={inputClass} /></div></div>{error && <p role="alert" className="text-sm font-bold text-rose-600">{error}</p>}<div className="flex justify-end gap-3 border-t border-slate-100 pt-6"><button type="button" onClick={onClose} className="rounded-full border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700">Cancelar</button><button type="submit" disabled={isSaving} className="rounded-full bg-emerald-500 px-7 py-3 text-sm font-bold text-white disabled:opacity-60">{isSaving ? 'Guardando...' : 'Guardar tarjeta'}</button></div></form></div></div>;
};

export default PaymentCardModal;
