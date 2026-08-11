import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const RecommendationBanner = () => (
  <section className="relative mx-auto w-full max-w-7xl overflow-hidden px-6 py-6 font-['Montserrat'] md:px-10">
    <div className="group relative overflow-hidden rounded-[32px] border border-[#A7F3D0]/40 bg-white px-7 py-8 shadow-[0_15px_40px_rgba(100,116,139,0.06)] md:px-12 md:py-10">
      <div className="relative z-10 flex flex-col items-start justify-between gap-7 lg:flex-row lg:items-center">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#A7F3D0]/30 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-[#0ea472]">
            <Sparkles size={15} strokeWidth={2.5} /> Asistente inteligente
          </div>
          <h2 className="text-2xl font-black leading-tight tracking-tight text-slate-800 md:text-4xl">
            Encuentra tu equipo ideal <span className="text-[#10B981]">en segundos</span>
          </h2>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-[#64748B] md:text-base">
            Cuéntanos si buscas una laptop o una PC, para qué la necesitas y cuánto quieres invertir. Te mostraremos recomendaciones del catálogo FIRSTPC.
          </p>
        </div>
        <Link to="/recomendador" className="inline-flex shrink-0 self-center items-center gap-2 rounded-full bg-[#10B981] px-6 py-3.5 text-sm font-black text-white shadow-[0_10px_25px_rgba(16,185,129,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0ea472] lg:self-auto">
          ¿Qué equipo necesito? <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  </section>
);

export default RecommendationBanner;
