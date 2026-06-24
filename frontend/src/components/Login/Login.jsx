import React from 'react';
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "/src/firebaseConfig.js";

const Login = () => {

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log("Usuario autenticado:", user);
    } catch (error) {
      console.error("Error durante el inicio de sesión con Google:", error);
    }
  };

  return (
    <div>
      <h1>Iniciar Sesión</h1>
      <p>Usa tu cuenta de Google para continuar.</p>
      <button onClick={handleGoogleSignIn}>
        Iniciar sesión con Google
      </button>
    </div>
  );
};

export default Login;
