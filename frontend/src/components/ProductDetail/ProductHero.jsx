import { useEffect, useState } from 'react';
import { BackIcon, ShareIcon } from '../icons/AppIcons';
import FavoriteButton from '../FavoriteButton';
import StockNotice from '../AdminInventory/StockNotice';
import { canAddToCart, getLocalStock, getMaxQuantity, isDistributorIntegrated } from '../AdminInventory/inventory';

const formatPrice = (value) => new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
}).format(value);

const ProductHero = ({ product, onAddToCart, onBack }) => {
  const images = product.images?.filter(Boolean) || [];
  const specs = Object.entries(product.keySpecs || {});
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [shareMessage, setShareMessage] = useState('');
  const displayRating = Number(product.rating) || 0;
  const displayReviewsCount = Number(product.reviewsCount) || 0;
  const stock = getLocalStock(product);
  const hasDistributorStock = isDistributorIntegrated(product);

  useEffect(() => {
    setActiveImage(0);
    setQuantity(1);
  }, [product.id]);


  const maxQuantity = getMaxQuantity(product);
  const canPurchase = canAddToCart(product);
  const handleShare = async () => {
    const shareData = { title: product.name, text: `Mira este producto en FIRSTPC: ${product.name}`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(shareData.url);
        setShareMessage('Enlace copiado');
        window.setTimeout(() => setShareMessage(''), 2200);
      }
    } catch (shareError) {
      if (shareError?.name !== 'AbortError') setShareMessage('No se pudo compartir');
    }
  };
  const showValue = (value) => typeof value === 'boolean'
    ? (value ? '✓ Sí' : '✗ No')
    : String(value);

  return (
    <section className="grid gap-8 lg:grid-cols-[1.08fr_.92fr]">
      <div className="relative rounded-[32px] border border-slate-100 bg-white p-4 shadow-[0_15px_45px_rgba(15,23,42,0.04)] md:p-6">
        <button type="button" onClick={onBack} title="Volver al catálogo" aria-label="Volver al catálogo" className="absolute left-5 top-7 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 md:-left-14 md:top-3"><BackIcon size={17} /></button>
        <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[24px] bg-slate-50">
          {images[activeImage] ? (
            <img
              src={images[activeImage]}
              alt={`${product.name} vista ${activeImage + 1}`}
              className="h-full w-full object-contain p-3 transition duration-300"
            />
          ) : <span className="font-bold text-slate-400">Sin imagen disponible</span>}
          <div className="absolute left-5 top-5 hidden rounded-2xl bg-white/90 px-4 py-2 text-sm font-black text-slate-800 shadow-sm md:block">{product.brand}</div>
          <div className="absolute right-5 top-3 flex gap-2">
            <FavoriteButton productId={product.id} />
            <button type="button" onClick={handleShare} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:text-emerald-500" aria-label="Compartir producto" title="Compartir producto"><ShareIcon size={17} /></button>
            {shareMessage && <span role="status" className="absolute right-0 top-14 whitespace-nowrap rounded-full bg-slate-900 px-3 py-2 text-[10px] font-black text-white shadow-lg">{shareMessage}</span>}
          </div>
        </div>
        <div className="mt-4 flex gap-3 overflow-x-auto">
          {images.map((image, index) => (
            <button key={`${image}-${index}`} type="button" onClick={() => setActiveImage(index)} className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition duration-200 hover:border-emerald-400 ${activeImage === index ? 'border-emerald-500' : 'border-transparent'}`} aria-label={`Ver imagen ${index + 1}`}>
              <img src={image} alt="" className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6 pt-2">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[.18em] text-slate-400">{product.brand} · SKU {product.sku || 'No disponible'}{product.mpn ? ` · MPN ${product.mpn}` : ''}</p>
          <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-900 md:text-3xl">{product.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm"><div className="flex items-center gap-0.5" aria-label="Calificación promedio">{[1, 2, 3, 4, 5].map((star) => <span key={star} className={`text-xl leading-none ${star <= Math.round(displayRating) ? 'text-amber-400' : 'text-slate-200'}`}>★</span>)}</div><span className="font-black text-slate-700">{displayRating.toFixed(1)}</span><span className="font-semibold text-slate-400">({displayReviewsCount} opiniones)</span></div>
        </div>
        <div className="rounded-[24px] bg-slate-50 p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Precio FIRSTPC</p>
          <p className="mt-1 text-3xl font-black tracking-tight text-slate-900">{formatPrice(product.price)}</p>
          <p className={`mt-3 text-sm font-black ${stock > 0 ? 'text-emerald-600' : hasDistributorStock ? 'text-amber-600' : 'text-rose-500'}`}>
            {stock > 0 ? `${stock} pieza${stock === 1 ? '' : 's'} disponibles en stock` : hasDistributorStock ? 'Disponible bajo pedido' : 'Agotado'}
          </p>
          <div className="mt-4 space-y-2 text-sm font-semibold text-slate-600"><p><span className="mr-2 text-emerald-500">✓</span>Envío a todo México</p><p><span className="mr-2 text-emerald-500">✓</span>Recíbelo entre 3 a 10 días hábiles</p><p><span className="mr-2 text-emerald-500">✓</span>Paga con OXXO Pay, tarjeta de débito, crédito o PayPal</p></div>
        </div>
        <div className="flex flex-row gap-2 sm:gap-3">
          <div className="flex h-14 min-w-0 flex-1 items-center justify-between rounded-full border border-slate-200 px-1 sm:flex-none sm:px-2"><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="h-10 w-9 rounded-full text-xl font-bold text-slate-500 transition duration-200 hover:bg-slate-100 sm:w-10" aria-label="Disminuir cantidad">−</button><span className="w-7 text-center font-black text-slate-800">{quantity}</span><button type="button" onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))} className="h-10 w-9 rounded-full text-xl font-bold text-slate-500 transition duration-200 hover:bg-slate-100 disabled:opacity-30 sm:w-10" disabled={quantity >= maxQuantity} aria-label="Aumentar cantidad">+</button></div>
          <button type="button" disabled={!canPurchase} onClick={() => onAddToCart(quantity)} className="h-14 min-w-0 flex-[1.8] rounded-full bg-[#10B981] px-3 text-sm font-black text-white shadow-[0_12px_25px_rgba(16,185,129,0.2)] transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300 sm:flex-1 sm:px-7 sm:text-base">{canPurchase ? 'Agregar al carrito' : 'Agotado'}</button>
        </div>
        <StockNotice product={product} quantity={quantity} />
        <div className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.03)]"><h2 className="mb-4 font-black text-slate-900">Especificaciones esenciales</h2><dl className="grid grid-cols-2 gap-x-5 gap-y-4">{specs.map(([label, value]) => <div key={label}><dt className="text-xs font-semibold text-slate-400">{label}</dt><dd className="mt-1 text-sm font-black text-slate-700">{showValue(value)}</dd></div>)}</dl><a href="#especificaciones" className="mt-6 inline-block text-sm font-black text-emerald-600 transition duration-200 hover:text-emerald-700">Ver especificaciones completas →</a></div>
      </div>
    </section>
  );
};

export default ProductHero;
