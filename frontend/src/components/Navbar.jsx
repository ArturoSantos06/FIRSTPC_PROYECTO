import React, { useContext, useCallback } from 'react';
import logoStore from '../assets/logof.png';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from "firebase/auth";
import { auth } from "/src/firebaseConfig.js"; 
import { AuthContext } from '../context/AuthContext';
import UserProfileMenu from './UserProfileMenu';

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSignOut = useCallback(async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  }, [navigate]);

  const clientNavLinks = [
    { name: "Inicio", path: "/" },
    { name: "Componentes", path: "/componentes" },
    { name: "Armar PC", path: "/armar-pc" },
    { name: "Soporte", path: "/soporte" },
  ];

  const adminNavLinks = [
    { name: "Dashboard", path: "/admin" },
    { name: "Inventario", path: "/admin/inventario" },
    { name: "Garantías (RMA)", path: "/admin/rma" },
  ];

  const navLinks = user?.role === 'admin' ? adminNavLinks : clientNavLinks;

  return (
    <header className="fixed top-4 left-0 right-0 z-50 font-['Montserrat'] mx-auto max-w-[1200px] w-[calc(100%-2rem)] px-4">
      <div className="
        w-full
        bg-white/70 backdrop-blur-md 
        rounded-full shadow-[0_8px_32px_rgba(100,116,139,0.05)]
        border border-white/60
        px-6 md:px-8
      ">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          <div className="w-32 md:w-40 flex items-center justify-start flex-shrink-0">
            <Link to="/" title="FIRSTPC Home" className="block">
              <img 
                src={logoStore} 
                alt="FIRSTPC Logo" 
                className="h-10 md:h-12 w-auto object-contain max-w-full block" 
              />
            </Link>
          </div>

          <nav className="hidden md:flex">
            <ul className="flex items-center space-x-6 lg:space-x-8">
              {navLinks.map((link, index) => (
                <li key={index}>
                  <Link to={link.path} className="text-sm font-semibold text-slate-700 hover:text-[#10B981] transition-colors duration-200 whitespace-nowrap">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center space-x-4 md:space-x-6 flex-shrink-0">
            <button className="text-[#64748B] hover:text-[#10B981] transition-colors duration-200 p-1">
              <SearchIcon />
            </button>
            <button className="text-[#64748B] hover:text-[#10B981] transition-colors duration-200 p-1">
              <CartIcon />
            </button>

            {user ? (
              <UserProfileMenu user={user} onSignOut={handleSignOut} />
            ) : (
              <Link 
                to="/login" 
                className="hidden sm:inline-block bg-[#10B981] text-white font-bold text-sm px-6 py-2.5 rounded-full hover:bg-emerald-600 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-[0_4px_14px_rgba(16,185,129,0.25)] whitespace-nowrap"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;