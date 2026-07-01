import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-100 font-['Montserrat'] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-slate-200/60">
          
          <div className="flex flex-col space-y-3">
            <h4 className="text-sm font-black text-slate-800 tracking-wider uppercase">Conócenos</h4>
            <Link to="/quienes-somos" className="text-sm font-medium text-slate-500 hover:text-[#10B981] transition-colors">Quiénes somos</Link>
            <Link to="/formas-pago" className="text-sm font-medium text-slate-500 hover:text-[#10B981] transition-colors">Formas de pago</Link>
            <Link to="/formas-envio" className="text-sm font-medium text-slate-500 hover:text-[#10B981] transition-colors">Formas de envío</Link>
          </div>

          <div className="flex flex-col space-y-3">
            <h4 className="text-sm font-black text-slate-800 tracking-wider uppercase">Accesos Rápidos</h4>
            <Link to="/pedidos" className="text-sm font-medium text-slate-500 hover:text-[#10B981] transition-colors">Historial de pedidos</Link>
            <Link to="/garantias" className="text-sm font-medium text-slate-500 hover:text-[#10B981] transition-colors">Garantías y devoluciones</Link>
            <Link to="/marcas" className="text-sm font-medium text-slate-500 hover:text-[#10B981] transition-colors">Todas las marcas</Link>
          </div>

          <div className="flex flex-col space-y-3">
            <h4 className="text-sm font-black text-slate-800 tracking-wider uppercase">¿Necesitas ayuda?</h4>
            <Link to="/como-comprar" className="text-sm font-medium text-slate-500 hover:text-[#10B981] transition-colors">¿Cómo comprar?</Link>
            <Link to="/guias" className="text-sm font-medium text-slate-500 hover:text-[#10B981] transition-colors">Guías de compra</Link>
            <Link to="/faq" className="text-sm font-medium text-slate-500 hover:text-[#10B981] transition-colors">Preguntas frecuentes</Link>
            <Link to="/soporte" className="text-sm font-medium text-slate-500 hover:text-[#10B981] transition-colors">Centro de información</Link>
          </div>

          <div className="flex flex-col space-y-3">
            <h4 className="text-sm font-black text-slate-800 tracking-wider uppercase">Contacto</h4>
            <p className="text-sm font-bold text-slate-700">Campeche: <span className="font-medium text-slate-500">981 185 2169</span></p>
            <p className="text-xs font-semibold text-slate-400 pt-1">L-V 9:00AM - 6:00PM</p>
            <a href="mailto:contacto.firstpc@gmail.com" className="text-sm font-semibold text-[#10B981] hover:underline pt-1">contacto.firstpc@gmail.com</a>
          </div>

        </div>

        <div className="py-10 flex flex-col lg:flex-row items-center justify-between gap-8 border-b border-slate-200/60">
          
          <div className="flex flex-col items-center lg:items-start space-y-3">
            <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">Pagos 100% Seguros</span>
            <div className="flex flex-wrap items-center justify-center gap-4 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-[0_4px_15px_rgba(0,0,0,0.01)]">
              <span className="text-sm font-black italic tracking-tight text-blue-800 select-none">VISA</span>
              <div className="h-4 w-[1px] bg-slate-200" />
              <span className="text-sm font-black italic text-red-500 select-none">mastercard</span>
              <div className="h-4 w-[1px] bg-slate-200" />
              <span className="text-sm font-black italic text-blue-600 select-none">Pay<span className="text-cyan-500">Pal</span></span>
              <div className="h-4 w-[1px] bg-slate-200" />
              <div className="flex items-center space-x-1">
                <span className="bg-red-600 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-md tracking-tighter">OXXO</span>
                <span className="text-[10px] font-black text-slate-700 tracking-tighter">PAY</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center lg:items-end space-y-3">
            <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">Logística de Envío</span>
            <div className="flex items-center justify-center gap-5 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-[0_4px_15px_rgba(0,0,0,0.01)]">
              <span className="text-sm font-black italic text-red-600 tracking-tighter select-none">estafeta</span>
              <div className="h-4 w-[1px] bg-slate-200" />
              <div className="flex items-baseline font-black text-amber-500 tracking-tighter select-none">
                <span className="text-lg leading-none font-black italic text-slate-800">DHL</span>
                <span className="text-[9px] ml-0.5 font-bold uppercase tracking-normal text-amber-500">Express</span>
              </div>
            </div>
          </div>

        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-400">
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/terminos" className="hover:text-slate-600 transition-colors">Términos y condiciones de uso</Link>
            <span className="text-slate-200">|</span>
            <Link to="/privacidad" className="hover:text-slate-600 transition-colors">Aviso de privacidad</Link>
          </div>
          
          <p className="text-center md:text-right">
            Hecho con <span className="text-red-500">❤️</span> en México • © {new Date().getFullYear()} FIRSTPC.mx
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;