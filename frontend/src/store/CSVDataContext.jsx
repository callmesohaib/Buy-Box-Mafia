import React, { createContext, useContext, useEffect, useState } from "react";
import Papa from "papaparse";

// Create context
const CsvDataContext = createContext();

// Provider component
export const CsvDataProvider = ({ children }) => {
    const [csvData, setCsvData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCsv = async () => {
            try {
                const response = await fetch("/CompareData.csv");
                if (!response.ok) throw new Error("Failed to fetch CSV file");

                const csvText = await response.text();
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (result) => {
                        setCsvData(result.data);
                        setLoading(false);
                    },
                });
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchCsv();
    }, []);

    return (
        <CsvDataContext.Provider value={{ csvData, loading, error }}>
            {children}
        </CsvDataContext.Provider>
    );
};

// Custom hook to use the CSV context
export const useCsvData = () => useContext(CsvDataContext);
