import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import DataDisplay from './components/DataDisplay';
import ChatInterface from './components/ChatInterface';
import { Toaster } from 'react-hot-toast';
import { DataProvider, useData } from './context/DataContext';
import { ApiKeyProvider } from './context/ApiKeyContext';
import { ChatProvider } from './context/ChatContext';
import { ThemeProvider } from './context/ThemeContext';

const AppContent: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'data' | 'chat'>('data');
    const { csvData } = useData();
    const [flag, setFlag] = useState(true)

    // // Auto-switch to chat tab when data is loaded
    useEffect(() => {
        if (csvData && activeTab === 'data' && flag) {
            // Small delay to allow user to see the data first
            const timer = setTimeout(() => {
                setActiveTab('chat');
            }, 20);
            setFlag(false)

            return () => clearTimeout(timer);
        }
    }, [csvData, activeTab]);

    return (
        <div className="flex flex-col">
            <Header
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isDataLoaded={!!csvData}
            />

            <main className="flex-1 overflow-visible mb-[20px]" >
                {activeTab === 'data' ? (
                    csvData ? <DataDisplay /> : <FileUpload />
                ) : (
                    <ChatInterface />
                )}
            </main>

            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 2500,
                    removeDelay: 1500,
                    style: {
                        background: '#7991b7',
                        color: '#fff',
                        fontSize: '0.9rem',
                        fontFamily: 'sans-serif'
                    },
                    success: {
                        style: {
                            background: '#059669',
                        },
                        iconTheme: {
                            primary: '#059669',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        style: {
                            background: '#DC2626',
                        },
                        iconTheme: {
                            primary: '#DC2626',
                            secondary: '#fff',
                        },
                    },
                }}
            />
        </div>
    );
};

function App() {
    return (
        <ThemeProvider>
            <ApiKeyProvider>
                <DataProvider>
                    <ChatProvider>
                        <AppContent />
                    </ChatProvider>
                </DataProvider>
            </ApiKeyProvider>
        </ThemeProvider>
    );
}

export default App;