import React from 'react';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

import cpuImg from '../../assets/cpu.png';
import gpuImg from '../../assets/gpu.png';
import caseImg from '../../assets/case.png';
import coolingImg from '../../assets/cooling.png';
import ramImg from '../../assets/ram.png';
import ssdImg from '../../assets/ssd.png';
import peripheralsImg from '../../assets/peripherals.png';
import audioImg from '../../assets/audio.png';
import motherboardImg from '../../assets/motherboard.png';
import psuImg from '../../assets/psu.png';
import monitorImg from '../../assets/monitor.png';
import computdoraImg from '../../assets/computadora.png';

const categories = [
  { name: 'Procesadores', path: '/componentes/procesadores', image: cpuImg },
  { name: 'Tarjetas de Video', path: '/componentes/tarjetas-video', image: gpuImg },
  { name: 'Tarjetas Madre', path: '/componentes/tarjetas-madre', image: motherboardImg },
  { name: 'Gabinetes', path: '/componentes/gabinetes', image: caseImg },
  { name: 'Enfriamiento', path: '/componentes/enfriamiento', image: coolingImg },
  { name: 'Memorias RAM', path: '/componentes/memorias-ram', image: ramImg },
  { name: 'Almacenamiento', path: '/componentes/almacenamiento', image: ssdImg },
  { name: 'Fuentes de Poder', path: '/componentes/fuentes-poder', image: psuImg },
  { name: 'Monitores', path: '/componentes/monitores', image: monitorImg },
  { name: 'Computadora', path: '/componentes/computadora', image: computdoraImg },
  { name: 'Teclados y Mouses', path: '/componentes/perifericos', image: peripheralsImg },
  { name: 'Audífonos Gaming', path: '/componentes/audio', image: audioImg },
];

const CategoryCard = ({ name, path, image }) => (
  <Link
    to={path}
    className="group relative overflow-hidden rounded-[28px] p-6 flex items-end justify-start bg-white border border-slate-100 shadow-[0_8px_24px_rgba(100,116,139,0.04)] transition-all duration-300 min-h-[200px] hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(16,185,129,0.08)] hover:border-[#10B981]/30 w-full"
  >
    <div className="absolute inset-y-0 right-4 w-1/2 h-full flex justify-end items-center pointer-events-none z-10">
      <img 
        src={image} 
        alt={name} 
        className="w-auto h-auto max-h-[80%] object-contain opacity-85 group-hover:opacity-100 group-hover:scale-105 group-hover:-rotate-2 transition-all duration-500 select-none filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.06)]"
      />
    </div>

    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50/50 group-hover:to-[#A7F3D0]/5 transition-all duration-500 z-0" />
    
    <div className="absolute -top-10 -right-10 h-28 w-28 bg-[#A7F3D0]/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 z-0" />
    
    <h3 className="relative z-20 text-xl font-black text-slate-800 tracking-tight leading-none transition-colors duration-300 group-hover:text-[#10B981]">
      {name}
    </h3>
  </Link>
);

const CategoryGrid = () => {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-white to-[#F8FAFC]/40 font-['Montserrat']">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-10">
        
        {/* Encabezado */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
            Explora por Categoría
          </h2>
          <p className="mt-3 text-sm md:text-base font-medium text-[#64748B]">
            Encuentra la pieza perfecta para tu próxima actualización o completa tu setup ideal con lo último en tecnología.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {categories.map((cat) => (
            <CategoryCard key={cat.name} {...cat} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default CategoryGrid;