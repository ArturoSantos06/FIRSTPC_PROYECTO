import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthProvider.jsx';
import { CartProvider } from './context/CartProvider.jsx';
import { FavoritesProvider } from './hooks/useFavorites.jsx';
import { PCBuilderProvider } from './context/PCBuilderProvider.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <PCBuilderProvider>
            <App />
          </PCBuilderProvider>
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>,
)
