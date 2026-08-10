import { useEffect, useMemo, useRef, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { SearchIcon } from './icons/AppIcons';

const normalize = (value) => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const NavbarSearch = ({ isAdmin, closeSignal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const buttonRef = useRef(null);
  const popoverRef = useRef(null);

  const links = useMemo(() => [
    { name: 'Inicio', detail: 'Página principal', path: '/' },
    { name: 'Componentes', detail: 'Explorar productos y hardware', path: '/componentes' },
    { name: 'Armar PC', detail: 'Configura tu computadora', path: '/armar-pc' },
    { name: 'Soporte', detail: 'Contáctanos', path: '/soporte' },
    ...(isAdmin ? [
      { name: 'Catálogo administrativo', detail: 'Gestionar productos', path: '/admin' },
      { name: 'Inventario', detail: 'Controlar existencias', path: '/admin/inventario' },
      { name: 'Historial de compras', detail: 'Consultar y actualizar pedidos', path: '/admin/compras' },
    ] : []),
  ], [isAdmin]);

  useEffect(() => {
    if (!isOpen || products.length) return undefined;
    let active = true;
    setLoading(true);
    getDocs(collection(db, 'products')).then((snapshot) => {
      if (active) setProducts(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    }).catch((error) => console.error('Error cargando índice de búsqueda:', error)).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [isOpen, products.length]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!buttonRef.current?.contains(event.target) && !popoverRef.current?.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
    setSearch('');
  }, [closeSignal]);

  const close = () => {
    setIsOpen(false);
    setSearch('');
  };

  const normalizedSearch = normalize(search.trim());
  const results = useMemo(() => {
    if (!normalizedSearch) return { links: [], products: [] };
    return {
      links: links.filter((link) => normalize(`${link.name} ${link.detail}`).includes(normalizedSearch)),
      products: products.filter((product) => normalize(JSON.stringify(product)).includes(normalizedSearch)).slice(0, 10),
    };
  }, [links, normalizedSearch, products]);

  return <>
    <button ref={buttonRef} type="button" onClick={() => setIsOpen((open) => !open)} aria-label="Buscar en FIRSTPC" aria-expanded={isOpen} className={`ml-2 p-1 transition-colors duration-200 md:ml-3 ${isOpen ? 'text-[#10B981]' : 'text-[#64748B] hover:text-[#10B981]'}`}>
      <SearchIcon />
    </button>
    {isOpen && <div ref={popoverRef} className="absolute right-0 top-[calc(100%+0.75rem)] z-[60] w-[min(92vw,440px)] overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.16)]">
      <div className="border-b border-slate-100 p-3"><div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-emerald-400 focus-within:bg-white"><SearchIcon /><input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Busca productos, categorías o secciones..." className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400" />{search && <button type="button" onClick={() => setSearch('')} aria-label="Limpiar búsqueda" className="text-lg font-bold text-slate-400 hover:text-slate-700">×</button>}</div></div>
      {normalizedSearch && <div className="max-h-[min(65vh,460px)] overflow-y-auto p-3">{loading && <p className="px-3 py-5 text-center text-xs font-semibold text-slate-400">Buscando en el catálogo...</p>}{!loading && !results.links.length && !results.products.length && <p className="px-3 py-5 text-center text-xs font-semibold text-slate-400">No encontramos resultados para “{search}”.</p>}{results.links.length > 0 && <div className="mb-3"><p className="px-3 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Secciones</p>{results.links.map((link) => <Link key={link.path} to={link.path} onClick={close} className="flex items-center justify-between rounded-2xl px-3 py-2.5 transition hover:bg-emerald-50"><span className="text-xs font-black text-slate-800">{link.name}</span><span className="text-[10px] font-semibold text-slate-400">{link.detail}</span></Link>)}</div>}{results.products.length > 0 && <div><p className="px-3 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Productos</p>{results.products.map((product) => <Link key={product.id} to={`/producto/${product.id}`} onClick={close} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 transition hover:bg-emerald-50"><img src={product.images?.[0] || product.image || 'https://via.placeholder.com/60?text=PC'} alt="" className="h-11 w-11 rounded-xl border border-slate-100 bg-white object-contain p-1" /><span className="min-w-0 flex-1"><span className="block truncate text-xs font-black text-slate-800">{product.name || 'Producto sin nombre'}</span><span className="mt-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">{product.brand || product.category || 'FIRSTPC'}</span></span><span className="text-xs font-black text-emerald-600">${Number(product.price || 0).toLocaleString('es-MX')}</span></Link>)}</div>}</div>}
    </div>}
  </>;
};

export default NavbarSearch;
