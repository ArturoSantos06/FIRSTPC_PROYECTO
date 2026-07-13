/* eslint-disable react/prop-types */
const SuccessModal = ({ isOpen, onContinue, onCancel, title = 'Dirección creada', message = 'La dirección de envío se ha creado exitosamente', variant = 'success', confirmText = 'Continuar', cancelText = 'Cancelar', error = '', isLoading = false }) => {
  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="address-created-title">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
        <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${isDanger ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-[#10B981]'}`}>
          <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            {isDanger ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12m-10 0v11h8V7m-6-3h4l1 3H8l1-3Z" /> : <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 6" />}
          </svg>
        </div>
        <h3 id="address-created-title" className="mt-6 text-2xl font-black text-slate-900">{title}</h3>
        <p className="mt-2 text-sm font-medium text-slate-500">{message}</p>
        {error && <p role="alert" className="mt-4 text-xs font-bold text-rose-600">{error}</p>}
        <div className="mt-8 flex gap-3">
          {onCancel && <button type="button" onClick={onCancel} disabled={isLoading} className="flex-1 rounded-full border border-slate-200 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">{cancelText}</button>}
          <button type="button" onClick={onContinue} disabled={isLoading} className={`flex-1 rounded-full py-3.5 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${isDanger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#10B981] hover:bg-emerald-600'}`}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
