import { useEffect, useState } from 'react';
import CheckoutStepper from '../components/Cart/CheckoutStepper';
import OrderSummary from '../components/Cart/OrderSummary';
import AddressCard from '../components/Checkout/AddressCard';
import AddressForm from '../components/Checkout/AddressForm';
import BillingSection from '../components/Checkout/BillingSection';
import BillingModal from '../components/Checkout/BillingModal';
import SuccessModal from '../components/Checkout/SuccessModal';
import { useCart } from '../context/CartContext';
import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

const initialAddressForm = {
  firstName: '', lastName: '', phone: '', gender: '', street: '', exteriorNumber: '',
  interiorNumber: '', neighborhood: '', postalCode: '', city: '', state: '', references: '',
};

const mexicanStates = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua',
  'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Estado de México', 'Guanajuato',
  'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca',
  'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco',
  'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas',
];

const CheckoutAddress = () => {
  const { cartItems, totalItems, totalAmount } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState(initialAddressForm);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successTitle, setSuccessTitle] = useState('Dirección creada');
  const [saveError, setSaveError] = useState('');
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [billingData, setBillingData] = useState(null);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const shippingCost = cartItems.length > 0 ? 133 : 0;

  useEffect(() => {
    const loadSavedAddresses = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) { setIsAddingNewAddress(true); setIsLoadingAddress(false); return; }
      try {
        const addressesRef = collection(db, 'addresses');
        const snapshot = await getDocs(query(addressesRef, where('userId', '==', userId)));
        const loadedAddresses = snapshot.docs.map((document) => ({ id: document.id, ref: document.ref, ...document.data() }));
        setAddresses(loadedAddresses);
        if (loadedAddresses.length > 0) setSelectedAddressId(loadedAddresses[0].id);
        else setIsAddingNewAddress(true);
      } catch (error) {
        console.error('Error al cargar las direcciones guardadas:', error);
        setSaveError('No fue posible cargar tus direcciones guardadas.');
      } finally { setIsLoadingAddress(false); }
    };
    loadSavedAddresses();
  }, []);

  useEffect(() => {
    const loadBillingProfile = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) return;
      try {
        // Se busca por userId para mantener compatibilidad con perfiles creados
        // antes de usar el uid como ID del documento.
        const billingSnapshot = await getDocs(query(
          collection(db, 'billing_profiles'),
          where('userId', '==', userId),
        ));
        if (!billingSnapshot.empty) {
          const billingDocument = billingSnapshot.docs[0];
          setBillingData({ id: billingDocument.id, ...billingDocument.data() });
        } else {
          setBillingData(null);
        }
      } catch (error) {
        console.error('Error al cargar el perfil de facturación:', error);
      }
    };
    loadBillingProfile();
  }, []);

  const handleChange = (event) => setAddressForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const setGender = (gender) => setAddressForm((current) => ({ ...current, gender }));

  const handleAddAddress = () => {
    setAddressForm(initialAddressForm);
    setEditingAddressId(null);
    setSaveError('');
    setIsAddingNewAddress(true);
  };

  const handleEdit = (address) => {
    const formData = Object.fromEntries(Object.entries(address).filter(([key]) => key !== 'id' && key !== 'ref'));
    setAddressForm({ ...initialAddressForm, ...formData });
    setEditingAddressId(address.id);
    setSaveError('');
    setIsAddingNewAddress(true);
  };

  const handleCancel = () => {
    setAddressForm(initialAddressForm);
    setEditingAddressId(null);
    setSaveError('');
    setIsAddingNewAddress(false);
  };

  const handleDeleteAddress = (addressId) => {
    setDeleteError('');
    setAddressToDelete(addressId);
  };

  const confirmDeleteAddress = async () => {
    if (!addressToDelete || isDeleting) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteDoc(doc(db, 'addresses', addressToDelete));
      const remainingAddresses = addresses.filter(({ id }) => id !== addressToDelete);
      setAddresses(remainingAddresses);
      if (selectedAddressId === addressToDelete) {
        setSelectedAddressId(remainingAddresses[0]?.id || null);
      }
      if (remainingAddresses.length === 0) {
        setIsAddingNewAddress(true);
      }
      setAddressToDelete(null);
    } catch (error) {
      console.error('Error al eliminar la dirección:', error);
      setDeleteError('No fue posible eliminar la dirección. Intenta nuevamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveBilling = async (billingForm) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('No hay una sesión activa.');
    const billingProfile = { ...billingForm, userId, updatedAt: serverTimestamp() };
    const profileId = billingData?.id || userId;
    await setDoc(doc(db, 'billing_profiles', profileId), billingProfile, { merge: true });
    setBillingData({ ...billingForm, userId, id: profileId });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSaving) return;
    setIsSaving(true); setSaveError('');
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) { setSaveError('Tu sesión expiró. Inicia sesión nuevamente para continuar.'); return; }
      const addressesRef = collection(db, 'addresses');
      const addressData = { ...addressForm, userId };
      let savedAddress;
      if (editingAddressId) {
        const address = addresses.find(({ id }) => id === editingAddressId);
        await updateDoc(address.ref, addressData);
        savedAddress = { ...addressData, id: editingAddressId, ref: address.ref };
      } else {
        const document = await addDoc(addressesRef, addressData);
        savedAddress = { ...addressData, id: document.id };
      }
      setAddresses((current) => editingAddressId
        ? current.map((address) => address.id === savedAddress.id ? savedAddress : address)
        : [...current, savedAddress]);
      setSelectedAddressId(savedAddress.id);
      setSuccessTitle(editingAddressId ? 'Dirección actualizada' : 'Dirección creada');
      setIsAddingNewAddress(false); setEditingAddressId(null); setAddressForm(initialAddressForm);
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error('Error al guardar la dirección:', error);
      setSaveError('No fue posible guardar la dirección. Intenta nuevamente.');
    } finally { setIsSaving(false); }
  };

  return (
    <section className="w-full font-['Montserrat']">
      <div className="overflow-hidden rounded-[32px] border border-slate-200/70 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <CheckoutStepper currentStep={2} />
        <div className="border-b border-slate-100 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,0.98))] px-6 py-5 sm:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-emerald-500">FIRSTPC Checkout</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Dirección de envío</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">Elige una dirección guardada o agrega una nueva.</p>
        </div>
        <div className="grid items-start gap-6 p-4 sm:p-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-8 xl:p-8">
          <div>
            {isLoadingAddress ? <div className="rounded-[28px] border border-slate-200/70 bg-slate-50/50 p-8 text-center shadow-sm"><p className="text-sm font-bold text-slate-500">Cargando direcciones...</p></div> : isAddingNewAddress ? (
              <AddressForm addressForm={addressForm} mexicanStates={mexicanStates} isSaving={isSaving} saveError={saveError} isEditing={Boolean(editingAddressId)} showCancel={addresses.length > 0} onCancel={handleCancel} onChange={handleChange} onGenderChange={setGender} onSubmit={handleSubmit} />
            ) : (
              <div className="rounded-[28px] border border-slate-200/70 bg-slate-50/50 p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-500">Tus direcciones</p><h3 className="mt-1 text-xl font-black text-slate-900">Selecciona dónde recibir tu pedido</h3></div><span className="hidden rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500 sm:inline">{addresses.length} guardada{addresses.length === 1 ? '' : 's'}</span></div>
                <div className="grid gap-4 md:grid-cols-2">{addresses.map((address) => <AddressCard key={address.id} address={address} isSelected={selectedAddressId === address.id} onSelect={() => setSelectedAddressId(address.id)} onEdit={() => handleEdit(address)} onDelete={() => handleDeleteAddress(address.id)} />)}</div>
                <button type="button" onClick={handleAddAddress} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white py-4 text-sm font-bold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-600"><span className="text-xl leading-none">+</span> Agregar otra dirección</button>
              </div>
            )}
          </div>
          <OrderSummary totalItems={totalItems} uniqueProducts={cartItems.length} totalAmount={totalAmount} shippingCost={shippingCost} buttonText="Ir al siguiente paso" onButtonClick={() => {}} isButtonDisabled={!selectedAddressId}>
            <BillingSection billingData={billingData} onOpenBillingModal={() => setIsBillingModalOpen(true)} />
          </OrderSummary>
        </div>
      </div>
      <SuccessModal isOpen={isSuccessModalOpen} onContinue={() => setIsSuccessModalOpen(false)} title={successTitle} />
      <SuccessModal
        isOpen={Boolean(addressToDelete)}
        variant="danger"
        title="¿Eliminar dirección?"
        message="Esta acción no se puede deshacer. ¿Quieres eliminar esta dirección guardada?"
        confirmText={isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
        cancelText="Cancelar"
        error={deleteError}
        isLoading={isDeleting}
        onContinue={confirmDeleteAddress}
        onCancel={() => { if (!isDeleting) setAddressToDelete(null); }}
      />
      <BillingModal isOpen={isBillingModalOpen} onClose={() => setIsBillingModalOpen(false)} initialData={billingData} onSave={handleSaveBilling} />
    </section>
  );
};

export default CheckoutAddress;
