import { useEffect, useState } from 'react';

const emptyBillingForm = { companyName: '', rfc: '', postalCode: '', taxRegimen: '', cfdiUse: 'S01' };

const taxRegimens = [
  '601 - Régimen general de ley personas morales',
  '603 - Personas morales con fines no lucrativos',
  '605 - Régimen de sueldos y salarios e ingresos asimilados a salarios',
  '606 - Régimen de arrendamiento',
  '607 - Régimen de enajenación o adquisición de bienes',
  '608 - Régimen de los demás ingresos',
  '610 - Residentes en el extranjero sin establecimiento permanente en México',
  '612 - Personas Físicas con Actividades Empresariales y Profesionales',
  '614 - Ingresos por intereses',
  '615 - Régimen de los ingresos por obtención de premios',
  '616 - Sin obligaciones fiscales',
  '620 - Sociedades cooperativas de producción que optan por diferir sus ingresos',
  '621 - Incorporación Fiscal',
  '622 - Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras',
  '623 - Opcional para Grupos de Sociedades',
  '624 - Coordinados',
  '625 - Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas',
  '626 - Régimen Simplificado de Confianza (RESICO)'
];

const cfdiUses = [
  'G01 - Adquisición de mercancías',
  'G02 - Devoluciones, descuentos o bonificaciones',
  'G03 - Gastos en general',
  'I01 - Construcciones',
  'D10 - Pagos por servicios educativos (Colegiaturas)',
  'S01 - Sin efectos fiscales'
];

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#10B981]';

const BillingModal = ({ isOpen, onClose, initialData, onSave }) => {
  const [billingForm, setBillingForm] = useState(emptyBillingForm);
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const savedData = Object.fromEntries(Object.entries(initialData || {}).filter(([key]) => key !== 'id'));
      setBillingForm({ ...emptyBillingForm, ...savedData });
      setErrors({});
      setSaveError('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setBillingForm((current) => ({ ...current, [name]: name === 'rfc' ? value.toUpperCase() : value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!billingForm.companyName.trim()) nextErrors.companyName = 'Ingresa la razón social o nombre.';
    if (/S\.?\s*A\.?\s*DE\s*C\.?\s*V\.?/i.test(billingForm.companyName)) nextErrors.companyName = 'Escribe el nombre sin siglas como S.A. de C.V.';
    if (!/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/.test(billingForm.rfc)) nextErrors.rfc = 'El RFC debe tener 12 o 13 caracteres válidos.';
    if (!/^\d{5}$/.test(billingForm.postalCode)) nextErrors.postalCode = 'El código postal debe tener 5 dígitos.';
    if (!billingForm.taxRegimen) nextErrors.taxRegimen = 'Selecciona un régimen fiscal.';
    if (!billingForm.cfdiUse) nextErrors.cfdiUse = 'Selecciona el uso de CFDI.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate() || isSaving) return;
    setIsSaving(true); setSaveError('');
    try {
      await onSave(billingForm);
      handleClose();
    } catch (error) {
      console.error('Error al guardar los datos fiscales:', error);
      setSaveError('No fue posible guardar los datos fiscales. Intenta nuevamente.');
    } finally { setIsSaving(false); }
  };

  const handleClose = () => {
    if (isSaving) return;
    setBillingForm(emptyBillingForm);
    setErrors({});
    setSaveError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="billing-modal-title">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-500">Facturación</p><h3 id="billing-modal-title" className="mt-2 text-2xl font-black text-slate-900">Datos fiscales</h3></div>
          <button type="button" onClick={handleClose} aria-label="Cerrar modal" className="flex h-10 w-10 items-center justify-center rounded-full text-2xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">×</button>
        </div>
        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-800">Recuerda ingresar tus datos tal como aparecen en tu Constancia de Situación Fiscal.</div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <Field label="Razón social o nombre" name="companyName" value={billingForm.companyName} onChange={handleChange} error={errors.companyName} placeholder="Sin siglas como S.A. de C.V." />
          <div className="grid gap-5 sm:grid-cols-2"><Field label="RFC" name="rfc" value={billingForm.rfc} onChange={handleChange} error={errors.rfc} maxLength="13" placeholder="XAXX010101000" /><Field label="Código postal fiscal" name="postalCode" value={billingForm.postalCode} onChange={handleChange} error={errors.postalCode} maxLength="5" inputMode="numeric" placeholder="00000" /></div>
          <SelectField label="Régimen fiscal" name="taxRegimen" value={billingForm.taxRegimen} onChange={handleChange} options={taxRegimens} error={errors.taxRegimen} />
          <SelectField label="Uso de CFDI" name="cfdiUse" value={billingForm.cfdiUse} onChange={handleChange} options={cfdiUses} error={errors.cfdiUse} />
          {saveError && <p role="alert" className="text-right text-xs font-bold text-rose-600">{saveError}</p>}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end"><button type="button" onClick={handleClose} disabled={isSaving} className="rounded-full border border-slate-200 px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">Cancelar</button><button type="submit" disabled={isSaving} className="rounded-full bg-[#10B981] px-8 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60">{isSaving ? 'Guardando...' : 'Guardar datos'}</button></div>
        </form>
      </div>
    </div>
  );
};

const Field = ({ label, name, value, onChange, error, ...props }) => <div><label htmlFor={name} className="mb-1.5 block text-[13px] font-bold text-slate-700"><span className="text-rose-500">*</span> {label}</label><input id={name} required name={name} value={value} onChange={onChange} className={`${inputClass} ${error ? 'border-rose-400' : ''}`} {...props} />{error && <p className="mt-1 text-xs font-bold text-rose-600">{error}</p>}</div>;
const SelectField = ({ label, name, value, onChange, options, error }) => <div><label htmlFor={name} className="mb-1.5 block text-[13px] font-bold text-slate-700"><span className="text-rose-500">*</span> {label}</label><select id={name} required name={name} value={value} onChange={onChange} className={`${inputClass} ${error ? 'border-rose-400' : ''}`}><option value="">Selecciona una opción</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select>{error && <p className="mt-1 text-xs font-bold text-rose-600">{error}</p>}</div>;

export default BillingModal;
