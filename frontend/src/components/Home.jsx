import React, { useContext } from 'react';
import { signOut } from "firebase/auth";
import { auth } from "/src/firebaseConfig.js"; 
import { AuthContext } from '../context/AuthContext';
import Navbar from './Navbar'; 

const Home = () => {
  const { user } = useContext(AuthContext);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log("Sesión cerrada exitosamente");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <main className="bg-[#F8FAFC] min-h-screen font-['Montserrat'] antialiased">
      <Navbar onSignOut={handleSignOut} user={user} />

      <div className="pt-32 px-4 md:px-10 max-w-7xl mx-auto text-center flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">
          ¡Bienvenido, {user?.displayName || "Usuario"}!
        </h1>
        <p className="mt-3 text-lg font-medium text-[#64748B]">
          Email: {user?.email}
        </p>
        
      </div>
    </main>
  );
};

export default Home;