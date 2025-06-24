import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SymbolContextType {
  symbol: string;
  setSymbol: (symbol: string) => void;
}

const SymbolContext = createContext<SymbolContextType>({
  symbol: '',
  setSymbol: () => {},
});

export const useSymbolContext = () => useContext(SymbolContext);

export const SymbolProvider = ({ children }: { children: ReactNode }) => {
  const [symbol, setSymbol] = useState('');
  return (
    <SymbolContext.Provider value={{ symbol, setSymbol }}>
      {children}
    </SymbolContext.Provider>
  );
}; 