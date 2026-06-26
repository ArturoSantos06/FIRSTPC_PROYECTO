import React from 'react';
import { featuresData } from './DataFeatures.jsx';

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-[#F8FAFC] p-8 rounded-[24px] border border-slate-200/80 text-center flex flex-col items-center">
    <div className="mb-5">{icon}</div>
    <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-sm text-[#64748B] leading-relaxed">{description}</p>
  </div>
);

const Features = () => {
  return (
    <section className="bg-white py-20 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuresData.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;