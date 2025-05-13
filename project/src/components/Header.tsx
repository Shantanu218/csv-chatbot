import React from 'react';
import { Database, FileSpreadsheet, MessageSquare, Moon, Sun, Upload } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

interface HeaderProps {
    activeTab: 'data' | 'chat';
    setActiveTab: (tab: 'data' | 'chat') => void;
    isDataLoaded: boolean;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, isDataLoaded }) => {
    const { isDarkMode, toggleDarkMode } = useTheme();

    return (
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <motion.div
                            className="flex items-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Database className="h-8 w-8 text-primary-500" />
                            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">CSV Chat</span>
                        </motion.div>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Navigation Tabs */}
                        <nav className="flex space-x-1">
                            <button
                                onClick={() => setActiveTab('data')}
                                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${activeTab === 'data'
                                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {activeTab === 'data' ? (
                                    <FileSpreadsheet className="h-4 w-4 mr-1.5" />
                                ) : (
                                    <Upload className="h-4 w-4 mr-1.5" />
                                )}
                                Data
                            </button>

                            <button
                                onClick={() => setActiveTab('chat')}
                                disabled={!isDataLoaded}
                                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${!isDataLoaded
                                    ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                                    : activeTab === 'chat'
                                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                                        : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <MessageSquare className="h-4 w-4 mr-1.5" />
                                Chat
                            </button>
                        </nav>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {isDarkMode ? (
                                <Sun className="h-5 w-5" />
                            ) : (
                                <Moon className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;