import { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, getDocs, query, where, addDoc, updateDoc } from 'firebase/firestore';
import { AddIcon as Plus, LocationIcon as MapPin } from '../components/icons/AppIcons';
import AddressCard from '../components/Checkout/Step2/AddressCard';
import AddressForm from '../components/Checkout/Step2/AddressForm';
import SuccessModal from '../components/Checkout/Step2/SuccessModal';
import { auth, db } from '../firebaseConfig';
import { initialAddressForm, mexicanStates } from '../data/addressData';

const ProfileShippingAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState(initialAddressForm);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const loadAddresses = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) { setIsLoading(false); return; }
      try {
        const snapshot = await getDocs(query(collection(db, 'addresses'), where('userId', '==', userId)));
        setAddresses(snapshot.docs.map((addressDocument) => ({ id: addressDocument.id, ref: addressDocument.ref, ...addressDocument.data() })));
      } catch (loadError) {
        console.error('Error al cargar los datos de envío:', loadError);
        setError('No fue posible cargar tus datos de envío. Intenta nuevamente.');
      } finally { setIsLoading(false); }
    };
    loadAddresses();
  }, []);

  const handleChange = (event) => setAddressForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const setGender = (gender) => setAddressForm((current) => ({ ...current, gender }));
  const startNewAddress = () => { setAddressForm({ ...initialAddressForm }); setEditingAddressId(null); setError(''); setIsAddingAddress(true); };
  const startEdit = (address) => {
    const formData = Object.fromEntries(Object.entries(address).filter(([key]) => key !== 'id' && key !== 'ref'));
    setAddressForm({ ...initialAddressForm, ...formData });
    setEditingAddressId(address.id); setError(''); setIsAddingAddress(true);
  };
  const cancelForm = () => { setAddressForm({ ...initialAddressForm }); setEditingAddressId(null); setError(''); setIsAddingAddress(false); };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSaving) return;
    const userId = auth.currentUser?.uid;
    if (!userId) { setError('Tu sesión expiró. Inicia sesión nuevamente.'); return; }
    setIsSaving(true); setError('');
    try {
      const addressData = { ...addressForm, userId };
      if (editingAddressId) {
        const currentAddress = addresses.find(({ id }) => id === editingAddressId);
        await updateDoc(currentAddress.ref, addressData);
        setAddresses((current) => current.map((address) => address.id === editingAddressId ? { ...address, ...addressData } : address));
        setSuccessMessage('Tus datos de envío se actualizaron correctamente.');
      } else {
        const newDocument = await addDoc(collection(db, 'addresses'), addressData);
        setAddresses((current) => [...current, { id: newDocument.id, ...addressData }]);
        setSuccessMessage('La dirección de envío se guardó correctamente.');
      }
      cancelForm();
    } catch (saveError) {
      console.error('Error al guardar los datos de envío:', saveError);
      setError('No fue posible guardar los datos de envío. Intenta nuevamente.');
    } finally { setIsSaving(false); }
  };

  const handleDelete = async (address) => {
    if (!window.confirm('¿Quieres eliminar esta dirección guardada?')) return;
    setDeletingId(address.id); setError('');
    try {
      await deleteDoc(doc(db, 'addresses', address.id));
      setAddresses((current) => current.filter(({ id }) => id !== address.id));
      if (editingAddressId === address.id) cancelForm();
    } catch (deleteError) {
      console.error('Error al eliminar los datos de envío:', deleteError);
      setError('No fue posible eliminar la dirección. Intenta nuevamente.');
    } finally { setDeletingId(null); }
  };

  return <section className="w-full font-['Montserrat']"><div className="overflow-hidden rounded-[32px] border border-slate-200/70 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]"><header className="border-b border-slate-100 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,0.98))] px-6 py-6 sm:px-8"><p className="text-[11px] font-bold uppercase tracking-[0.34em] text-emerald-500">Mi cuenta</p><h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Mis datos de envío</h1><p className="mt-1 text-sm font-medium text-slate-500">Administra las direcciones donde quieres recibir tus pedidos.</p></header><div className="p-4 sm:p-6 lg:p-8">
    {isLoading && <div className="grid gap-4 md:grid-cols-2"><div className="h-52 animate-pulse rounded-[24px] bg-slate-100" /><div className="h-52 animate-pulse rounded-[24px] bg-slate-100" /></div>}
    {!isLoading && isAddingAddress && <AddressForm addressForm={addressForm} mexicanStates={mexicanStates} isSaving={isSaving} saveError={error} isEditing={Boolean(editingAddressId)} showCancel={addresses.length > 0} onCancel={cancelForm} onChange={handleChange} onGenderChange={setGender} onSubmit={handleSubmit} />}
    {!isLoading && !isAddingAddress && <><div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><MapPin size={22} /></span><div><h2 className="text-xl font-black text-slate-900">Tus direcciones guardadas</h2><p className="mt-1 text-sm font-medium text-slate-500">{addresses.length} dirección{addresses.length === 1 ? '' : 'es'} disponible{addresses.length === 1 ? '' : 's'}.</p></div></div><button type="button" onClick={startNewAddress} className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-600"><Plus size={17} /> Agregar dirección</button></div>{error && <p role="alert" className="mb-4 rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</p>}{addresses.length > 0 ? <div className="grid items-stretch gap-4 md:grid-cols-2">{addresses.map((address) => <div key={address.id} className={`h-full ${deletingId === address.id ? 'pointer-events-none opacity-50' : ''}`}><AddressCard className="h-full" address={address} isSelected={false} onSelect={() => {}} onEdit={() => startEdit(address)} onDelete={() => handleDelete(address)} /></div>)}</div> : <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center"><MapPin className="mx-auto text-emerald-500" size={30} /><h2 className="mt-4 text-xl font-black text-slate-900">Aún no tienes direcciones</h2><p className="mx-auto mt-2 max-w-md text-sm font-medium text-slate-500">Guarda una dirección para agilizar tus próximas compras.</p><button type="button" onClick={startNewAddress} className="mt-6 rounded-full bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-700">Agregar primera dirección</button></div>}</>}
  </div></div><SuccessModal isOpen={Boolean(successMessage)} onContinue={() => setSuccessMessage('')} title="Datos guardados" message={successMessage} confirmText="Continuar" /></section>;
};

export default ProfileShippingAddresses;
