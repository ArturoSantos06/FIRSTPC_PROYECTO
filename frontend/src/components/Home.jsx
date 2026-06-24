import React, { useContext } from 'react';
import { signOut } from "firebase/auth";
import { auth } from "/src/firebaseConfig.js"; 
import { AuthContext } from '../context/AuthContext';

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
    <div>
      <h1>¡Bienvenido, {user?.displayName}!</h1>
      <p>Email: {user?.email}</p>
      <br />
      <button onClick={handleSignOut}>Cerrar Sesión</button>
    </div>
  );
};

export default Home;