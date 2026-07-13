const BillingSection = ({ billingData, onOpenBillingModal }) => (
  <aside className="rounded-[28px] border border-slate-200/70 bg-slate-50/70 p-6 shadow-sm">
    <h3 className="border-b border-slate-200 pb-4 text-lg font-black text-slate-900">Datos de facturación</h3>
    {billingData ? (
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm">
        <div className="space-y-2">
          <p><span className="font-bold text-slate-400">Razón social</span><br /><span className="font-bold text-slate-900">{billingData.companyName}</span></p>
          <p><span className="font-bold text-slate-400">RFC</span><br /><span className="font-bold uppercase text-slate-900">{billingData.rfc}</span></p>
          <p><span className="font-bold text-slate-400">Régimen</span><br /><span className="font-bold text-slate-900">{billingData.taxRegimen}</span></p>
        </div>
        <button type="button" onClick={onOpenBillingModal} className="mt-4 w-full rounded-full border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-600">Editar datos</button>
      </div>
    ) : (
      <>
        <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800">Si no introduces datos fiscales, se emitirá una factura con RFC genérico.</p>
        <button type="button" onClick={onOpenBillingModal} className="mt-4 w-full rounded-full border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">+ Agregar datos</button>
      </>
    )}
  </aside>
);

export default BillingSection;
