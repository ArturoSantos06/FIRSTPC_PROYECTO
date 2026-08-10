import { useCallback, useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Star } from 'lucide-react';
import { auth, db } from '../../firebaseConfig';

const formatDate = (value) => {
  const date = value?.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(date);
};

const ProductReviews = ({ product }) => {
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'products', product.id, 'reviews'));
      const loaded = snapshot.docs.map((review) => ({ id: review.id, ...review.data() }));
      loaded.sort((a, b) => (b.updatedAt?.toMillis?.() || 0) - (a.updatedAt?.toMillis?.() || 0));
      setReviews(loaded);
      const current = loaded.find((review) => review.id === auth.currentUser?.uid);
      if (current) { setMyReview(current); setRating(current.rating); setComment(current.comment || ''); }
    } catch (loadError) { console.error('Error cargando opiniones:', loadError); setError('No pudimos cargar las opiniones.'); }
    finally { setLoading(false); }
  }, [product.id]);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  useEffect(() => {
    if (window.location.hash !== '#opiniones') return;
    const scrollToReviews = window.setTimeout(() => {
      document.getElementById('opiniones')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    return () => window.clearTimeout(scrollToReviews);
  }, []);

  const submitReview = async (event) => {
    event.preventDefault();
    if (!auth.currentUser) { setError('Inicia sesión para dejar una opinión.'); return; }
    if (!rating || comment.trim().length < 5) { setError('Selecciona una calificación y escribe al menos 5 caracteres.'); return; }
    setSaving(true); setError(''); setMessage('');
    try {
      await httpsCallable(getFunctions(), 'submitProductReview')({ productId: product.id, rating, comment: comment.trim() });
      setMessage('Tu opinión se guardó correctamente.');
      await loadReviews();
    } catch (saveError) {
      const code = saveError?.code || '';
      setError(code.includes('permission-denied') || code.includes('failed-precondition') ? 'Solo las personas que compren este producto pueden opinar.' : (saveError?.message || 'No pudimos guardar tu opinión.'));
    } finally { setSaving(false); }
  };

  return <section id="opiniones" className="scroll-mt-28 rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_15px_45px_rgba(15,23,42,0.04)] md:p-8">
    <div><p className="text-xs font-black uppercase tracking-[.2em] text-emerald-500">Experiencias reales</p><h2 className="mt-2 text-2xl font-black text-slate-900">Opiniones de clientes</h2><p className="mt-2 text-sm font-medium text-slate-500">Comparte tu experiencia con este producto.</p></div>
    {auth.currentUser && <form onSubmit={submitReview} className="mt-6 rounded-2xl bg-slate-50 p-5"><p className="text-sm font-black text-slate-800">{myReview ? 'Actualiza tu opinión' : 'Deja tu opinión'}</p><div className="mt-3 flex gap-1">{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value} estrellas`} className={value <= rating ? 'text-amber-400' : 'text-slate-300'}><Star size={24} fill="currentColor" /></button>)}</div><textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="¿Qué te pareció?" rows={3} maxLength={800} className="mt-3 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-400" /><button disabled={saving} className="mt-3 rounded-full bg-emerald-500 px-5 py-3 text-sm font-black text-white disabled:opacity-50">{saving ? 'Verificando compra...' : myReview ? 'Actualizar opinión' : 'Publicar opinión'}</button></form>}
    {error && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</p>}{message && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{message}</p>}
    <div className="mt-6 space-y-4">{loading && <p className="text-sm font-semibold text-slate-400">Cargando opiniones...</p>}{!loading && !reviews.length && <p className="text-sm font-semibold text-slate-400">Aún no hay opiniones para este producto.</p>}{reviews.map((review) => <article key={review.id} className="border-t border-slate-100 pt-4"><div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-1 text-amber-400">{[1, 2, 3, 4, 5].map((value) => <Star key={value} size={15} fill={value <= review.rating ? 'currentColor' : 'none'} />)}</div><span className="text-xs font-semibold text-slate-400">{formatDate(review.updatedAt)}</span></div><p className="mt-2 text-sm font-medium leading-6 text-slate-600">{review.comment}</p><p className="mt-2 text-xs font-black text-slate-800">{review.authorName || 'Cliente verificado'} · Compra verificada</p></article>)}</div>
  </section>;
};

export default ProductReviews;
