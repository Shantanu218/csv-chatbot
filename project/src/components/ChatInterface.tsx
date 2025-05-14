import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader, PanelRightOpen, PanelRightClose, Search, X, History, Trash2 } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useData } from '../context/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
import ApiKeyInput from './ApiKeyInput';
import { useApiKey } from '../context/ApiKeyContext';

const ChatInterface: React.FC = () => {
    const { messages, promptHistory, sendMessage, isProcessing } = useChat();
    const { csvData, fileName, setCsvData, setFileName } = useData();
    const { apiKey } = useApiKey();
    const [inputValue, setInputValue] = useState('');
    const [showDataPanel, setShowDataPanel] = useState(true);
    const [showPromptHistory, setShowPromptHistory] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLDivElement>(null);

    // Search and pagination for data table
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsToShow, setRowsToShow] = useState(25);
    const rowValues = [5, 10, 25, 50, 100]


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() && !isProcessing) {
            sendMessage(inputValue);
            setInputValue('');
            setShowPromptHistory(false);
        }
    };

    const handleDeleteFile = () => {
        setCsvData(null);
        setFileName(null);
    };

    const visibleMessages = messages.filter(m => m.role !== 'system');

    const filteredData = csvData ? csvData.data.filter(row => {
        if (!searchQuery.trim()) return true;

        const query = searchQuery.toLowerCase().trim();
        return Object.values(row).some(value => {
            if (value === null || value === undefined) return false;
            return String(value).toLowerCase().includes(query);
        });
    }) : [];

    const getCurrentPageData = () => {
        const startIndex = (currentPage - 1) * rowsToShow;
        return filteredData.slice(startIndex, startIndex + rowsToShow);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, rowsToShow]);

    const totalPages = filteredData.length ? Math.ceil(filteredData.length / rowsToShow) : 0;

    // Close prompt history when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
                setShowPromptHistory(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getSuggestions = () => {
        if (!csvData) return [];

        const columns = csvData.meta.fields;
        const rowCount = csvData.data.length;

        const suggestions = [
            `What are the main insights from this data?`,
            `Summarize this dataset for me.`,
            `What patterns do you notice in the ${columns[0]} column?`,
        ];

        if (columns.includes('price') || columns.includes('amount') || columns.includes('value')) {
            suggestions.push(`What's the average value in this dataset?`);
        }

        if (columns.length > 2) {
            suggestions.push(`Is there a correlation between ${columns[0]} and ${columns[1]}?`);
        }

        if (rowCount > 10) {
            suggestions.push(`What are the top 5 entries based on ${columns[0]}?`);
        }

        return suggestions;
    };

    return (
        <div className="flex h-full">
            <div className="flex-1 flex flex-col h-full">
                <div className="flex-1 overflow-visible resize-both px-[2rem] py-[2rem]">
                    {visibleMessages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center px-4">
                            <Bot className="h-16 w-16 text-primary-300 dark:text-primary-700 mb-4" />
                            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                Chat with your CSV data
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                                Ask questions about your data and get instant insights. I'll help you understand patterns, trends, and key information.
                            </p>

                            {!apiKey ? (
                                <ApiKeyInput />
                            ) : (
                                <div className="space-y-2 w-full max-w-md">
                                    {getSuggestions().slice(0, 5).map((suggestion, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                setInputValue(suggestion);
                                                setTimeout(() => {
                                                    sendMessage(suggestion);
                                                    setInputValue('');
                                                }, 300);
                                            }}
                                            className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 
                                 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {visibleMessages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className={`flex items-start ${message.role === 'assistant' ? 'justify-start' : 'justify-end'
                                        }`}
                                >
                                    <div
                                        className={`rounded-lg px-4 py-3 max-w-[85%] ${message.role === 'assistant'
                                            ? 'message-assistant'
                                            : 'message-user'
                                            }`}
                                    >
                                        <div className="flex items-center mb-1">
                                            {message.role === 'assistant' ? (
                                                <Bot className="h-4 w-4 mr-1.5 text-primary-500" />
                                            ) : (
                                                <User className="h-4 w-4 mr-1.5 text-primary-500" />
                                            )}
                                            <span className="font-medium text-sm">
                                                {message.role === 'assistant' ? 'AI Assistant' : 'You'}
                                            </span>
                                        </div>
                                        {/* This is where each message is displayed (Both User and Bot's) */}
                                        <div className="whitespace-pre-wrap">
                                            {message.content.replaceAll("**", "").replaceAll("###", "")}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {isProcessing && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-start justify-start"
                                >
                                    <div className="message-assistant rounded-lg px-4 py-3">
                                        <div className="flex items-center mb-1">
                                            <Bot className="h-4 w-4 mr-1.5 text-primary-500" />
                                            <span className="font-medium text-sm">AI Assistant</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Loader className="h-4 w-4 mr-2 animate-spin" />
                                            <span>Analyzing your data...</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 p-[2rem]" ref={inputRef}>
                    <form onSubmit={handleSubmit} className="flex space-x-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Ask about your data..."
                                className="input pr-10"
                                disabled={isProcessing || !apiKey}
                            />
                            {promptHistory.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setShowPromptHistory(!showPromptHistory)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <History className="h-5 w-5" />
                                </button>
                            )}

                            <AnimatePresence>
                                {showPromptHistory && promptHistory.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute bottom-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg
                                        mb-2 max-h-60 overflow-y-auto"
                                    >
                                        {promptHistory.map((prompt) => (
                                            <button
                                                key={prompt.id}
                                                onClick={() => {
                                                    setInputValue(prompt.content);
                                                    setShowPromptHistory(false);
                                                }}
                                                className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between border-b
                                                border-gray-100 dark:border-gray-700 last:border-0"
                                            >
                                                <span className="truncate flex-1 text-gray-700 dark:text-gray-300">
                                                    {prompt.content}
                                                </span>
                                                <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                                                    Used {prompt.useCount}×
                                                </span>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <button
                            type="submit"
                            disabled={!inputValue.trim() || isProcessing || !apiKey}
                            className="btn btn-primary px-4"
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </form>
                </div>
            </div>

            <AnimatePresence>
                {showDataPanel && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: '50%', opacity: 1, maxWidth: '1600px' }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="hidden lg:block border-l border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                        <div className="h-full flex flex-col">
                            <div className="p-[2rem] border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-medium text-gray-800 dark:text-gray-200">
                                        {fileName || 'Data Preview'}
                                    </h3>
                                    <div className="flex items-center space-x-3">
                                        {csvData && (
                                            <button
                                                onClick={handleDeleteFile}
                                                className="text-gray-500 hover:text-error-500 dark:hover:text-error-400"
                                                title="Delete file"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        )}

                                        <button
                                            onClick={() => setShowDataPanel(false)}
                                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                        >
                                            <PanelRightClose className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search data..."
                                        className="input pl-10 pr-10 text-sm"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            <X className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 overflow-visible p-[2rem] text-gray-800 dark:text-gray-200">
                                {csvData && (
                                    <div className="overflow-x-scroll" style={{ scrollbarWidth: "auto", msOverflowStyle: "scrollbar" }}>
                                        <table className="data-table text-xs" style={{ height: "100%", width: "100%" }}>
                                            <thead>
                                                <tr>
                                                    {csvData.meta.fields.map((field) => (
                                                        <th key={field} className="px-2 py-1">
                                                            {field}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {getCurrentPageData().map((row, rowIndex) => (
                                                    <tr key={rowIndex}>
                                                        {csvData.meta.fields.map((field) => (
                                                            <td key={`${rowIndex}-${field}`} className="px-2 py-1">
                                                                {row[field] !== null && row[field] !== undefined
                                                                    ? String(row[field])
                                                                    : ''}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        {totalPages > 1 && (
                                            <div>
                                                <div className="mt-4 mb-1 flex items-center justify-between">
                                                    <div className="flex space-x-1">
                                                        {rowValues.map((value, index) => (
                                                            <button
                                                                key={index}
                                                                value={value}
                                                                onClick={(e) => setRowsToShow(Number(e.target.value))}
                                                                disabled={rowsToShow === value}
                                                                className={`px-4 py-2 text-[1rem] rounded border ${rowsToShow === value
                                                                    ? 'bg-primary-500 text-white'
                                                                    : 'border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                                                                    }`}
                                                            >
                                                                {value}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    <div className="flex space-x-1">
                                                        <button
                                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                            disabled={currentPage === 1}
                                                            className="px-4 py-2 text-xs rounded border border-gray-300 dark:border-gray-700 
                                                        text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            Previous
                                                        </button>

                                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                            let pageNum;
                                                            if (totalPages <= 5) {
                                                                pageNum = i + 1;
                                                            } else if (currentPage <= 3) {
                                                                pageNum = i + 1;
                                                            } else if (currentPage >= totalPages - 2) {
                                                                pageNum = totalPages - 4 + i;
                                                            } else {
                                                                pageNum = currentPage - 2 + i;
                                                            }

                                                            return (
                                                                <button
                                                                    key={pageNum}
                                                                    onClick={() => setCurrentPage(pageNum)}
                                                                    className={`px-4 py-2 text-[1rem] rounded ${pageNum === currentPage
                                                                        ? 'bg-primary-500 text-white'
                                                                        : 'border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                                                                        }`}
                                                                >
                                                                    {pageNum}
                                                                </button>
                                                            );
                                                        })}

                                                        <button
                                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                            disabled={currentPage === totalPages}
                                                            className="px-4 py-2 text-xs rounded border border-gray-300 dark:border-gray-700 
                                                        text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            Next
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                                                    Showing {Math.min(filteredData.length, (currentPage - 1) * rowsToShow + 1)} to{' '}
                                                    {Math.min(currentPage * rowsToShow, filteredData.length)} of {filteredData.length} results
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {
                !showDataPanel && (
                    <button
                        onClick={() => setShowDataPanel(true)}
                        className="hidden lg:flex items-center justify-center h-10 w-10 m-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-
                    text-gray-800 dark:text-gray-200"
                    >
                        <PanelRightOpen className="h-5 w-5" />
                    </button>
                )
            }
        </div >
    );
};

export default ChatInterface;