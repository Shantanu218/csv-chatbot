import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader, PanelRightOpen, PanelRightClose } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useData } from '../context/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
import ApiKeyInput from './ApiKeyInput';
import { useApiKey } from '../context/ApiKeyContext';

const ChatInterface: React.FC = () => {
    const { messages, sendMessage, isProcessing } = useChat();
    const { csvData, fileName } = useData();
    const { apiKey } = useApiKey();
    const [inputValue, setInputValue] = useState('');
    const [showDataPanel, setShowDataPanel] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);



    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() && !isProcessing) {
            sendMessage(inputValue);
            setInputValue('');
        }
    };

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const messagesPerPage = 10;

    // Get visible messages (exclude system messages)
    const visibleMessages = messages.filter(m => m.role !== 'system');

    const totalPages = Math.ceil(visibleMessages.length / messagesPerPage);



    // Scroll to bottom when new message is added
    useEffect(() => {
        if (currentPage === totalPages) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, currentPage, totalPages]);

    // Reset to last page when new message is added
    useEffect(() => {
        setCurrentPage(totalPages);
    }, [messages.length]);



    // Suggestions based on the data
    const getSuggestions = () => {
        if (!csvData) return [];

        const columns = csvData.meta.fields;
        const rowCount = csvData.data.length;

        const suggestions = [
            `What are the main insights from this data?`,
            `Summarize this dataset for me.`,
            `What patterns do you notice in the ${columns[0]} column?`,
        ];

        // Add column-specific suggestions
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
            {/* Chat Content */}
            <div className="flex-1 flex flex-col h-full">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-4 py-3">
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
                                    {getSuggestions().slice(0, 3).map((suggestion, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                setInputValue(suggestion);
                                                // Small delay to make it feel more natural
                                                setTimeout(() => {
                                                    sendMessage(suggestion);
                                                    setInputValue('');
                                                }, 30000);
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
                                        <div className="whitespace-pre-wrap">
                                            {message.content}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Shows when the AI is thinking */}
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


                {/* Input Area */}
                <div className="border-t border-gray-200 dark:border-gray-700 xl:p-[6rem]">
                    <form onSubmit={handleSubmit} className="flex space-x-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask about your data..."
                            className="input flex-1"
                            disabled={isProcessing || !apiKey}
                        />
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

            {/* Data Preview Panel */}
            <AnimatePresence>
                {showDataPanel && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: '900px', opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="hidden lg:block border-l border-gray-200 dark:border-gray-700 overflow-visible"
                    >
                        <div className="h-full flex flex-col bg-white dark:bg-gray-800">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                <h3 className="font-medium text-gray-800 dark:text-gray-200">
                                    {fileName || 'Data Preview'}
                                </h3>
                                <button
                                    onClick={() => setShowDataPanel(false)}
                                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    <PanelRightClose className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-auto p-4 bg-white dark:bg-gray-800">
                                {csvData && (
                                    <div className="overflow-x-auto">
                                        <table className="data-table text-xs text-gray-800 dark:text-gray-200">
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
                                                {csvData.data.slice(0, 100).map((row, rowIndex) => (
                                                    <tr key={rowIndex}>
                                                        {csvData.meta.fields.map((field) => (
                                                            <td key={`${rowIndex}-${field}`} className="px-2 py-1 truncate max-w-[150px]">
                                                                {row[field] !== null && row[field] !== undefined
                                                                    ? String(row[field])
                                                                    : ''}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        {csvData.data.length > 100 && (
                                            <p className="text-xs text-gray-500 mt-2 text-center">
                                                Showing 100 of {csvData.data.length} rows
                                            </p>
                                        )}

                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle button for data panel on larger screens */}
            {!showDataPanel && (
                <button
                    onClick={() => setShowDataPanel(true)}
                    className="hidden lg:flex items-center justify-center h-10 w-10 m-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500"
                >
                    <PanelRightOpen className="h-5 w-5" />
                </button>
            )}
        </div>
    );
};

export default ChatInterface;