// context/PropertyContext.js
import { createContext, useContext, useState } from 'react';

const PropertyContext = createContext();

export function PropertyProvider({ children }) {
  const [propertyData, setPropertyData] = useState(null);
  const [valuationResult, setValuationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateProperty = (data) => {
    setPropertyData(data);
    setError(null);
  };

  const clearProperty = () => {
    setPropertyData(null);
    setValuationResult(null);
  };

  const value = {
    propertyData,
    valuationResult,
    loading,
    error,
    updateProperty,
    setValuationResult,
    clearProperty,
    setLoading,
    setError,
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperty() {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  return context;
}