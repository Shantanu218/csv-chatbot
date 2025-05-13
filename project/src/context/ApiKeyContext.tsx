import React, { createContext, useState, useContext, ReactNode } from 'react';
import { ApiKeyContextType } from '../types';
import toast from 'react-hot-toast';

// Create the context
const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

// Provider component
export const ApiKeyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [apiKey, setApiKey] = useState<string | null>(() => {
        const savedKey = localStorage.getItem('openai-api-key');
        return savedKey;
    });
    const [isValidating, setIsValidating] = useState(false);
    const [isValid, setIsValid] = useState<boolean | null>(null);

    const validateKey = async (key: string): Promise<boolean> => {
        setIsValidating(true);

        try {
            // Simple validation by making a models list request
            const response = await fetch('https://api.openai.com/v1/models', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${key}`,
                    'Content-Type': 'application/json'
                }
            });

            const isValid = response.status === 200;

            if (isValid) {
                // Save the key to localStorage if valid
                localStorage.setItem('openai-api-key', key);
                setApiKey(key);
                setIsValid(true);
                toast.success('Successfully validated API key');
            } else {
                setIsValid(false);
                const data = await response.json();
                toast.error(`Invalid API key: ${data.error?.message || 'Unknown error'}`);
            }

            setIsValidating(false);
            return isValid;
        } catch (error) {
            console.error('Error validating API key:', error);
            setIsValid(false);
            setIsValidating(false);
            toast.error('Failed to validate API key. Please check your internet connection.');
            return false;
        }
    };

    return (
        <ApiKeyContext.Provider value={{ apiKey, setApiKey, isValidating, isValid, validateKey }}>
            {children}
        </ApiKeyContext.Provider>
    );
};

// Custom hook to use the API key context
export const useApiKey = (): ApiKeyContextType => {
    const context = useContext(ApiKeyContext);
    if (context === undefined) {
        throw new Error('useApiKey must be used within an ApiKeyProvider');
    }
    return context;
};