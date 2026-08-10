import { useEffect, useState } from 'react';
import { CreditCard, Pencil } from 'lucide-react';
import { collection, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import PaymentCardModal from '../components/Profile/PaymentCardModal';

const ProfileBilling = () => {
  const [paymentData, setPaymentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPaymentData = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) { setIsLoading(false); return; }
      try {
        const snapshot = await getDocs(query(collection(db, 'billing_profiles'), where('userId', '==', userId)));
        if (!snapshot.empty) setPaymentData({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      } catch (loadError) {
        console.error('Error al cargar los datos de pago:', loadError);
        setError('No fue posible cargar tus datos de pago. Intenta nuevamente.');
      } finally { setIsLoading(false); }
    };
    loadPaymentData();
  }, []);

  const handleSave = async (cardData) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('No hay una sesión activa.');
    const profileId = paymentData?.id || userId;
    await setDoc(doc(db, 'billing_profiles', profileId), { ...cardData, userId, updatedAt: serverTimestamp() }, { merge: true });
    setPaymentData((current) => ({ ...current, ...cardData, userId, id: profileId }));
  };

  return <section className="w-full font-['Montserrat']"><div className="overflow-hidden rounded-[32px] border border-slate-200/70 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]"><header className="border-b border-slate-100 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,0.98))] px-6 py-6 sm:px-8"><p className="text-[11px] font-bold uppercase tracking-[0.34em] text-emerald-500">Mi cuenta</p><h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Datos de pago</h1><p className="mt-1 text-sm font-medium text-slate-500">Guarda una tarjeta para tener tus datos listos en tus próximas compras.</p></header><div className="p-4 sm:p-6 lg:p-8">{isLoading && <div className="h-48 animate-pulse rounded-[24px] bg-slate-100" />}{!isLoading && error && <p role="alert" className="rounded-2xl bg-rose-50 p-5 text-sm font-bold text-rose-700">{error}</p>}{!isLoading && !error && <div className="rounded-[24px] border border-slate-200 bg-slate-50/60 p-5 sm:p-7"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start"><div className="flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><CreditCard size={23} /></span><div><p className="text-[11px] font-black uppercase tracking-[0.25em] text-emerald-600">Tarjeta guardada</p><h2 className="mt-1 text-xl font-black text-slate-900">{paymentData?.cardLast4 ? `${paymentData.cardBrand || 'Tarjeta'} terminada en ${paymentData.cardLast4}` : 'Aún no tienes una tarjeta'}</h2></div></div><button type="button" onClick={() => setIsModalOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 hover:border-emerald-300 hover:text-emerald-600"><Pencil size={16} /> {paymentData?.cardLast4 ? 'Editar tarjeta' : 'Agregar tarjeta'}</button></div>{paymentData?.cardLast4 && <dl className="mt-7 grid gap-5 border-t border-slate-200 pt-6 sm:grid-cols-3"><Info label="Titular" value={paymentData.cardholderName} /><Info label="Vencimiento" value={paymentData.cardExpiry} /><Info label="Seguridad" value="Datos protegidos" /></dl>}</div>}</div></div><PaymentCardModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialData={paymentData} onSave={handleSave} /></section>;
};

const Info = ({ label, value }) => <div><dt className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</dt><dd className="mt-1 text-sm font-bold text-slate-800">{value || 'No disponible'}</dd></div>;

export default ProfileBilling;
