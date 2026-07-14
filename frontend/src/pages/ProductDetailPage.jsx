import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BrandAbout from '../components/ProductDetail/BrandAbout';
import ProductDescription from '../components/ProductDetail/ProductDescription';
import ProductHero from '../components/ProductDetail/ProductHero';
import TechSpecsTable from '../components/ProductDetail/TechSpecsTable';
import { useCart } from '../context/CartContext';
import { db } from '../firebaseConfig';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

const DetailSkeleton = () => (
  <div className="grid animate-pulse gap-8 lg:grid-cols-[1.08fr_.92fr]" aria-label="Cargando producto">
    <div className="aspect-square rounded-[32px] bg-slate-200" />
    <div className="space-y-5 rounded-[32px] bg-white p-8">
      <div className="h-4 w-1/3 rounded bg-slate-200" /><div className="h-12 w-full rounded bg-slate-200" />
      <div className="h-32 rounded-[24px] bg-slate-100" /><div className="h-14 rounded-full bg-slate-200" /><div className="h-40 rounded-[24px] bg-slate-100" />
    </div>
  </div>
);

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};
    const mapSnapshot = (snapshot) => {
      const data = snapshot.data();
      return { ...data, id: data.id || snapshot.id, images: Array.isArray(data.images) ? data.images : [], keySpecs: data.keySpecs || {}, fullSpecs: data.fullSpecs || {}, description: data.description || {}, stock: Number(data.stock) || 0, price: Number(data.price) || 0 };
    };
    const loadProduct = async () => {
      if (!id) { setError('No se proporcionó un identificador de producto.'); setLoading(false); return; }
      setLoading(true); setError('');
      try {
        const productRef = doc(db, 'products', id);
        const snapshot = await getDoc(productRef);
        if (!active) return;
        if (!snapshot.exists()) { setProduct(null); setError('El producto que buscas no existe o ya no está disponible.'); return; }
        setProduct(mapSnapshot(snapshot));
        unsubscribe = onSnapshot(productRef, (currentSnapshot) => {
          if (active && currentSnapshot.exists()) setProduct(mapSnapshot(currentSnapshot));
        }, (snapshotError) => console.error('Error escuchando cambios del producto:', snapshotError));
      } catch (loadError) {
        console.error('Error cargando detalle de producto:', loadError);
        if (active) setError('No pudimos cargar este producto. Intenta nuevamente.');
      } finally { if (active) setLoading(false); }
    };
    loadProduct();
    return () => { active = false; unsubscribe(); };
  }, [id]);

  const addProductToCart = useCallback((quantity) => { if (product?.stock > 0) addItem(product, quantity); }, [addItem, product]);

  return <main className="min-h-screen bg-[#F8FAFC] font-['Montserrat'] antialiased"><Navbar /><div className="mx-auto max-w-7xl space-y-12 px-4 pb-20 pt-32 md:px-6 lg:px-8"><button type="button" onClick={() => navigate(-1)} className="text-sm font-black text-slate-400 transition duration-200 hover:text-emerald-500">← Volver al catálogo</button>{loading && <DetailSkeleton />}{!loading && error && <div className="rounded-[32px] border border-rose-100 bg-white p-10 text-center shadow-sm"><p className="text-4xl">⌁</p><h1 className="mt-4 text-2xl font-black text-slate-900">Producto no disponible</h1><p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">{error}</p><button type="button" onClick={() => navigate('/catalogo')} className="mt-6 rounded-full bg-emerald-500 px-6 py-3 text-sm font-black text-white transition duration-200 hover:bg-emerald-600">Explorar catálogo</button></div>}{!loading && !error && product && <><ProductHero product={product} onAddToCart={addProductToCart} /><ProductDescription description={product.description} /><TechSpecsTable fullSpecs={product.fullSpecs} /><BrandAbout brand={product.brand} brandLogo={product.brandLogo} brandAboutText={product.brandAboutText} /></>}</div></main>;
};

export default ProductDetailPage;
