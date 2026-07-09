import { useEffect, useMemo, useState } from 'react';
import { CartContext } from './CartContext';

const STORAGE_KEY = 'firstpc-shopping-cart';

const clampQuantity = (value, stock) => {
  const parsedValue = Number.parseInt(value, 10);
  const maxStock = Number.isFinite(Number(stock)) && Number(stock) > 0 ? Number(stock) : Number.POSITIVE_INFINITY;

  if (!Number.isFinite(parsedValue)) {
    return 1;
  }

  return Math.min(Math.max(parsedValue, 1), maxStock);
};

const getStoredCart = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const storedCart = window.localStorage.getItem(STORAGE_KEY);

    if (!storedCart) {
      return [];
    }

    const parsedCart = JSON.parse(storedCart);

    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => getStoredCart());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const addItem = (product) => {
    if (!product?.id) {
      return;
    }

    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id);
      const maxStock = Number.isFinite(Number(product.stock)) && Number(product.stock) > 0 ? Number(product.stock) : Number.POSITIVE_INFINITY;

      if (!existingItem) {
        return [
          ...currentItems,
          {
            ...product,
            quantity: 1,
          },
        ];
      }

      return currentItems.map((item) => {
        if (item.id !== product.id) {
          return item;
        }

        return {
          ...item,
          quantity: Math.min((Number(item.quantity) || 1) + 1, maxStock),
        };
      });
    });
  };

  const updateQuantity = (itemId, nextQuantity) => {
    setCartItems((currentItems) =>
      currentItems.map((item) => ({
        ...item,
        quantity: item.id === itemId ? clampQuantity(nextQuantity, item.stock) : item.quantity,
      }))
    );
  };

  const removeItem = (itemId) => {
    setCartItems((currentItems) => currentItems.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartSummary = useMemo(() => {
    const items = cartItems.map((item) => ({
      ...item,
      quantity: clampQuantity(item.quantity ?? 1, item.stock),
    }));

    const totalItems = items.reduce((accumulator, item) => accumulator + item.quantity, 0);
    const totalAmount = items.reduce((accumulator, item) => accumulator + (Number(item.price) || 0) * item.quantity, 0);

    return { items, totalItems, totalAmount };
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems: cartSummary.items,
        totalItems: cartSummary.totalItems,
        totalAmount: cartSummary.totalAmount,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};