import { useEffect, useMemo, useState } from 'react';
import { CartContext } from './CartContext';
import { getMaxQuantity, normalizeQuantity } from '../components/AdminInventory/inventory';

const STORAGE_KEY = 'firstpc-shopping-cart';

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

  const addItem = (product, requestedQuantity = 1) => {
    if (!product?.id) {
      return;
    }

    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id);
      const maxQuantity = getMaxQuantity(product);

      const quantityToAdd = Math.max(1, Number(requestedQuantity) || 1);

      if (!existingItem) {
        return [
          ...currentItems,
          {
            ...product,
            image: product.images?.[0] || product.image || '',
            quantity: Math.min(quantityToAdd, maxQuantity),
          },
        ];
      }

      return currentItems.map((item) => {
        if (item.id !== product.id) {
          return item;
        }

        return {
          ...item,
          image: product.images?.[0] || product.image || item.image || '',
          quantity: Math.min((Number(item.quantity) || 1) + quantityToAdd, maxQuantity),
        };
      });
    });
  };

  const updateQuantity = (itemId, nextQuantity) => {
    setCartItems((currentItems) =>
      currentItems.map((item) => ({
        ...item,
        quantity: item.id === itemId ? normalizeQuantity(nextQuantity, item) : item.quantity,
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
      quantity: normalizeQuantity(item.quantity ?? 1, item),
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
