import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Heart, LogIn } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useFavorites } from '../hooks/useFavorites';

const FavoriteButton = ({ productId, className = '', size = 20 }) => {
  const { user } = useContext(AuthContext);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [promptPosition, setPromptPosition] = useState({ top: 0, left: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const buttonRef = useRef(null);
  const promptRef = useRef(null);
  const active = isFavorite(productId);

  useEffect(() => {
    if (!showLoginPrompt) return undefined;

    const closeOnScroll = () => setShowLoginPrompt(false);
    const closeOnOutsideClick = (event) => {
      if (!promptRef.current?.contains(event.target) && !buttonRef.current?.contains(event.target)) {
        setShowLoginPrompt(false);
      }
    };

    window.addEventListener('scroll', closeOnScroll, true);
    window.addEventListener('resize', closeOnScroll);
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => {
      window.removeEventListener('scroll', closeOnScroll, true);
      window.removeEventListener('resize', closeOnScroll);
      document.removeEventListener('pointerdown', closeOnOutsideClick);
    };
  }, [showLoginPrompt]);

  const handleClick = async (event) => {
    event.stopPropagation();
    if (!user) {
      const bounds = buttonRef.current?.getBoundingClientRect();
      if (bounds) {
        setPromptPosition({
          top: bounds.bottom + 8,
          left: Math.max(16, Math.min(bounds.right - 224, window.innerWidth - 240)),
        });
      }
      setShowLoginPrompt(true);
      return;
    }
    setIsSaving(true);
    try { await toggleFavorite(productId); } finally { setIsSaving(false); }
  };

  return (
    <span className="relative inline-flex">
      <button ref={buttonRef} type="button" onClick={handleClick} disabled={isSaving} aria-pressed={active} aria-label={active ? 'Quitar de favoritos' : 'Agregar a favoritos'} className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-100 bg-white/95 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:border-rose-200 hover:text-rose-500 active:scale-90 disabled:cursor-wait disabled:opacity-70 ${active ? 'text-rose-500' : 'text-slate-400'} ${className}`}>
        <Heart size={size} fill={active ? 'currentColor' : 'none'} strokeWidth={2.2} className={active ? 'animate-[favorite-pop_280ms_ease-out]' : ''} />
      </button>
      {showLoginPrompt && !user && createPortal(
        <span ref={promptRef} role="dialog" onClick={(event) => event.stopPropagation()} onMouseDown={(event) => event.stopPropagation()} style={{ top: promptPosition.top, left: promptPosition.left }} className="fixed z-[9999] w-56 rounded-2xl border border-slate-100 bg-white p-3 text-left text-xs font-semibold text-slate-600 shadow-[0_16px_40px_rgba(15,23,42,0.16)]">
          <span className="block">Inicia sesión para guardar tus favoritos.</span>
          <button type="button" onClick={() => { setShowLoginPrompt(false); window.dispatchEvent(new Event('open-login-modal')); }} className="mt-2 inline-flex items-center gap-1 font-black text-emerald-600 hover:text-emerald-700"><LogIn size={14} /> Iniciar sesión</button>
          <button type="button" onClick={() => setShowLoginPrompt(false)} className="ml-3 text-slate-400 hover:text-slate-600">Cerrar</button>
        </span>, document.body
      )}
    </span>
  );
};

export default FavoriteButton;
