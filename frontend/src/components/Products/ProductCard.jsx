import React from "react";
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import FavoriteButton from '../FavoriteButton';

const ProductCard = ({ product, isAdmin, onEditProduct }) => {
  const { addItem } = useCart();
  const navigate = useNavigate();

  const openProductDetail = () => {
    if (product?.id) navigate(`/producto/${product.id}`);
  };

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={openProductDetail}
      onKeyDown={(event) => {
        if ((event.key === 'Enter' || event.key === ' ') && event.target === event.currentTarget) {
          event.preventDefault();
          openProductDetail();
        }
      }}
      className="group relative cursor-pointer overflow-hidden rounded-[32px] border border-slate-100 bg-white p-5 shadow-[0_10px_30px_rgba(100,116,139,0.02)] transition-all duration-300 hover:-translate-y-1 hover:border-[#10B981]/20 hover:shadow-[0_20px_40px_rgba(16,185,129,0.05)] focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
    >
      
      <div className="absolute -top-10 -right-10 h-24 w-24 bg-[#A7F3D0]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 z-0" />

      {isAdmin && (
        <button type="button" onClick={(event) => { event.stopPropagation(); onEditProduct(product); }} className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white/95 text-[14px] font-black text-slate-500 shadow-[0_12px_26px_rgba(15,23,42,0.1)] transition hover:-translate-y-0.5 hover:border-[#10B981]/30 hover:text-[#10B981]" aria-label={`Editar ${product.name}`}>✎</button>
      )}

      <div className={`absolute top-4 z-20 ${isAdmin ? 'right-16' : 'right-4'}`}><FavoriteButton productId={product.id} /></div>

      <div className="relative z-10">
        <div className="w-full aspect-square bg-slate-50 overflow-hidden rounded-[24px] mb-4 border border-slate-50">
          <img
            src={product.images?.[0] || product.image || "https://via.placeholder.com/300?text=Hardware"}
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <span className="inline-block bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2">
          {product.brand}
        </span>

        <h3 className="text-md font-black text-slate-800 tracking-tight line-clamp-2 leading-tight mb-1 group-hover:text-[#10B981] transition-colors">
          {product.name}
        </h3>
        
        <p className="text-xs font-medium text-slate-400 capitalize mb-4">
          {product.category}
        </p>
      </div>

      <div className="relative z-10 mt-2 pt-3 border-t border-slate-50 flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Precio</span>
          <span className="text-xl font-extrabold text-slate-800 tracking-tight">
            ${product.price?.toLocaleString("es-MX")}
          </span>
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            addItem(product);
          }}
          className="h-11 w-11 bg-slate-900 hover:bg-[#10B981] text-white flex items-center justify-center rounded-full shadow-sm transition-all duration-300 hover:shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          aria-label={`Agregar ${product.name} al carrito`}
        >
          <span className="text-md font-bold">+</span>
        </button>
      </div>

    </div>
  );
};

export default ProductCard;
