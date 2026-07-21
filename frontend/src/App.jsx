import { useContext } from 'react';
import './index.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import ProductDetailPage from './pages/ProductDetailPage';
import ProfileShippingAddresses from './pages/ProfileShippingAddresses';
import ProfileBilling from './pages/ProfileBilling';
import PCBuilder from './components/PCBuilder/PCBuilder';
import RecommendationWizard from './components/RecommendationWizard/RecommendationWizard';


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
          element={user ? <LoginRedirect /> : <Login />}
        />

        <Route path="/" element={<Home />} />

        <Route
          path="/armar-pc"
          element={
            <div className="min-h-screen bg-slate-50 pt-28 [&_.bg-slate-900]:!bg-white [&_.bg-slate-900]:!text-slate-800 [&_.bg-slate-900_.text-white]:!text-slate-800 [&_button.bg-slate-900]:!border [&_button.bg-slate-900]:!border-slate-300 [&_button.bg-slate-900]:!bg-white [&_button.bg-slate-900]:!text-slate-700 [&_button.bg-slate-900:hover]:!border-emerald-400 [&_button.bg-slate-900:hover]:!bg-emerald-50 [&_button.bg-slate-900:hover]:!text-emerald-700 [&_.bg-amber-50]:!hidden [&_button.text-slate-600]:!hidden [&_button.border:disabled]:!hidden">
              <Navbar />
              <PCBuilder />
            </div>
          }
        />

        <Route path="/recomendador" element={<RecommendationWizard />} />

        <Route path="/producto/:id" element={<ProductDetailPage />} />
        
        <Route 
          path="/catalogo" 
          element={
            <div className="min-h-screen bg-[#F8FAFC]/50 pt-28">
              <Navbar />
              <ProductCatalog />
            </div>
          } 
        />

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

        <Route
          path="/perfil/favoritos"
          element={
            user ? (
              <div className="min-h-screen bg-[#F8FAFC]/50 pt-28 px-4 pb-10 md:px-6 lg:px-10">
                <Navbar />
                <div className="mx-auto w-full max-w-7xl">
                  <UserProfile initialTab="favorites" />
                </div>
              </div>
            ) : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/perfil/envio"
          element={
            user ? (
              <div className="min-h-screen bg-[#F8FAFC]/50 pt-28 px-4 pb-10 md:px-6 lg:px-10">
                <Navbar />
                <div className="mx-auto w-full max-w-7xl">
                  <ProfileShippingAddresses />
                </div>
              </div>
            ) : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/perfil/facturacion"
          element={
            user ? (
              <div className="min-h-screen bg-[#F8FAFC]/50 pt-28 px-4 pb-10 md:px-6 lg:px-10">
                <Navbar />
                <div className="mx-auto w-full max-w-7xl">
                  <ProfileBilling />
                </div>
              </div>
            ) : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/perfil/pc-configuradas"
          element={
            user ? (
              <div className="min-h-screen bg-[#F8FAFC]/50 pt-28 px-4 pb-10 md:px-6 lg:px-10">
                <Navbar />
                <div className="mx-auto w-full max-w-7xl">
                  <UserProfile initialTab="configurations" />
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
          <Route path="/admin/recomendador-settings" element={<RecommendationWizard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

const LoginRedirect = () => {
  const location = useLocation();
  return <Navigate to={location.state?.from || '/'} replace />;
};

export default App;
