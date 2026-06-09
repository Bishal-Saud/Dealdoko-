import React, { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();
export const CartProvider = ({ children }) => {
  // Load initial state from localStorage if it exists
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('my-cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [isOpen, setIsOpen] = useState(false);

  // Whenever 'cart' changes, save it to localStorage
  useEffect(() => {
    localStorage.setItem('my-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => setCart((prev) => [...prev, product]);
  
  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  return (
    <CartContext.Provider value={{ cart, setCart, addToCart, removeFromCart, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);