import React, { useState } from 'react';
import { Key, Eye, EyeOff, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useApiKey } from '../context/ApiKeyContext';
import { motion } from 'framer-motion';

// const vite_key = import.meta.env.VITE_PERSONAL_API_KEY;
const vite_key = import.meta.env.VITE_COMPANY_API_KEY;

const ApiKeyInput: React.FC = () => {
    const { apiKey, validateKey, isValidating, isValid } = useApiKey();
    const [showKey, setShowKey] = useState(false);
    const [inputKey, setInputKey] = useState(apiKey || '');

    if (vite_key)
        validateKey(vite_key);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputKey.trim()) {
            validateKey(inputKey.trim());
        }
    };

    return (
        <motion.div
            className="mb-6 card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="card-header">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center">
                    <Key className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                    OpenAI API Key
                </h3>
            </div>

            <div className="card-body">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <div className="relative">
                            <input
                                type={showKey ? 'text' : 'password'}
                                value={inputKey}
                                onChange={(e) => setInputKey(e.target.value)}
                                placeholder="Enter your OpenAI API key"
                                className={`input pr-10 ${isValid === false ? 'border-error-500 focus:ring-error-500' : ''
                                    }`}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                onClick={() => setShowKey(!showKey)}
                            >
                                {showKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>

                        {isValid === false && (
                            <p className="mt-2 text-sm text-error-500 flex items-center">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                Invalid API key. Please check and try again.
                            </p>
                        )}

                        {isValid === true && (
                            <p className="mt-2 text-sm text-success-500 flex items-center">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                API key validated successfully.
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isValidating || !inputKey.trim()}
                        className="btn btn-primary w-full flex justify-center items-center"
                    >
                        {isValidating ? (
                            <>
                                <span className="mr-2 inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                                Validating...
                            </>
                        ) : (
                            <>Validate Key</>
                        )}
                    </button>
                </form>

                <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md flex items-start">
                    <Info className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                        <p className="mb-1">Your API key is stored locally in your browser and never sent to our servers.</p>
                        <p>Don't have an API key? Get one from the <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline font-medium hover:text-blue-800 dark:hover:text-blue-200">OpenAI dashboard</a>.</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ApiKeyInput;