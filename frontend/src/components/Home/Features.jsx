import React from 'react';
import { featuresData } from './DataFeatures.jsx';

const FeatureCard = ({ icon, title, description }) => (
  <div className="group relative overflow-hidden bg-white p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(100,116,139,0.03)] text-center flex flex-col items-center justify-start transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(16,185,129,0.06)] hover:border-[#10B981]/20">
    
    <div className="absolute -top-10 -right-10 h-24 w-24 bg-[#A7F3D0]/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 z-0" />
    
    <div className="relative z-10 mb-5 p-4 bg-slate-50 rounded-2xl text-slate-700 transition-all duration-300 group-hover:bg-[#A7F3D0]/20 group-hover:text-[#10B981] group-hover:scale-105">
      {icon}
    </div>
    
    <h3 className="relative z-10 text-lg font-black text-slate-800 tracking-tight mb-2 transition-colors duration-300 group-hover:text-[#10B981]">
      {title}
    </h3>
    
    <p className="relative z-10 text-sm font-medium text-[#64748B] leading-relaxed">
      {description}
    </p>
  </div>
);

const Features = () => {
  return (
    <section className="py-16 md:py-20 bg-transparent font-['Montserrat']">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-10">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {featuresData.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
        
      </div>
    </section>
  );
};

export default Features;