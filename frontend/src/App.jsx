import React, { useContext } from 'react';
import './index.css'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login/Login';
import { AuthContext } from './context/AuthContext';
import AdminRoutes from './components/AdminRoutes'; 


function App() {
  const { user, loading } = useContext(AuthContext);

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

        <Route element={<AdminRoutes />}>

        </Route>

        <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;