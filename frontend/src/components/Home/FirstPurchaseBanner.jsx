import React from 'react';

const FirstPurchaseBanner = () => {
  return (
    <section className="relative w-full max-w-7xl mx-auto px-6 md:px-10 py-12 font-['Montserrat'] overflow-hidden">

      <div className="relative overflow-hidden rounded-[32px] bg-white border border-slate-100 shadow-[0_15px_40px_rgba(100,116,139,0.04)] p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 group z-10">

        <div className="absolute top-0 left-0 w-40 h-40 bg-[#A7F3D0]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-[#10B981]/5 rounded-full blur-3xl pointer-events-none transform translate-x-20 translate-y-20 group-hover:scale-110 transition-transform duration-500" />

        <div className="relative z-10 text-center lg:text-left space-y-4 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-[#A7F3D0]/20 text-[#0ea472] px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase">
              Beneficio de Bienvenida
          </div>
          
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-tight">
            Tu próximo Setup <span className="text-[#10B981]">con Descuento</span>
          </h2>
          
          <p className="text-sm md:text-md font-medium text-[#64748B] leading-relaxed">
            ¿Es tu primera vez en FIRSTPC? Queremos que armes tu computadora con los mejores componentes. Regístrate hoy y recibe un <span className="font-bold text-slate-800">10% de descuento inmediato</span> aplicable en todo nuestro catálogo de hardware.
          </p>

          <p className="text-[11px] font-semibold text-slate-400">
            * Válido únicamente para nuevos usuarios en su primera orden de compra
          </p>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-w-[260px] bg-white border border-slate-50 p-6 rounded-[24px] shadow-[0_8px_20px_rgba(0,0,0,0.01)] text-center">
          
          <div className="text-5xl font-black text-slate-800 tracking-tighter mb-1">
            10%<span className="text-[#10B981] text-3xl font-black"> OFF</span>
          </div>
          <div className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-4">
            En tu Primera Compra
          </div>

          <button 
            className="w-full text-center bg-[#10B981] hover:bg-[#0ea472] text-white font-bold text-base px-8 py-4 rounded-full shadow-[0_10px_25px_rgba(16,185,129,0.25)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            Reclamar mi Descuento
          </button>
        </div>

      </div>

    </section>
  );
};

export default FirstPurchaseBanner;