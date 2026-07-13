import { useContext } from 'react';
import './index.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import CheckoutAddress from './pages/CheckoutAddress';
import CheckoutShippingPayment from './pages/CheckoutShippingPayment';
import CheckoutConfirmOrder from './pages/CheckoutConfirmOrder';
import UserProfile from './pages/UserProfile';
import ProductCatalog from "./components/Products/ProductCatalog";
import CheckoutCart from "./pages/CheckoutCart";
import Navbar from "./components/Navbar";
import { AuthContext } from './context/AuthContext';
import AdminRoutes from './components/AdminRoutes'; 

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-['Montserrat'] bg-[#F8FAFC]">
        <div className="text-slate-500 font-bold animate-pulse">Cargando FIRSTPC...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" /> : <Login />}
        />

        <Route path="/" element={<Home />} />
        
        <Route 
          path="/componentes" 
          element={
            <div className="min-h-screen bg-[#F8FAFC]/50 pt-28">
              <Navbar />
              <ProductCatalog />
            </div>
          } 
        />

        <Route
          path="/carrito"
          element={
            <div className="min-h-screen bg-[#F8FAFC]/50 pt-28 px-4 pb-10 md:px-6 lg:px-10">
              <Navbar />
              <div className="mx-auto w-full max-w-7xl">
                <CheckoutCart />
              </div>
            </div>
          }
        />

        <Route
          path="/checkout/direccion"
          element={
            user ? (
              <div className="min-h-screen bg-[#F8FAFC]/50 pt-28 px-4 pb-10 md:px-6 lg:px-10">
                <Navbar />
                <div className="mx-auto w-full max-w-7xl">
                  <CheckoutAddress />
                </div>
              </div>
            ) : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/checkout/envio-pago"
          element={
            user ? (
              <div className="min-h-screen bg-[#F8FAFC]/50 pt-28 px-4 pb-10 md:px-6 lg:px-10">
                <Navbar />
                <div className="mx-auto w-full max-w-7xl">
                  <CheckoutShippingPayment />
                </div>
              </div>
            ) : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/checkout/confirmacion"
          element={
            user ? (
              <div className="min-h-screen bg-[#F8FAFC]/50 pt-28 px-4 pb-10 md:px-6 lg:px-10">
                <Navbar />
                <div className="mx-auto w-full max-w-7xl">
                  <CheckoutConfirmOrder />
                </div>
              </div>
            ) : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/perfil/compras"
          element={
            user ? (
              <div className="min-h-screen bg-[#F8FAFC]/50 pt-28 px-4 pb-10 md:px-6 lg:px-10">
                <Navbar />
                <div className="mx-auto w-full max-w-7xl">
                  <UserProfile />
                </div>
              </div>
            ) : <Navigate to="/login" replace />
          }
        />

        <Route element={<AdminRoutes />}>
          <Route 
            path="/admin" 
            element={
              <div className="min-h-screen bg-[#F8FAFC]/50 pt-28">
                <Navbar /> 
                <ProductCatalog />
              </div>
            } 
          />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
