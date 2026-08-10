import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../firebaseConfig';
import logoStore from '../assets/logof.png';
import googleIcon from '../assets/google-icon.svg';

const LoginModal = ({ isOpen, onClose, redirectTo }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      const destination = redirectTo || (location.pathname === '/login' ? location.state?.from : null);
      if (destination) navigate(destination, { replace: true });
      else onClose();
    } catch (signInError) {
      console.error('Error iniciando sesión:', signInError);
      setError('No pudimos iniciar sesión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/20 p-4 font-['Montserrat'] backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div role="dialog" aria-modal="true" aria-labelledby="login-modal-title" className="relative w-full max-w-[440px] rounded-[32px] border border-white/80 bg-white p-8 shadow-[0_25px_80px_rgba(15,23,42,0.2)] md:p-10">
      <button type="button" onClick={onClose} aria-label="Regresar" className="mb-5 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600"><ArrowLeft size={18} /></button>
      <div className="mb-6 flex justify-center"><div className="rounded-full bg-[#A7F3D0]/20 p-4"><img src={logoStore} alt="FIRSTPC Logo" className="h-20 w-20 object-contain" /></div></div>
      <div className="mb-8 space-y-3 text-center"><span className="block text-xs font-bold uppercase tracking-[0.25em] text-[#10B981]">FIRSTPC STORE</span><h2 id="login-modal-title" className="text-3xl font-black leading-tight tracking-tight text-slate-800">Tu Cuenta Comienza Aquí</h2><p className="mx-auto max-w-[300px] text-sm font-medium text-[#64748B]">Accede a tu hardware ideal a un clic de distancia de forma rápida y segura.</p></div>
      <button type="button" onClick={handleGoogleSignIn} disabled={loading} className="group flex w-full items-center justify-center rounded-full bg-[#10B981] px-6 py-4 text-base font-bold text-white shadow-[0_4px_14px_rgba(16,185,129,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0ea472] disabled:cursor-wait disabled:opacity-60"><span className="mr-4 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-300 group-hover:scale-105"><img src={googleIcon} alt="Google" className="h-5 w-5 object-contain" /></span><span className="tracking-wide">{loading ? 'Iniciando sesión...' : 'Continuar con Google'}</span></button>
      {error && <p role="alert" className="mt-4 text-center text-xs font-bold text-rose-500">{error}</p>}
      <div className="mt-8 w-full border-t border-slate-100 pt-6 text-center"><p className="text-xs font-medium text-[#64748B]">Al acceder, aceptas nuestros <Link to="/terminos" onClick={onClose} className="font-bold text-[#10B981] hover:underline">Términos y condiciones</Link></p></div>
    </div>
  </div>;
};

export default LoginModal;
