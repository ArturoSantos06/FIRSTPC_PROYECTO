import React from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "/src/firebaseConfig.js";
import logoStore from "/src/assets/logof.png"; 
import googleIcon from "/src/assets/google-icon.svg"; 

const Login = () => {
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] p-6 antialiased font-['Montserrat']">
      <div className="w-full max-w-[440px] bg-white p-10 rounded-[32px] shadow-[0_10px_40px_rgba(100,116,139,0.06)] border border-slate-100 flex flex-col items-center">
        
        <div className="mb-6 p-4 bg-[#A7F3D0]/20 rounded-full">
          <img src={logoStore} alt="FIRSTPC Logo" className="w-20 h-20 object-contain" />
        </div>

        <div className="text-center space-y-3 mb-8 w-full">
          <span className="text-xs font-bold tracking-[0.25em] text-[#10B981] block uppercase">
            FIRSTPC STORE
          </span>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">
            Tu Cuenta Comienza Aquí
          </h1>
          <p className="text-sm font-medium text-[#64748B] mx-auto max-w-[300px]">
            Accede a tu hardware ideal a un clic de distancia de forma rápida y segura.
          </p>
        </div>

        <div className="w-full mb-8">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center bg-[#10B981] hover:bg-[#0ea472] text-white font-bold text-base py-4 px-6 rounded-full shadow-[0_4px_14px_rgba(16,185,129,0.25)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-[#A7F3D0] group"
          >
            <div className="bg-white w-9 h-9 rounded-full mr-4 flex items-center justify-center shadow-sm flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
              <img 
                src={googleIcon} 
                alt="Google" 
                className="w-5 h-5 object-contain flex-shrink-0" 
              />
            </div>
            <span className="tracking-wide">Continuar con Google</span>
          </button>
        </div>

        <div className="w-full text-center border-t border-slate-100 pt-6">
          <p className="text-xs text-[#64748B] font-medium">
            Al acceder, aceptas nuestros{" "}
            <a href="#" className="text-[#10B981] hover:underline font-bold">
              Términos de servicio
            </a>
          </p>
        </div>

      </div>
    </main>
  );
};

export default Login;