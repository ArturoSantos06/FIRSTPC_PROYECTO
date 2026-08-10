const Spinner = ({ label = 'Cargando...', className = '', fullScreen = false }) => (
  <div className={`${fullScreen ? 'min-h-screen bg-[#F8FAFC]' : 'col-span-full min-h-72 rounded-[32px] border border-slate-200/70 bg-white/80 shadow-[0_16px_40px_rgba(15,23,42,0.04)]'} flex flex-col items-center justify-center p-10 text-center ${className}`} role="status" aria-live="polite">
    <span className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-500" aria-hidden="true" />
    <span className="mt-4 text-sm font-bold text-slate-500">{label}</span>
  </div>
);

export default Spinner;
