import { useEffect, useState } from 'react';
import { FileText, Pencil, Plus } from 'lucide-react';
import { collection, getDocs, query, serverTimestamp, setDoc, doc, where } from 'firebase/firestore';
import BillingModal from '../components/Checkout/Step2/BillingModal';
import { auth, db } from '../firebaseConfig';

const ProfileBilling = () => {
  const [billingData, setBillingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBillingData = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) { setIsLoading(false); return; }
      try {
        const snapshot = await getDocs(query(collection(db, 'billing_profiles'), where('userId', '==', userId)));
        if (!snapshot.empty) {
          const billingDocument = snapshot.docs[0];
          setBillingData({ id: billingDocument.id, ...billingDocument.data() });
        }
      } catch (loadError) {
        console.error('Error al cargar los datos de facturación:', loadError);
        setError('No fue posible cargar tus datos de facturación. Intenta nuevamente.');
      } finally { setIsLoading(false); }
    };
    loadBillingData();
  }, []);

  const handleSave = async (billingForm) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('No hay una sesión activa.');
    const profileId = billingData?.id || userId;
    const dataToSave = { ...billingForm, userId, updatedAt: serverTimestamp() };
    await setDoc(doc(db, 'billing_profiles', profileId), dataToSave, { merge: true });
    setBillingData({ ...billingForm, userId, id: profileId });
    setIsModalOpen(false);
  };

  return <section className="w-full font-['Montserrat']"><div className="overflow-hidden rounded-[32px] border border-slate-200/70 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]"><header className="border-b border-slate-100 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,0.98))] px-6 py-6 sm:px-8"><p className="text-[11px] font-bold uppercase tracking-[0.34em] text-emerald-500">Mi cuenta</p><h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Datos de pago y facturación</h1><p className="mt-1 text-sm font-medium text-slate-500">Administra la información fiscal que utilizaremos para tus facturas.</p></header><div className="p-4 sm:p-6 lg:p-8">
    {isLoading && <div className="h-64 animate-pulse rounded-[24px] bg-slate-100" />}
    {!isLoading && error && <p role="alert" className="rounded-2xl bg-rose-50 p-5 text-sm font-bold text-rose-700">{error}</p>}
    {!isLoading && !error && billingData && <div className="rounded-[24px] border border-slate-200 bg-slate-50/60 p-5 sm:p-7"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start"><div className="flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><FileText size={23} /></span><div><p className="text-[11px] font-black uppercase tracking-[0.25em] text-emerald-600">Perfil fiscal guardado</p><h2 className="mt-1 text-xl font-black text-slate-900">{billingData.companyName}</h2></div></div><button type="button" onClick={() => setIsModalOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:border-emerald-300 hover:text-emerald-600"><Pencil size={16} /> Editar datos</button></div><dl className="mt-7 grid gap-5 border-t border-slate-200 pt-6 sm:grid-cols-2"><Info label="RFC" value={billingData.rfc} /><Info label="Código postal fiscal" value={billingData.postalCode} /><Info label="Régimen fiscal" value={billingData.taxRegimen} /><Info label="Uso de CFDI" value={billingData.cfdiUse} /></dl></div>}
    {!isLoading && !error && !billingData && <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center"><FileText className="mx-auto text-emerald-500" size={32} /><h2 className="mt-4 text-xl font-black text-slate-900">Aún no tienes datos de facturación</h2><p className="mx-auto mt-2 max-w-md text-sm font-medium text-slate-500">Agrega tus datos fiscales para solicitar facturas con tu información.</p><button type="button" onClick={() => setIsModalOpen(true)} className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-600"><Plus size={17} /> Agregar datos fiscales</button></div>}
  </div></div><BillingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialData={billingData} onSave={handleSave} /></section>;
};

const Info = ({ label, value }) => <div><dt className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</dt><dd className="mt-1 text-sm font-bold text-slate-800">{value || 'No disponible'}</dd></div>;

export default ProfileBilling;
