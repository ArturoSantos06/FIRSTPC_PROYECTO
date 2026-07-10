import { useEffect, useState } from 'react';
import CheckoutStepper from '../components/Cart/CheckoutStepper';
import { useCart } from '../context/CartContext';
import { addDoc, collection, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

const moneyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 2,
});

const initialAddressForm = {
  firstName: '', lastName: '', phone: '', gender: '',
  street: '', exteriorNumber: '', interiorNumber: '',
  neighborhood: '', postalCode: '', city: '', state: '', references: ''
};

const mexicanStates = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua',
  'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Estado de México', 'Guanajuato',
  'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León',
  'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa',
  'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
];

const CheckoutAddress = () => {
  const { cartItems, totalItems, totalAmount } = useCart();
  const [addressForm, setAddressForm] = useState(initialAddressForm);
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isAddressSaved, setIsAddressSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const shippingCost = cartItems.length > 0 ? 133 : 0;
  const orderTotal = totalAmount + shippingCost;

  useEffect(() => {
    const loadSavedAddress = async () => {
      const userId = auth.currentUser?.uid;

      if (!userId) {
        setIsLoadingAddress(false);
        return;
      }

      try {
        const addressesRef = collection(db, 'addresses');
        const userAddressQuery = query(addressesRef, where('userId', '==', userId));
        const userAddressSnapshot = await getDocs(userAddressQuery);

        if (!userAddressSnapshot.empty) {
          setAddressForm({
            ...initialAddressForm,
            ...userAddressSnapshot.docs[0].data(),
          });
          setIsAddressSaved(true);
        }
      } catch (error) {
        console.error('Error al cargar la dirección guardada:', error);
        setSaveError('No fue posible cargar tu dirección guardada.');
      } finally {
        setIsLoadingAddress(false);
      }
    };

    loadSavedAddress();
  }, []);

  const handleChange = (e) => setAddressForm({...addressForm, [e.target.name]: e.target.value});
  const setGender = (gender) => setAddressForm({...addressForm, gender});

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    setSaveError('');

    try {
      const userId = auth.currentUser?.uid;

      if (!userId) {
        setSaveError('Tu sesión expiró. Inicia sesión nuevamente para continuar.');
        return;
      }

      const addressesRef = collection(db, 'addresses');
      const userAddressQuery = query(addressesRef, where('userId', '==', userId));
      const userAddressSnapshot = await getDocs(userAddressQuery);
      const addressData = { ...addressForm, userId };

      if (userAddressSnapshot.empty) {
        await addDoc(addressesRef, addressData);
      } else {
        await updateDoc(userAddressSnapshot.docs[0].ref, addressData);
      }

      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error('Error al guardar la dirección:', error);
      setSaveError('No fue posible guardar la dirección. Intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleContinue = () => {
    setIsSuccessModalOpen(false);
    setIsAddressSaved(true);
  };

  return (
    <section className="w-full font-['Montserrat']">
      <div className="rounded-[32px] border border-slate-200/70 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)] overflow-hidden">
        
        <CheckoutStepper currentStep={2} />

        {/* ENCABEZADO GLOBAL */}
        <div className="border-b border-slate-100 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,0.98))] px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-emerald-500">FIRSTPC Checkout</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Agregar dirección</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">Completa los datos de envío para continuar con tu compra.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-4 sm:p-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-8 xl:p-8 items-start">
          
          <div className="flex flex-col gap-6">
            {isLoadingAddress ? (
              <div className="rounded-[28px] border border-slate-200/70 bg-slate-50/50 p-8 text-center shadow-sm">
                <p className="text-sm font-bold text-slate-500">Cargando dirección...</p>
              </div>
            ) : isAddressSaved ? (
              <div className="rounded-[28px] border border-slate-200/70 bg-slate-50/50 p-6 shadow-sm sm:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-500">Dirección de envío</p>
                    <h3 className="mt-2 text-xl font-black text-slate-900">Resumen de dirección</h3>
                  </div>
                  <button type="button" onClick={() => setIsAddressSaved(false)} className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
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
            ) : (
            <form onSubmit={handleSubmit} className="rounded-[28px] border border-slate-200/70 bg-slate-50/50 p-6 shadow-sm sm:p-8">
              
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-700"><span className="text-rose-500">*</span> Nombre(s)</label>
                  <input name="firstName" value={addressForm.firstName} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-[#10B981] outline-none transition shadow-sm" />
                </div>
                <div className="col-span-6">
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-700"><span className="text-rose-500">*</span> Apellido(s)</label>
                  <input name="lastName" value={addressForm.lastName} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-[#10B981] outline-none transition shadow-sm" />
                </div>

                <div className="col-span-8">
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-700"><span className="text-rose-500">*</span> Teléfono</label>
                  <input name="phone" value={addressForm.phone} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-[#10B981] outline-none transition shadow-sm" />
                </div>
                <div className="col-span-4">
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-700">Género</label>
                  <div className="flex h-[42px] rounded-xl bg-white border border-slate-200 p-1 shadow-sm">
                    <button type="button" onClick={() => setGender('H')} className={`flex-1 rounded-lg text-xs font-bold transition ${addressForm.gender === 'H' ? 'bg-[#10B981] text-white' : 'text-slate-500 hover:text-slate-700'}`}>H</button>
                    <button type="button" onClick={() => setGender('M')} className={`flex-1 rounded-lg text-xs font-bold transition ${addressForm.gender === 'M' ? 'bg-[#10B981] text-white' : 'text-slate-500 hover:text-slate-700'}`}>M</button>
                  </div>
                </div>

                <div className="col-span-6">
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-700"><span className="text-rose-500">*</span> Calle</label>
                  <input name="street" value={addressForm.street} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-[#10B981] outline-none transition shadow-sm" />
                </div>
                <div className="col-span-3">
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-700"><span className="text-rose-500">*</span> No. Ext</label>
                  <input name="exteriorNumber" value={addressForm.exteriorNumber} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-[#10B981] outline-none transition shadow-sm" />
                </div>
                <div className="col-span-3">
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-700">No. Int</label>
                  <input name="interiorNumber" value={addressForm.interiorNumber} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-[#10B981] outline-none transition shadow-sm" />
                </div>

                <div className="col-span-12">
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-700">Referencia</label>
                  <textarea name="references" value={addressForm.references} onChange={handleChange} rows="2" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-[#10B981] outline-none transition shadow-sm resize-none" />
                </div>

                <div className="col-span-6">
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-700"><span className="text-rose-500">*</span> Colonia</label>
                  <input name="neighborhood" value={addressForm.neighborhood} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-[#10B981] outline-none transition shadow-sm" />
                </div>
                <div className="col-span-6">
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-700"><span className="text-rose-500">*</span> C.P.</label>
                  <input name="postalCode" value={addressForm.postalCode} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-[#10B981] outline-none transition shadow-sm" />
                </div>

                <div className="col-span-6">
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-700"><span className="text-rose-500">*</span> Ciudad</label>
                  <input name="city" value={addressForm.city} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-[#10B981] outline-none transition shadow-sm" />
                </div>
                <div className="col-span-6">
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-700"><span className="text-rose-500">*</span> Estado</label>
                  <select name="state" value={addressForm.state} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-[#10B981] outline-none transition shadow-sm">
                    {mexicanStates.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400"><span className="text-rose-500">*</span> Campos requeridos</p>
                <button type="submit" disabled={isSaving} className="rounded-full bg-slate-900 px-8 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
                  {isSaving ? 'Guardando...' : 'Guardar dirección'}
                </button>
              </div>
              {saveError && <p role="alert" className="mt-4 text-right text-xs font-bold text-rose-500">{saveError}</p>}
            </form>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <aside className="rounded-[28px] border border-slate-200/70 bg-slate-50/70 p-6 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 border-b border-slate-200 pb-4">Datos de facturación</h3>
              <p className="text-xs text-emerald-800 bg-emerald-50 p-3 rounded-xl mt-4">Si no introduces datos fiscales, se emitirá una factura con RFC genérico.</p>
              <button className="mt-4 w-full rounded-full border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition">+ Agregar datos</button>
            </aside>

            <aside className="rounded-[28px] border border-slate-200/70 bg-slate-50/70 p-6 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 border-b border-slate-200 pb-4">Resumen del pedido</h3>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between text-slate-500"><span>Productos ({cartItems.length})</span><span className="font-bold text-slate-900">{moneyFormatter.format(totalAmount)}</span></div>
                <div className="flex justify-between text-slate-500"><span>Artículos</span><span className="font-bold text-slate-900">{totalItems}</span></div>
                <div className="flex justify-between border-t border-slate-200 pt-4 font-bold text-base text-slate-700">
                  <span>Total (incl. IVA)</span><span className="text-xl font-black text-[#10B981]">{moneyFormatter.format(orderTotal)}</span>
                </div>
              </div>
              <button className="mt-6 w-full rounded-full bg-[#10B981] py-3.5 text-sm font-bold text-white transition hover:bg-emerald-600 shadow-[0_8px_20px_rgba(16,185,129,0.25)]">Ir al siguiente paso</button>
            </aside>
          </div>
        </div>

      </div>

      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="address-created-title">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-[#10B981]">
              <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 6" />
              </svg>
            </div>
            <h3 id="address-created-title" className="mt-6 text-2xl font-black text-slate-900">Dirección creada</h3>
            <p className="mt-2 text-sm font-medium text-slate-500">La dirección de envío se ha creado exitosamente</p>
            <button type="button" onClick={handleContinue} className="mt-8 w-full rounded-full bg-[#10B981] py-3.5 text-sm font-bold text-white transition hover:bg-emerald-600">Continuar</button>
          </div>
        </div>
      )}
    </section>
  );
};

export default CheckoutAddress;
