import { useContext, useCallback, useEffect, useRef, useState } from 'react';
import logoStore from '../assets/logof.png';
import { Link, useLocation } from 'react-router-dom';
import { signOut } from "firebase/auth";
import { auth } from "/src/firebaseConfig.js"; 
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartDrawer from './Cart/CartDrawer';
import UserProfileMenu from './UserProfileMenu';
import NavbarSearch from './NavbarSearch';
import LoginModal from './LoginModal';
import { CartIcon } from './icons/AppIcons';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const { totalItems } = useCart();
  const location = useLocation();
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginRedirectTo, setLoginRedirectTo] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);

  useEffect(() => {
    const openLoginModal = (event) => {
      setLoginRedirectTo(event.detail?.redirectTo || '');
      setIsLoginModalOpen(true);
    };
    window.addEventListener('open-login-modal', openLoginModal);
    return () => window.removeEventListener('open-login-modal', openLoginModal);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!mobileMenuRef.current?.contains(event.target) && !mobileMenuButtonRef.current?.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, [isMobileMenuOpen]);
  const [searchCloseSignal, setSearchCloseSignal] = useState(0);
  const closeSearch = () => setSearchCloseSignal((signal) => signal + 1);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut(auth);
      window.location.replace('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  }, []);

  const clientNavLinks = [
    { name: "Inicio", path: "/" },
    { name: "Componentes", path: "/componentes" },
    { name: "Armar PC", path: "/armar-pc" },
    { name: "Soporte", path: "/soporte" },
  ];

  const adminNavLinks = [
    { name: "Inicio", path: "/" },
    { name: "Catálogo", path: "/admin" },
    { name: "Inventario", path: "/admin/inventario" },
    { name: "Compras", path: "/admin/compras" },
    { name: "Armar PC", path: "/armar-pc" },
    { name: "Soporte", path: "/soporte" },
  ];

  const navLinks = user?.role === 'admin' ? adminNavLinks : clientNavLinks;
  const activeLink = [...navLinks]
    .sort((left, right) => right.path.length - left.path.length)
    .find((link) => location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(`${link.path}/`)))?.path;

  return (
    <header className="fixed left-0 right-0 top-3 z-50 mx-auto w-[calc(100%-1rem)] max-w-[1200px] px-0 font-['Montserrat'] sm:top-4 sm:w-[calc(100%-2rem)] sm:px-2">
      <div className="
        w-full
        bg-white/70 backdrop-blur-md 
        rounded-full shadow-[0_8px_32px_rgba(100,116,139,0.05)]
        border border-white/60
        px-3 sm:px-6 md:px-8
      ">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          <div className="flex w-24 shrink-0 items-center justify-start sm:w-32 md:w-40">
            <Link to="/" title="FIRSTPC Home" onClick={() => { closeSearch(); closeMobileMenu(); }} className="block">
              <img 
                src={logoStore} 
                alt="FIRSTPC Logo" 
                className="block h-9 w-auto max-w-full object-contain sm:h-10 md:h-12"
              />
            </Link>
          </div>

          <nav className="hidden md:flex">
            <ul className="flex items-center space-x-6 lg:space-x-8">
              {navLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    onClick={() => { closeSearch(); closeMobileMenu(); }}
                    aria-current={activeLink === link.path ? 'page' : undefined}
                    className={`whitespace-nowrap text-sm font-semibold transition-colors duration-200 ${activeLink === link.path ? 'text-[#10B981]' : 'text-slate-700 hover:text-[#10B981]'}`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center space-x-2 sm:space-x-4 md:space-x-6">
            <NavbarSearch isAdmin={user?.role === 'admin'} closeSignal={searchCloseSignal} />
            <button
              type="button"
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative p-1 text-[#64748B] transition-colors duration-200 hover:text-[#10B981]"
              aria-label="Abrir carrito"
            >
              <CartIcon />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-[#10B981] px-1.5 py-0.5 text-[10px] font-black leading-none text-white shadow-[0_8px_20px_rgba(16,185,129,0.3)]">
                  {totalItems}
                </span>
              )}
            </button>

            {user ? (
              <UserProfileMenu user={user} onSignOut={handleSignOut} />
            ) : (
              <button type="button" onClick={() => setIsLoginModalOpen(true)} className="hidden sm:inline-block bg-[#10B981] text-white font-bold text-sm px-6 py-2.5 rounded-full hover:bg-emerald-600 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-[0_4px_14px_rgba(16,185,129,0.25)] whitespace-nowrap">
                Iniciar Sesión
              </button>
            )}
            <button ref={mobileMenuButtonRef} type="button" onClick={() => setIsMobileMenuOpen((open) => !open)} className="inline-flex rounded-full p-2 text-slate-600 hover:bg-slate-100 hover:text-emerald-600 md:hidden" aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={isMobileMenuOpen}>
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </div>

      {isMobileMenuOpen && <nav ref={mobileMenuRef} className="mt-2 rounded-3xl border border-slate-200/70 bg-white/95 p-3 shadow-xl backdrop-blur-md md:hidden">
        <ul className="grid gap-1">
          {navLinks.map((link) => <li key={link.path}><Link to={link.path} onClick={() => { closeSearch(); closeMobileMenu(); }} aria-current={activeLink === link.path ? 'page' : undefined} className={`block rounded-2xl px-4 py-3 text-sm font-bold ${activeLink === link.path ? 'bg-emerald-50 text-emerald-600' : 'text-slate-700 hover:bg-slate-50'}`}>{link.name}</Link></li>)}
          {!user && <li><button type="button" onClick={() => { setIsLoginModalOpen(true); closeMobileMenu(); }} className="mt-1 w-full rounded-2xl bg-emerald-500 px-4 py-3 text-left text-sm font-bold text-white">Iniciar sesión</button></li>}
        </ul>
      </nav>}

      <CartDrawer isOpen={isCartDrawerOpen} onClose={() => setIsCartDrawerOpen(false)} />
      <LoginModal isOpen={isLoginModalOpen} redirectTo={loginRedirectTo} onClose={() => { setIsLoginModalOpen(false); setLoginRedirectTo(''); }} />
    </header>
  );
};

export default Navbar;
