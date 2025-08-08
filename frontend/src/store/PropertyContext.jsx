// store/PropertyContext.js
import { createContext, useContext, useState } from 'react';

const PropertyContext = createContext();

export function PropertyProvider({ children }) {
  const [searchValue, setSearchValue] = useState('');
  const [propertyData, setPropertyData] = useState(() => {
    try {
      const saved = localStorage.getItem('propertyData');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [valuationResult, setValuationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const attomKey = import.meta.env.VITE_ATTOM_API_KEY;
  const attomUrl = import.meta.env.VITE_ATTOM_API_URL;

  const fetchProperty = async (value) => {
    if (!value.trim()) {
      setError('Please enter a search value');
      setPropertyData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const parts = value.split('/').map(p => p.trim());
      const address1 = encodeURIComponent(parts[0]);
      const address2 = parts[1] ? `&address2=${encodeURIComponent(parts[1])}` : '';
      const url = `${attomUrl}?address1=${address1}${address2}`;

      const resp = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'apikey': attomKey
        }
      });
      const data = await resp.json();

      if (data.property?.length) {
        const prop = data.property[0];
        setPropertyData(prop);
        localStorage.setItem('propertyData', JSON.stringify(prop));
      } else {
        setPropertyData(null);
        setError('No property found');
        localStorage.removeItem('propertyData');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch property');
      setPropertyData(null);
      localStorage.removeItem('propertyData');
    } finally {
      setLoading(false);
    }
  };

  const clearProperty = () => {
    setSearchValue('');
    setPropertyData(null);
    setValuationResult(null);
    setError(null);
    localStorage.removeItem('propertyData');
  };

  return (
    <PropertyContext.Provider value={{
      searchValue,
      setSearchValue,
      propertyData,
      valuationResult,
      loading,
      error,
      fetchProperty,
      setValuationResult,
      clearProperty
    }}>
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperty() {
  const ctx = useContext(PropertyContext);
  if (!ctx) throw new Error('useProperty must be used within PropertyProvider');
  return ctx;
}
