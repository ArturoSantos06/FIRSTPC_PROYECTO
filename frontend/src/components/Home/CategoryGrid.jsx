import { Link } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { EditIcon as Pencil } from '../icons/AppIcons';

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
import { DEFAULT_CATEGORIES, subscribeToCategories } from '../../services/categoryService';

const localImages = { cpu: cpuImg, gpu: gpuImg, motherboard: motherboardImg, case: caseImg, cooling: coolingImg, ram: ramImg, ssd: ssdImg, psu: psuImg, monitor: monitorImg, computadora: computdoraImg, peripherals: peripheralsImg, audio: audioImg };

const CategoryCard = ({ name, slug, img }) => (
  <Link
    to={`/catalogo?categoria=${slug}`}
    className="group relative flex h-24 w-full cursor-pointer flex-row items-center overflow-hidden rounded-[26px] border border-slate-200/70 bg-white/80 p-2 shadow-[0_12px_35px_rgba(15,23,42,0.045)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:bg-white hover:shadow-[0_20px_45px_rgba(16,185,129,0.14)] sm:h-28 sm:p-4"
  >
    <span className="absolute inset-y-5 left-0 w-1 rounded-r-full bg-gradient-to-b from-emerald-400 to-cyan-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-white bg-gradient-to-br from-emerald-50 via-slate-50 to-cyan-50 p-2 shadow-inner sm:h-20 sm:w-20">
      <span className="absolute inset-2 rounded-xl bg-white/50 blur-md" />
      <img src={img} alt={name} className="relative z-10 h-full w-full object-contain drop-shadow-[0_8px_10px_rgba(15,23,42,0.12)] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-2" />
    </div>
    <h3 className="ml-2 line-clamp-2 flex-1 text-left text-xs font-black tracking-tight text-slate-800 transition-colors duration-300 group-hover:text-emerald-600 sm:ml-4 sm:text-base">{name}</h3>
  </Link>
);

const CategoryGrid = () => {
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  useEffect(() => {
    const unsubscribe = subscribeToCategories((items) => {
      if (items.length) setCategories(items);
    }, (error) => console.error('Error cargando categorías:', error));
    return unsubscribe;
  }, []);

  return (
    <section className="bg-gradient-to-b from-white to-[#F8FAFC]/40 py-12 font-['Montserrat'] md:py-14">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-10">
        
        {/* Encabezado */}
        <div className="relative mb-8 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
            Explora por Categoría
          </h2>
          <p className="mt-3 text-sm md:text-base font-medium text-[#64748B]">
            Encuentra la pieza perfecta para tu próxima actualización o completa tu setup ideal con lo último en tecnología.
          </p>
          {user?.role === 'admin' && <Link to="/admin/categorias" className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-xs font-black text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"><Pencil size={14} />Editar categorías</Link>}
        </div>

        <div className="grid grid-cols-2 gap-3 max-sm:[&>*:last-child:nth-child(odd)]:col-span-2 max-sm:[&>*:last-child:nth-child(odd)]:w-1/2 max-sm:[&>*:last-child:nth-child(odd)]:justify-self-center sm:gap-4 lg:grid-cols-4 lg:[&>*:last-child:nth-child(4n+1)]:col-start-2 lg:[&>*:last-child:nth-child(4n+1)]:translate-x-1/2">
          {categories.map((cat) => (
            <CategoryCard key={cat.id || cat.slug} {...cat} img={cat.imageUrl || localImages[cat.imageKey] || cpuImg} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default CategoryGrid;
