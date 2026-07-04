import React from "react";

const ProductCard = ({ product }) => {
  return (
    <div className="group relative overflow-hidden bg-white p-5 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(100,116,139,0.02)] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(16,185,129,0.05)] hover:border-[#10B981]/20">
      
      <div className="absolute -top-10 -right-10 h-24 w-24 bg-[#A7F3D0]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 z-0" />

      <div className="relative z-10">
        <div className="w-full aspect-square bg-slate-50 overflow-hidden rounded-[24px] mb-4 border border-slate-50">
          <img
            src={product.image || "https://via.placeholder.com/300?text=Hardware"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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

        <button className="h-11 w-11 bg-slate-900 hover:bg-[#10B981] text-white flex items-center justify-center rounded-full shadow-sm transition-all duration-300 hover:shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer">
          <span className="text-md font-bold">+</span>
        </button>
      </div>

    </div>
  );
};

export default ProductCard;