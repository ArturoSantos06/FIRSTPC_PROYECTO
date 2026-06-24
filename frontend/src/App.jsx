import React, { useContext } from 'react';
import './index.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login/Login';
import { AuthContext } from './context/AuthContext';


function App() {
  const { user, loading } = useContext(AuthContext);

  // Mostramos un mensaje de carga mientras Firebase comprueba la sesión
  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/"
          element={user ? <Home /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;