import React from 'react';

const HardwareRender = () => {
  return (
    <div className="relative w-full h-[500px] flex items-center justify-center group font-['Montserrat']">
      <div className="absolute w-80 h-80 bg-[#A7F3D0]/30 rounded-full blur-[100px] animate-pulse" />

      {/* LA PLACA BASE DE CRISTAL */}
      <div 
        className="relative w-80 h-[390px] bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/90 shadow-[0_20px_50px_rgba(100,116,139,0.05)] p-6 flex flex-col justify-between transform rotate-[-4deg] group-hover:rotate-0 group-hover:scale-[1.02] transition-all duration-500"
        style={{ animation: 'floating 5s infinite ease-in-out' }}
      >
        
        {/* Pistas del circuito impreso */}
        <div className="absolute top-1/3 left-6 w-20 h-[2px] bg-gradient-to-r from-[#10B981]/40 to-transparent" />
        <div className="absolute top-1/2 left-6 w-16 h-[2px] bg-gradient-to-r from-[#10B981]/40 to-transparent" />
        <div className="absolute bottom-1/4 left-10 w-24 h-[2px] bg-gradient-to-r from-[#10B981]/30 to-transparent" />

        {/* SECCIÓN SUPERIOR: Disipadores VRM y Temperatura */}
        <div className="flex justify-between items-start w-full relative z-10">
          <div className="flex space-x-1 bg-slate-100 p-1.5 rounded-lg border border-slate-200/40">
            <div className="w-3 h-5 bg-[#64748B]/10 rounded-sm" />
            <div className="w-3 h-5 bg-[#64748B]/10 rounded-sm" />
            <div className="w-3 h-5 bg-[#64748B]/10 rounded-sm" />
          </div>
          
          <div className="bg-slate-900 text-[#10B981] font-mono text-xs px-2.5 py-1 rounded-md shadow-inner tracking-widest border border-slate-800">
            32°C
          </div>
        </div>

        {/* SECCIÓN CENTRAL: CPU SOCKET + MODULOS RAM */}
        <div className="flex items-center justify-between w-full my-4 relative z-10">
          
          {/* Bloque de Enfriamiento Líquido (Socket CPU) */}
          <div className="w-36 h-36 rounded-2xl bg-gradient-to-br from-white to-[#F8FAFC] border border-slate-100 shadow-[0_8px_20px_rgba(100,116,139,0.04)] flex items-center justify-center relative group-hover:border-[#A7F3D0] transition-colors p-3">
            <div className="absolute inset-0 bg-[#A7F3D0]/10 rounded-2xl blur-sm animate-pulse" />
            
            <div className="w-full h-full rounded-full border-2 border-dashed border-[#10B981]/30 flex items-center justify-center relative bg-white">
              <div className="absolute w-20 h-20 rounded-full border border-dotted border-[#10B981] animate-spin" style={{ animationDuration: '15s' }} />
              
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#10B981] to-[#A7F3D0] flex items-center justify-center text-white shadow-[0_0_15px_rgba(16,185,129,0.35)] font-bold text-xs">
                CPU
              </div>
            </div>
          </div>

          {/* Slots de Memoria RAM */}
          <div className="flex space-x-1.5 bg-slate-50/80 p-2 rounded-xl border border-slate-200/40 h-36 items-center">
            <div className="w-2.5 h-32 bg-white rounded-sm border border-slate-200 shadow-sm flex flex-col justify-between items-center py-1">
              <div className="w-1 h-3 bg-[#10B981] rounded-full shadow-[0_0_6px_#10B981]" />
              <div className="w-1 h-12 bg-gradient-to-b from-[#10B981] to-[#A7F3D0] rounded-full" />
              <div className="w-1 h-3 bg-[#10B981] rounded-full shadow-[0_0_6px_#10B981]" />
            </div>
            <div className="w-2.5 h-32 bg-white rounded-sm border border-slate-200 shadow-sm flex flex-col justify-between items-center py-1">
              <div className="w-1 h-3 bg-[#10B981] rounded-full shadow-[0_0_6px_#10B981]" />
              <div className="w-1 h-12 bg-gradient-to-b from-[#10B981] to-[#A7F3D0] rounded-full" />
              <div className="w-1 h-3 bg-[#10B981] rounded-full shadow-[0_0_6px_#10B981]" />
            </div>
            <div className="w-2.5 h-32 bg-slate-200/50 rounded-sm border border-slate-300/30" />
            <div className="w-2.5 h-32 bg-slate-200/50 rounded-sm border border-slate-300/30" />
          </div>

        </div>

        {/* SECCIÓN INFERIOR: Puerto PCIe */}
        <div className="w-full relative z-10">
          <div className="w-full h-7 bg-gradient-to-r from-slate-100 to-slate-50 rounded-xl border border-slate-200/60 flex items-center px-3 justify-between shadow-sm">
            <span className="text-[8px] font-black tracking-[0.2em] text-[#64748B] uppercase">
              PCIEX16_GEN 5
            </span>
            <div className="flex space-x-1">
              <span className="w-1 h-1 rounded-full bg-[#10B981]" />
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="w-1 h-1 rounded-full bg-slate-300" />
            </div>
          </div>
        </div>

      </div>

      {/* Placa de respaldo trasera para profundidad 3D */}
      <div className="absolute w-[240px] h-[330px] bg-white/20 backdrop-blur-md rounded-[32px] border border-white/40 shadow-sm rotate-[6deg] translate-x-24 -z-10 opacity-70 group-hover:rotate-[2deg] group-hover:translate-x-28 transition-all duration-500" />

      {/* Movimiento flotante continuo */}
      <style>{`
        @keyframes floating {
          0%, 100% { transform: translateY(0) rotate(-4deg); }
          50% { transform: translateY(-12px) rotate(-2deg); }
        }
      `}</style>
    </div>
  );
};

export default HardwareRender;