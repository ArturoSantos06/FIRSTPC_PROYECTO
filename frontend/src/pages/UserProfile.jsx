import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import OrderHistoryCard from '../components/Profile/OrderHistoryCard';
import { auth, db } from '../firebaseConfig';

const UserProfile = () => {
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) { setIsLoadingOrders(false); return; }
      try {
        const ordersCollection = collection(db, 'orders');
        let snapshot;

        try {
          const ordersQuery = query(ordersCollection, where('userId', '==', userId), orderBy('createdAt', 'desc'));
          snapshot = await getDocs(ordersQuery);
        } catch (indexError) {
          if (indexError.code !== 'failed-precondition') throw indexError;

          snapshot = await getDocs(query(ordersCollection, where('userId', '==', userId)));
        }

        const loadedOrders = snapshot.docs.map((document) => ({ id: document.id, ...document.data() }));
        loadedOrders.sort((first, second) => {
          const firstDate = first.createdAt?.toMillis?.() || new Date(first.createdAt || 0).getTime();
          const secondDate = second.createdAt?.toMillis?.() || new Date(second.createdAt || 0).getTime();
          return secondDate - firstDate;
        });
        setOrders(loadedOrders);
      } catch (loadError) {
        console.error('Error al cargar el historial de pedidos:', loadError);
        setError('No fue posible cargar tus compras. Intenta nuevamente.');
      } finally { setIsLoadingOrders(false); }
    };
    loadOrders();
  }, []);

  return (
    <section className="w-full font-['Montserrat']"><div className="overflow-hidden rounded-[32px] border border-slate-200/70 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]"><div className="border-b border-slate-100 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,0.98))] px-6 py-6 sm:px-8"><p className="text-[11px] font-bold uppercase tracking-[0.34em] text-emerald-500">Mi cuenta</p><h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Mis compras</h1><p className="mt-1 text-sm font-medium text-slate-500">Consulta tus pedidos y descarga nuevamente tus comprobantes.</p></div><div className="p-4 sm:p-6 lg:p-8">
      {isLoadingOrders && <div className="grid gap-4 md:grid-cols-2"><div className="h-40 animate-pulse rounded-[24px] bg-slate-100" /><div className="h-40 animate-pulse rounded-[24px] bg-slate-100" /></div>}
      {!isLoadingOrders && error && <div className="rounded-[24px] bg-rose-50 p-6 text-center text-sm font-bold text-rose-700">{error}</div>}
      {!isLoadingOrders && !error && orders.length > 0 && <div className="grid gap-4 md:grid-cols-2">{orders.map((order) => <OrderHistoryCard key={order.id} order={order} />)}</div>}
      {!isLoadingOrders && !error && orders.length === 0 && <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-600">🛍️</div><h2 className="mt-4 text-xl font-black text-slate-900">Aún no tienes compras</h2><p className="mx-auto mt-2 max-w-md text-sm font-medium text-slate-500">Cuando completes tu primer pedido aparecerá aquí junto con su comprobante.</p><Link to="/componentes" className="mt-6 inline-flex rounded-full bg-emerald-500 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-600">Ver catálogo</Link></div>}
    </div></div></section>
  );
};

export default UserProfile;
