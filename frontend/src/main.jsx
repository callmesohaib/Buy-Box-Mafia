
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CsvDataProvider } from "./store/CSVDataContext";

ReactDOM.createRoot(document.getElementById("root")).render(
    <CsvDataProvider>
        <App />
    </CsvDataProvider>
);