import { Link } from 'react-router-dom';
import HardwareRender from './HardwareRender';

const Hero = () => {
  return (
    <section className="relative mx-auto w-full max-w-7xl overflow-hidden px-4 pb-16 pt-32 font-['Montserrat'] sm:px-6 sm:pb-16 md:px-10 md:pt-32">
      
      <div className="relative z-10 grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        
        <div className="max-w-xl space-y-7 text-center sm:text-left">
          <h1 className="text-3xl font-black leading-[1.12] tracking-tight text-slate-800 sm:text-5xl md:text-6xl">
            El Corazón de tu Setup <br />
            <span className="text-[#10B981]">Empieza Aquí.</span>
          </h1>
          <p className="text-md md:text-lg font-medium text-[#64748B] leading-relaxed">
            Componentes de alto rendimiento, ensamblaje profesional y la garantía que necesitas para llevar tu experiencia de juego al siguiente nivel.
          </p>
          <div className="flex flex-col items-center gap-4 pt-3 sm:flex-row sm:flex-wrap sm:gap-4">
            <Link to="/catalogo" className="w-full max-w-xs cursor-pointer rounded-full bg-[#10B981] px-6 py-3.5 text-center text-sm font-bold text-white shadow-[0_10px_25px_rgba(16,185,129,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0ea472] active:translate-y-0 sm:w-auto sm:max-w-none sm:px-8 sm:py-4 sm:text-base">
              Explorar Componentes
            </Link>
            <Link to="/armar-pc" className="w-full max-w-xs cursor-pointer rounded-full border border-slate-200/80 bg-white px-6 py-3.5 text-center text-sm font-bold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 active:translate-y-0 sm:w-auto sm:max-w-none sm:px-8 sm:py-4 sm:text-base">
              Arma tu PC
            </Link>
          </div>
        </div>

        <div className="hidden sm:block">
          <HardwareRender />
        </div>

      </div>
    </section>
  );
};

export default Hero;
