import { useEffect, useState } from 'react';
import { arrayRemove, collection, documentId, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { Heart, Trash2, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import OrderHistoryCard from '../components/Profile/OrderHistoryCard';
import FavoriteButton from '../components/FavoriteButton';
import { auth, db } from '../firebaseConfig';
import { useFavorites } from '../hooks/useFavorites';
import { useCart } from '../context/CartContext';

const chunk = (values, size) => Array.from({ length: Math.ceil(values.length / size) }, (_, index) => values.slice(index * size, index * size + size));

const FavoriteCard = ({ product }) => (
  <article className="group relative overflow-hidden rounded-[24px] border border-slate-100 bg-white p-4 shadow-[0_12px_35px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(16,185,129,0.1)]">
    <div className="absolute right-4 top-4 z-10"><FavoriteButton productId={product.id} size={18} /></div>
    <Link to={`/producto/${product.id}`} className="block">
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-[18px] bg-slate-50"><img src={product.images?.[0] || product.image || 'https://via.placeholder.com/300?text=Hardware'} alt={product.name} className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-105" /></div>
      <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-emerald-600">{product.brand || 'FIRSTPC'}</p>
      <h2 className="mt-1 line-clamp-2 text-sm font-black leading-5 text-slate-800">{product.name}</h2>
      <div className="mt-3 flex items-end justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">SKU {product.sku || 'N/D'}</p><p className="mt-1 text-lg font-black text-slate-900">${Number(product.price || 0).toLocaleString('es-MX')}</p></div><span className={`text-[10px] font-black ${Number(product.stock) > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{Number(product.stock) > 0 ? `${product.stock} disponibles` : 'Agotado'}</span></div>
    </Link>
  </article>
);

const ConfigurationCard = ({ configuration, onEdit, onAddToCart, onDelete, deleting }) => (
  <article className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.04)]">
    <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">PC personalizada</p><h2 className="mt-1 text-lg font-black text-slate-900">{configuration.name || 'Configuración guardada'}</h2></div><p className="text-lg font-black text-emerald-600">${Number(configuration.total || 0).toLocaleString('es-MX')}</p></div>
    <p className="mt-1 text-xs font-semibold text-slate-400">{configuration.createdAt ? new Date(configuration.createdAt).toLocaleDateString('es-MX') : 'Fecha no disponible'} · {configuration.assembly ? 'Con ensamblado' : 'Sin ensamblado'}</p>
    <div className="mt-4 space-y-2">{(configuration.components || []).map((component) => <div key={`${configuration.id}-${component.key}`} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2"><span className="truncate text-xs font-bold text-slate-700">{component.name}</span><span className="shrink-0 text-xs font-black text-slate-500">${Number(component.price || 0).toLocaleString('es-MX')}</span></div>)}</div>
    <div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={() => onEdit(configuration)} className="flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-xs font-black text-slate-700 transition hover:border-emerald-400 hover:text-emerald-600">Editar configuración</button><button type="button" onClick={() => onAddToCart(configuration)} className="flex-1 rounded-full bg-emerald-500 px-4 py-2.5 text-xs font-black text-white transition hover:bg-emerald-600">Agregar al carrito</button><button type="button" disabled={deleting} onClick={() => onDelete(configuration)} className="rounded-full border border-rose-200 px-4 py-2.5 text-xs font-black text-rose-500 transition hover:bg-rose-50 disabled:opacity-50">{deleting ? 'Eliminando...' : 'Eliminar'}</button></div>
  </article>
);

const DeleteConfigurationModal = ({ configuration, loading, onCancel, onConfirm }) => {
  if (!configuration) return null;
  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="delete-configuration-title"><div className="w-full max-w-md rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_25px_80px_rgba(15,23,42,0.2)]"><div className="flex items-start justify-between gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500"><Trash2 size={22} /></div><button type="button" onClick={onCancel} disabled={loading} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Cerrar modal"><X size={20} /></button></div><h2 id="delete-configuration-title" className="mt-5 text-xl font-black text-slate-900">¿Eliminar esta configuración?</h2><p className="mt-2 text-sm font-medium leading-6 text-slate-500">Se eliminará <span className="font-black text-slate-700">{configuration.name || 'esta PC configurada'}</span> de tu perfil. Esta acción no se puede deshacer.</p><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onCancel} disabled={loading} className="rounded-full bg-slate-100 px-5 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-200 disabled:opacity-50">Cancelar</button><button type="button" onClick={onConfirm} disabled={loading} className="rounded-full bg-rose-500 px-5 py-3 text-sm font-black text-white transition hover:bg-rose-600 disabled:opacity-50">{loading ? 'Eliminando...' : 'Sí, eliminar'}</button></div></div></div>;
};

const UserProfile = ({ initialTab = 'orders' }) => {
  const activeTab = initialTab;
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [orders, setOrders] = useState([]);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [configurations, setConfigurations] = useState([]);
  const [deletingConfigurationId, setDeletingConfigurationId] = useState('');
  const [configurationToDelete, setConfigurationToDelete] = useState(null);
  const [isLoadingOrders, setIsLoadingOrders] = useState(initialTab === 'orders');
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(initialTab === 'favorites');
  const [isLoadingConfigurations, setIsLoadingConfigurations] = useState(initialTab === 'configurations');
  const [error, setError] = useState('');
  const { favoriteIds, loading: isLoadingFavoriteIds } = useFavorites();

  const editConfiguration = (configuration) => navigate('/armar-pc', { state: { configuration } });
  const deleteConfiguration = async (configuration) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    setDeletingConfigurationId(configuration.id);
    try {
      await updateDoc(doc(db, 'users', userId), { pcConfigurations: arrayRemove(configuration) });
      setConfigurations((current) => current.filter((item) => item.id !== configuration.id));
      setConfigurationToDelete(null);
    } catch (deleteError) { console.error('Error al eliminar la PC configurada:', deleteError); setError('No fue posible eliminar la configuración. Intenta nuevamente.'); }
    finally { setDeletingConfigurationId(''); }
  };
  const addConfigurationToCart = (configuration) => {
    (configuration.components || []).forEach((component) => addItem({ ...component, stock: component.stock || 999999 }));
    if (configuration.assembly) addItem({ id: 'firstpc-assembly-service', name: 'Servicio de ensamblado FIRSTPC', price: 300, stock: 999999, category: 'servicio', image: '' });
    navigate('/carrito');
  };

  useEffect(() => {
    if (activeTab !== 'orders') return;
    const loadOrders = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) { setIsLoadingOrders(false); return; }
      try {
        const snapshot = await getDocs(query(collection(db, 'orders'), where('userId', '==', userId)));
        const loadedOrders = snapshot.docs.map((document) => ({ id: document.id, ...document.data() }));
        loadedOrders.sort((a, b) => (b.createdAt?.toMillis?.() || new Date(b.createdAt || 0).getTime()) - (a.createdAt?.toMillis?.() || new Date(a.createdAt || 0).getTime()));
        setOrders(loadedOrders);
      } catch (loadError) { console.error('Error al cargar el historial:', loadError); setError('No fue posible cargar tus compras. Intenta nuevamente.'); }
      finally { setIsLoadingOrders(false); }
    };
    loadOrders();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'favorites') return;
    if (isLoadingFavoriteIds) return;
    const loadFavoriteProducts = async () => {
      setIsLoadingFavorites(true); setError('');
      try {
        const snapshots = await Promise.all(chunk(favoriteIds, 30).map((ids) => getDocs(query(collection(db, 'products'), where(documentId(), 'in', ids)))));
        const products = snapshots.flatMap((snapshot) => snapshot.docs.map((document) => ({ id: document.id, ...document.data() })));
        const order = new Map(favoriteIds.map((id, index) => [id, index]));
        setFavoriteProducts(products.sort((a, b) => order.get(a.id) - order.get(b.id)));
      } catch (loadError) { console.error('Error al cargar favoritos:', loadError); setError('No fue posible cargar tus favoritos. Intenta nuevamente.'); }
      finally { setIsLoadingFavorites(false); }
    };
    loadFavoriteProducts();
  }, [activeTab, favoriteIds, isLoadingFavoriteIds]);

  useEffect(() => {
    if (activeTab !== 'configurations') return;
    const loadConfigurations = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) { setIsLoadingConfigurations(false); return; }
      try {
        const snapshot = await getDoc(doc(db, 'users', userId));
        const saved = snapshot.exists() && Array.isArray(snapshot.data().pcConfigurations) ? snapshot.data().pcConfigurations : [];
        setConfigurations([...saved].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
      } catch (loadError) { console.error('Error al cargar las PCs configuradas:', loadError); setError('No fue posible cargar tus configuraciones. Intenta nuevamente.'); }
      finally { setIsLoadingConfigurations(false); }
    };
    loadConfigurations();
  }, [activeTab]);

  const favoritesLoading = isLoadingFavorites || isLoadingFavoriteIds;
  return <section className="w-full font-['Montserrat']"><div className="overflow-hidden rounded-[32px] border border-slate-200/70 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]"><div className="border-b border-slate-100 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,0.98))] px-6 py-6 sm:px-8"><p className="text-[11px] font-bold uppercase tracking-[0.34em] text-emerald-500">Mi cuenta</p><h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{activeTab === 'favorites' ? 'Mis favoritos' : activeTab === 'configurations' ? 'Mis PCs configuradas' : 'Mis compras'}</h1><p className="mt-1 text-sm font-medium text-slate-500">{activeTab === 'favorites' ? 'Guarda los componentes que quieres revisar después.' : activeTab === 'configurations' ? 'Consulta las configuraciones que guardaste desde el PC Builder.' : 'Consulta tus pedidos y descarga nuevamente tus comprobantes.'}</p></div><div className="p-4 sm:p-6 lg:p-8">
    {activeTab === 'orders' && isLoadingOrders && <div className="grid gap-4 md:grid-cols-2"><div className="h-40 animate-pulse rounded-[24px] bg-slate-100" /><div className="h-40 animate-pulse rounded-[24px] bg-slate-100" /></div>}
    {activeTab === 'orders' && !isLoadingOrders && error && <div className="rounded-[24px] bg-rose-50 p-6 text-center text-sm font-bold text-rose-700">{error}</div>}
    {activeTab === 'orders' && !isLoadingOrders && !error && orders.length > 0 && <div className="grid gap-4 md:grid-cols-2">{orders.map((order) => <OrderHistoryCard key={order.id} order={order} />)}</div>}
    {activeTab === 'orders' && !isLoadingOrders && !error && orders.length === 0 && <EmptyState title="Aún no tienes compras" message="Cuando completes tu primer pedido aparecerá aquí junto con su comprobante." />}
    {activeTab === 'favorites' && favoritesLoading && <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"><div className="h-80 animate-pulse rounded-[24px] bg-slate-100" /><div className="h-80 animate-pulse rounded-[24px] bg-slate-100" /></div>}
    {activeTab === 'favorites' && !favoritesLoading && error && <div className="rounded-[24px] bg-rose-50 p-6 text-center text-sm font-bold text-rose-700">{error}</div>}
    {activeTab === 'favorites' && !favoritesLoading && !error && favoriteProducts.length > 0 && <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{favoriteProducts.map((product) => <FavoriteCard key={product.id} product={product} />)}</div>}
    {activeTab === 'favorites' && !favoritesLoading && !error && favoriteProducts.length === 0 && <EmptyState title="Aún no tienes favoritos" message="Explora el catálogo y guarda aquí los componentes que más te gusten." favorites />}
    {activeTab === 'configurations' && isLoadingConfigurations && <div className="grid gap-4 md:grid-cols-2"><div className="h-64 animate-pulse rounded-[24px] bg-slate-100" /><div className="h-64 animate-pulse rounded-[24px] bg-slate-100" /></div>}
    {activeTab === 'configurations' && !isLoadingConfigurations && error && <div className="rounded-[24px] bg-rose-50 p-6 text-center text-sm font-bold text-rose-700">{error}</div>}
    {activeTab === 'configurations' && !isLoadingConfigurations && !error && configurations.length > 0 && <div className="grid gap-4 md:grid-cols-2">{configurations.map((configuration) => <ConfigurationCard key={configuration.id} configuration={configuration} onEdit={editConfiguration} onAddToCart={addConfigurationToCart} onDelete={(item) => setConfigurationToDelete(item)} deleting={deletingConfigurationId === configuration.id} />)}</div>}
    {activeTab === 'configurations' && !isLoadingConfigurations && !error && configurations.length === 0 && <EmptyState title="Aún no tienes PCs configuradas" message="Arma una PC y guárdala desde el resumen final del configurador." />}
    <DeleteConfigurationModal configuration={configurationToDelete} loading={Boolean(deletingConfigurationId)} onCancel={() => { if (!deletingConfigurationId) setConfigurationToDelete(null); }} onConfirm={() => deleteConfiguration(configurationToDelete)} />
  </div></div></section>;
};

const EmptyState = ({ title, message, favorites = false }) => <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><Heart size={25} fill={favorites ? 'currentColor' : 'none'} /></div><h2 className="mt-4 text-xl font-black text-slate-900">{title}</h2><p className="mx-auto mt-2 max-w-md text-sm font-medium text-slate-500">{message}</p><Link to="/componentes" className="mt-6 inline-flex rounded-full bg-emerald-500 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-600">Ver catálogo</Link></div>;

export default UserProfile;
