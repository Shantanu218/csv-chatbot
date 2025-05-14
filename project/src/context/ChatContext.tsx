import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Message, PromptHistory } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useApiKey } from './ApiKeyContext';
import { useData } from './DataContext';
import toast from 'react-hot-toast';
import { getAIResponse } from "../utils/openai";
import OpenAI from "openai";


interface ChatContextType {
    messages: Message[];
    promptHistory: PromptHistory[];
    addMessage: (content: string, role: 'user' | 'assistant' | 'system') => void;
    sendMessage: (content: string) => Promise<void>;
    isProcessing: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    const [messages, setMessages] = useState<Message[]>([
        {
            id: uuidv4(),
            role: 'system',
            content: 'You are a helpful assistant that analyzes CSV data. The user will upload a CSV file and you will help them extract insights from it.',
            timestamp: new Date()
        }
    ]);

    const [promptHistory, setPromptHistory] = useState<PromptHistory[]>(() => {
        // const saved = localStorage.getItem('promptHistory');
        // return saved ? JSON.parse(saved) : [];
        const saved: PromptHistory[] = [];
        return saved;
    });

    const [isProcessing, setIsProcessing] = useState(false);

    const { apiKey } = useApiKey();
    const { csvData } = useData();

    const addMessage = useCallback((content: string, role: 'user' | 'assistant' | 'system') => {
        const newMessage: Message = {
            id: uuidv4(),
            role,
            content,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newMessage]);
        return newMessage;
    }, []);


    const updatePromptHistory = useCallback((content: string) => {
        setPromptHistory((prev) => {
            const existing = prev.find((p) => p.content === content);
            let updatedHistory: PromptHistory[];

            if (existing) {
                // Update existing prompt
                updatedHistory = prev.map((p) =>
                    p.content === content
                        ? { ...p, useCount: p.useCount + 1, timestamp: new Date() }
                        : p
                );
            } else {
                // Add new prompt
                const newPrompt: PromptHistory = {
                    id: Date.now().toString(),
                    content,
                    timestamp: new Date(),
                    useCount: 1
                };
                updatedHistory = [newPrompt, ...prev];
            }

            return updatedHistory.slice(0, 10); // Keep last 10
        });
    }, []);

    const sendMessage = useCallback(async (content: string) => {
        if (!apiKey) {
            toast.error('Please add your OpenAI API key first');
            return;
        }

        if (!csvData) {
            toast.error('Please upload a CSV file first');
            return;
        }

        updatePromptHistory(content);
        addMessage(content, 'user');
        setIsProcessing(true);

        try {
            const systemMessage = `You are analyzing a CSV file with the following columns: ${csvData.meta.fields.join(', ')}. 
      The file contains ${csvData.data.length} rows of data. 
      Here's the data: ${JSON.stringify(csvData.data)}`;

            const messagesToSend: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
                { role: 'system', content: systemMessage },
                ...messages
                    .map(m => ({
                        role: m.role as 'user' | 'assistant' | 'system', // Explicit type assertion
                        content: m.content
                    })),
                { role: 'user', content }
            ];

            // Use your getAIResponse function
            const assistantResponse = await getAIResponse(messagesToSend);

            if (assistantResponse.message.content) {
                addMessage(assistantResponse.message.content, 'assistant');
            } else {
                throw new Error('No response from assistant');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            addMessage('I encountered an error while processing your request. Please try again or check your API key.', 'assistant');
        } finally {
            setIsProcessing(false);
        }
    }, [apiKey, csvData, messages, addMessage, updatePromptHistory]);

    return (
        <ChatContext.Provider value={{ messages, promptHistory, addMessage, sendMessage, isProcessing }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = (): ChatContextType => {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};