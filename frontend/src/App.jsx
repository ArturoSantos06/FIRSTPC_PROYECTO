import React, { useContext } from 'react';
import './index.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
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
          element={<Home />}
        />

        <Route element={<AdminRoutes />}>
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;