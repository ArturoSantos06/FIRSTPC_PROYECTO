const ProductDescription = ({ description = {} }) => {
  const sections = Array.isArray(description.sections) ? description.sections : Object.entries(description.sections || {}).map(([title, text]) => ({ title, text }));
  const paragraphs = Array.isArray(description.paragraphs)
    ? description.paragraphs
    : [description.content || description.text].filter(Boolean);
  return <section className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_15px_45px_rgba(15,23,42,0.03)] md:p-10"><div className="max-w-3xl"><p className="mb-2 text-xs font-black uppercase tracking-[.2em] text-emerald-500">Conoce cada detalle</p><h2 className="mb-6 text-2xl font-black tracking-tight text-slate-900 md:text-3xl">{description.title || 'Detalles del producto'}</h2>{description.intro && <p className="text-base font-medium leading-8 text-slate-600">{description.intro}</p>}{paragraphs.map((paragraph, index) => <p key={`paragraph-${index}`} className="mt-5 text-base font-medium leading-8 text-slate-600">{paragraph}</p>)}<div className="mt-8 space-y-7">{sections.map((section, index) => { const title = section.title || section.heading || Object.keys(section)[0]; const text = section.text || section.content || section.paragraph || section[title]; return <div key={`${title}-${index}`}><h3 className="mb-2 text-lg font-black text-slate-800">{title}</h3><p className="font-medium leading-8 text-slate-600">{text}</p></div>; })}</div></div></section>;
};

export default ProductDescription;
