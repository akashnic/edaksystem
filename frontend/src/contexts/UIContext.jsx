import React, { createContext, useContext, useState, useEffect } from 'react';

const UIContext = createContext();

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

export const UIProvider = ({ children }) => {
  const MIN_FONT_SIZE = 80;
  const MAX_FONT_SIZE = 150;
  const DEFAULT_FONT_SIZE = 100;

  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('user-font-size');
    return saved ? parseInt(saved, 10) : DEFAULT_FONT_SIZE;
  });

  useEffect(() => {
    document.documentElement.style.setProperty('--base-font-size', `${fontSize}%`);
    localStorage.setItem('user-font-size', fontSize.toString());
  }, [fontSize]);

  const increaseFontSize = () => {
    setFontSize((prev) => Math.min(prev + 10, MAX_FONT_SIZE));
  };

  const decreaseFontSize = () => {
    setFontSize((prev) => Math.max(prev - 10, MIN_FONT_SIZE));
  };

  const resetFontSize = () => {
    setFontSize(DEFAULT_FONT_SIZE);
  };

  return (
    <UIContext.Provider
      value={{
        fontSize,
        increaseFontSize,
        decreaseFontSize,
        resetFontSize,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};
