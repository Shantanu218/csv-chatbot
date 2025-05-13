import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CSVData } from '../types';

interface DataContextType {
    csvData: CSVData | null;
    setCsvData: (data: CSVData | null) => void;
    fileName: string | null;
    setFileName: (name: string | null) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [csvData, setCsvData] = useState<CSVData | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    return (
        <DataContext.Provider
            value={{
                csvData,
                setCsvData,
                fileName,
                setFileName,
                isLoading,
                setIsLoading
            }}
        >
            {children}
        </DataContext.Provider>
    );
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};