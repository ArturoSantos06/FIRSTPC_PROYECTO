const AddressSummary = ({ addressForm, onEdit }) => (
  <div className="rounded-[28px] border border-slate-200/70 bg-slate-50/50 p-6 shadow-sm sm:p-8">
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-500">Dirección de envío</p>
        <h3 className="mt-2 text-xl font-black text-slate-900">Resumen de dirección</h3>
      </div>
      <button type="button" onClick={onEdit} className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
        Editar dirección
      </button>
    </div>

    <div className="mt-6 grid grid-cols-12 gap-4 text-sm">
      <div className="col-span-12 rounded-2xl border border-slate-200 bg-white p-4 sm:col-span-6">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Destinatario</p>
        <p className="mt-2 font-bold text-slate-900">{addressForm.firstName} {addressForm.lastName}</p>
      </div>
      <div className="col-span-12 rounded-2xl border border-slate-200 bg-white p-4 sm:col-span-6">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Teléfono</p>
        <p className="mt-2 font-bold text-slate-900">{addressForm.phone}</p>
      </div>
      <div className="col-span-12 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Dirección</p>
        <p className="mt-2 font-bold text-slate-900">
          {addressForm.street} {addressForm.exteriorNumber}{addressForm.interiorNumber && ` Int. ${addressForm.interiorNumber}`}, {addressForm.neighborhood}, C.P. {addressForm.postalCode}, {addressForm.city}, {addressForm.state}
        </p>
        {addressForm.references && <p className="mt-2 text-xs text-slate-500">Referencia: {addressForm.references}</p>}
      </div>
    </div>
  </div>
);

export default AddressSummary;
