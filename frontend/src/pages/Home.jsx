import React, { useContext, useCallback } from 'react';
import { signOut } from "firebase/auth";
import { auth } from "/src/firebaseConfig.js"; 
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar'; 
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import CategoryGrid from '../components/home/CategoryGrid';

const Home = () => {
  const { user } = useContext(AuthContext);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  }, []);

  return (
    <main className="bg-[#F8FAFC] min-h-screen font-['Montserrat'] antialiased">
      <Navbar onSignOut={handleSignOut} user={user} />
      <Hero />
      <Features />
      <CategoryGrid />
    </main>
  );
};

export default Home;