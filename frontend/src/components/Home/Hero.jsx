import React from 'react';
import { Link } from 'react-router-dom';
import HardwareRender from './HardwareRender';

const Hero = () => {
  return (
    <section className="relative w-full max-w-7xl mx-auto px-6 md:px-10 pt-32 pb-16 font-['Montserrat'] overflow-hidden">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        
        <div className="text-left space-y-6 max-w-xl">
          <h1 className="text-5xl md:text-6xl font-black text-slate-800 tracking-tight leading-[1.1]">
            El Corazón de tu Setup <br />
            <span className="text-[#10B981]">Empieza Aquí.</span>
          </h1>
          <p className="text-md md:text-lg font-medium text-[#64748B] leading-relaxed">
            Componentes de alto rendimiento, ensamblaje profesional y la garantía que necesitas para llevar tu experiencia de juego al siguiente nivel.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link to="/catalogo" className="bg-[#10B981] hover:bg-[#0ea472] text-white font-bold text-base px-8 py-4 rounded-full shadow-[0_10px_25px_rgba(16,185,129,0.25)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer">
              Explorar Componentes
            </Link>
            <button className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-base px-8 py-4 rounded-full border border-slate-200/80 shadow-sm transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer">
              Arma tu PC
            </button>
          </div>
        </div>

        <HardwareRender />

      </div>
    </section>
  );
};

export default Hero;
