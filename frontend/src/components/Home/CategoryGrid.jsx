import React from 'react';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

const categories = [
  { name: 'Procesadores', path: '/componentes/procesadores', className: 'lg:col-span-2' },
  { name: 'Tarjetas de Video', path: '/componentes/tarjetas-video', className: 'lg:col-span-1' },
  { name: 'Gabinetes', path: '/componentes/gabinetes', className: 'lg:col-span-1' },
  { name: 'Enfriamiento', path: '/componentes/enfriamiento', className: 'lg:col-span-2' },
];

const CategoryCard = ({ name, path, className }) => (
  <Link
    to={path}
    className={twMerge("group relative overflow-hidden rounded-[24px] p-8 flex items-end justify-start bg-slate-800 transition-all duration-300 min-h-[200px]", className)}
  >
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent transition-all duration-300 group-hover:from-black/50"></div>
    
    <div className="absolute top-0 right-0 h-24 w-24 bg-[#A7F3D0]/50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-500 -z-0"></div>
    
    <h3 className="relative z-10 text-2xl font-bold text-white transition-transform duration-300 group-hover:translate-y-[-4px]">
      {name}
    </h3>
  </Link>
);

const CategoryGrid = () => {
  return (
    <section className="py-20 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Explora por Categoría</h2>
          <p className="mt-3 text-lg text-[#64748B]">Encuentra la pieza perfecta para tu próxima actualización.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => <CategoryCard key={cat.name} {...cat} />)}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;