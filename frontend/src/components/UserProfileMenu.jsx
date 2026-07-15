import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  'Mis compras',
  'Mis favoritos',
  'Mis datos de envío',
  'Datos de pago y facturación',
  'Mis opiniones',
  'Mis PCs configuradas',
];

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return 'U';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const UserProfileMenu = ({ user, onSignOut }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const displayName = useMemo(() => {
    return user?.displayName || user?.email || 'Usuario';
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((currentOpen) => !currentOpen)}
        className="flex items-center gap-3 rounded-full border border-slate-200 bg-white/90 px-2 py-1.5 shadow-sm transition hover:border-[#10B981] hover:shadow-md"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <span className="sr-only">Abrir menú de perfil</span>
        <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-2 ring-white">
          {user?.photoURL ? (
            <img src={user.photoURL} alt={displayName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <span className="text-sm font-bold text-slate-600">{getInitials(displayName)}</span>
          )}
        </span>
        <span className="hidden lg:block text-left leading-tight">
          <span className="block text-sm font-semibold text-slate-800">{displayName}</span>
          <span className="block text-xs text-slate-500">Mi cuenta</span>
        </span>
      </button>

      {isOpen ? (
        <div className="absolute right-0 mt-3 w-[min(92vw,19rem)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-sm font-semibold text-slate-800">{displayName}</p>
            <p className="mt-1 text-xs text-slate-500">Gestiona tu perfil y tus preferencias</p>
          </div>

          <div className="py-2">
            {menuItems.map((item) => (
              <button
                key={item}
                type="button"
                className="flex w-full items-center justify-between px-5 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
                onClick={() => {
                  setIsOpen(false);
                  if (item === 'Mis compras') navigate('/perfil/compras');
                  if (item === 'Mis favoritos') navigate('/perfil/favoritos');
                  if (item === 'Mis datos de envío') navigate('/perfil/envio');
                  if (item === 'Datos de pago y facturación') navigate('/perfil/facturacion');
                }}
              >
                <span>{item}</span>
                <span className="text-slate-300">›</span>
              </button>
            ))}
          </div>

          <div className="border-t border-slate-100 px-3 py-3">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onSignOut();
              }}
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default UserProfileMenu;
