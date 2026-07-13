const AddressCard = ({ address, isSelected, onSelect, onEdit, onDelete }) => (
  <div role="radio" aria-checked={isSelected} tabIndex="0" onClick={onSelect} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onSelect(); }} className={`relative cursor-pointer rounded-2xl border-2 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${isSelected ? 'border-[#10B981] ring-4 ring-emerald-50' : 'border-slate-200'}`}>
    {isSelected && <span className="absolute right-4 top-4 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700">Seleccionada</span>}
    <div className="pr-20"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Destinatario</p><h4 className="mt-1 text-base font-black text-slate-900">{address.firstName} {address.lastName}</h4><p className="mt-3 text-sm font-bold text-slate-600">{address.phone}</p></div>
    <p className="mt-4 text-sm leading-6 text-slate-600">{address.street} {address.exteriorNumber}{address.interiorNumber && ` Int. ${address.interiorNumber}`}, {address.neighborhood}, C.P. {address.postalCode}, {address.city}, {address.state}</p>
    {address.references && <p className="mt-2 text-xs text-slate-400">Referencia: {address.references}</p>}
    <div className="mt-4 flex gap-2">
      <button type="button" onClick={(event) => { event.stopPropagation(); onEdit(); }} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-600">Editar</button>
      <button type="button" onClick={(event) => { event.stopPropagation(); onDelete(); }} className="rounded-full border border-rose-200 px-4 py-2 text-xs font-bold text-rose-600 transition hover:border-rose-300 hover:text-rose-700">Eliminar</button>
    </div>
  </div>
);

export default AddressCard;
