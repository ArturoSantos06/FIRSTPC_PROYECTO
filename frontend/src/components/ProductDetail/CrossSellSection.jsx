import { useRef } from 'react';
import { useCart } from '../../context/CartContext';

const CrossSellSection = ({ categories, products }) => {
  const scrollRef = useRef(null);
  const { addItem } = useCart();
  const scroll = (direction) => scrollRef.current?.scrollBy({ left: direction * 300, behavior: 'smooth' });

  return <section className="space-y-7" id="recomendados">
    <div><p className="mb-2 text-xs font-black uppercase tracking-[.2em] text-emerald-500">Completa tu setup</p><h2 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">También te puede interesar</h2></div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{categories.map((category) => <button key={category.label} type="button" className="group rounded-[24px] border border-slate-100 bg-white p-5 text-left shadow-[0_10px_30px_rgba(15,23,42,0.03)] transition duration-200 hover:-translate-y-1 hover:border-emerald-200"><span className="text-2xl text-emerald-500">{category.icon}</span><span className="mt-3 block text-sm font-black text-slate-700 group-hover:text-emerald-600">{category.label}</span><span className="mt-1 block text-xs font-semibold text-slate-400">Explorar →</span></button>)}</div>
    <div className="relative"><div ref={scrollRef} className="flex snap-x gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{products.map((product) => <article key={product.id} className="group min-w-[245px] snap-start rounded-[28px] border border-slate-100 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.03)] transition duration-200 hover:-translate-y-1 hover:shadow-lg md:min-w-[270px]"><div className="aspect-[1.15] overflow-hidden rounded-2xl bg-slate-50"><img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" /></div><p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{product.brand}</p><h3 className="mt-1 min-h-10 text-sm font-black leading-tight text-slate-800">{product.name}</h3><div className="mt-3 flex items-center justify-between"><span className="text-xs font-bold text-amber-500">★ {product.rating}</span><span className="text-lg font-black text-slate-900">${product.price.toLocaleString('es-MX')}</span></div><button type="button" onClick={() => addItem({ ...product, stock: 10 })} className="mt-4 w-full rounded-full bg-slate-900 py-3 text-xs font-black text-white transition duration-200 hover:bg-emerald-500">Agregar</button></article>)}</div><div className="absolute -top-14 right-0 flex gap-2"><button type="button" onClick={() => scroll(-1)} className="h-10 w-10 rounded-full border border-slate-200 bg-white font-bold text-slate-500 transition duration-200 hover:border-emerald-300 hover:text-emerald-500" aria-label="Anterior">←</button><button type="button" onClick={() => scroll(1)} className="h-10 w-10 rounded-full border border-slate-200 bg-white font-bold text-slate-500 transition duration-200 hover:border-emerald-300 hover:text-emerald-500" aria-label="Siguiente">→</button></div></div>
  </section>;
};

export default CrossSellSection;
