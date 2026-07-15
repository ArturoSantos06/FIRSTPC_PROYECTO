import { useEffect, useState } from 'react';
import { collection, documentId, getDocs, query, where } from 'firebase/firestore';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import OrderHistoryCard from '../components/Profile/OrderHistoryCard';
import FavoriteButton from '../components/FavoriteButton';
import { auth, db } from '../firebaseConfig';
import { useFavorites } from '../hooks/useFavorites';

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

const UserProfile = ({ initialTab = 'orders' }) => {
  const activeTab = initialTab;
  const [orders, setOrders] = useState([]);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(initialTab === 'orders');
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(initialTab === 'favorites');
  const [error, setError] = useState('');
  const { favoriteIds, loading: isLoadingFavoriteIds } = useFavorites();

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

  const favoritesLoading = isLoadingFavorites || isLoadingFavoriteIds;
  return <section className="w-full font-['Montserrat']"><div className="overflow-hidden rounded-[32px] border border-slate-200/70 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]"><div className="border-b border-slate-100 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,0.98))] px-6 py-6 sm:px-8"><p className="text-[11px] font-bold uppercase tracking-[0.34em] text-emerald-500">Mi cuenta</p><h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{activeTab === 'favorites' ? 'Mis favoritos' : 'Mis compras'}</h1><p className="mt-1 text-sm font-medium text-slate-500">{activeTab === 'favorites' ? 'Guarda los componentes que quieres revisar después.' : 'Consulta tus pedidos y descarga nuevamente tus comprobantes.'}</p></div><div className="p-4 sm:p-6 lg:p-8">
    {activeTab === 'orders' && isLoadingOrders && <div className="grid gap-4 md:grid-cols-2"><div className="h-40 animate-pulse rounded-[24px] bg-slate-100" /><div className="h-40 animate-pulse rounded-[24px] bg-slate-100" /></div>}
    {activeTab === 'orders' && !isLoadingOrders && error && <div className="rounded-[24px] bg-rose-50 p-6 text-center text-sm font-bold text-rose-700">{error}</div>}
    {activeTab === 'orders' && !isLoadingOrders && !error && orders.length > 0 && <div className="grid gap-4 md:grid-cols-2">{orders.map((order) => <OrderHistoryCard key={order.id} order={order} />)}</div>}
    {activeTab === 'orders' && !isLoadingOrders && !error && orders.length === 0 && <EmptyState title="Aún no tienes compras" message="Cuando completes tu primer pedido aparecerá aquí junto con su comprobante." />}
    {activeTab === 'favorites' && favoritesLoading && <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"><div className="h-80 animate-pulse rounded-[24px] bg-slate-100" /><div className="h-80 animate-pulse rounded-[24px] bg-slate-100" /></div>}
    {activeTab === 'favorites' && !favoritesLoading && error && <div className="rounded-[24px] bg-rose-50 p-6 text-center text-sm font-bold text-rose-700">{error}</div>}
    {activeTab === 'favorites' && !favoritesLoading && !error && favoriteProducts.length > 0 && <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{favoriteProducts.map((product) => <FavoriteCard key={product.id} product={product} />)}</div>}
    {activeTab === 'favorites' && !favoritesLoading && !error && favoriteProducts.length === 0 && <EmptyState title="Aún no tienes favoritos" message="Explora el catálogo y guarda aquí los componentes que más te gusten." favorites />}
  </div></div></section>;
};

const EmptyState = ({ title, message, favorites = false }) => <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><Heart size={25} fill={favorites ? 'currentColor' : 'none'} /></div><h2 className="mt-4 text-xl font-black text-slate-900">{title}</h2><p className="mx-auto mt-2 max-w-md text-sm font-medium text-slate-500">{message}</p><Link to="/componentes" className="mt-6 inline-flex rounded-full bg-emerald-500 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-600">Ver catálogo</Link></div>;

export default UserProfile;
