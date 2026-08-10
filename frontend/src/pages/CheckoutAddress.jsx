import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CheckoutLayout from '../components/Checkout/common/CheckoutLayout';
import OrderSummary from '../components/Checkout/common/OrderSummary';
import AddressCard from '../components/Checkout/Step2/AddressCard';
import AddressForm from '../components/Checkout/Step2/AddressForm';
import SuccessModal from '../components/Checkout/Step2/SuccessModal';
import { useCart } from '../context/CartContext';
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { initialAddressForm, mexicanStates } from '../data/addressData';

const CheckoutAddress = () => {
  const navigate = useNavigate();
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
    <>
    <CheckoutLayout
      currentStep={2}
      title="Dirección de envío"
      description="Elige una dirección guardada o agrega una nueva."
      summary={(
        <OrderSummary totalItems={totalItems} uniqueProducts={cartItems.length} totalAmount={totalAmount} buttonText="Ir al siguiente paso" onButtonClick={() => navigate('/checkout/envio-pago', { state: { selectedAddressId } })} isButtonDisabled={!selectedAddressId}>
        </OrderSummary>
      )}
    >
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
    </CheckoutLayout>
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
    </>
  );
};

export default CheckoutAddress;
