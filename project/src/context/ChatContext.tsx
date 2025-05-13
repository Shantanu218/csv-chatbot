import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Message } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useApiKey } from './ApiKeyContext';
import { useData } from './DataContext';
import toast from 'react-hot-toast';

// Define the shape of our chat context
interface ChatContextType {
    messages: Message[]; // Array of all chat messages
    addMessage: (content: string, role: 'user' | 'assistant' | 'system') => void; // Function to manually add a message
    sendMessage: (content: string) => Promise<void>; // Function to send a message to OpenAI API
    isProcessing: boolean; // Flag indicating if a message is being processed
}

// Create the context with undefined initial value
const ChatContext = createContext<ChatContextType | undefined>(undefined);

import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: "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", dangerouslyAllowBrowser: true
});

const completion = openai.chat.completions.create({
    model: "gpt-4o-mini",
    store: true,
    messages: [
        { "role": "user", "content": "You are a helpful assistant that analyzes CSV data. The user will upload a CSV file and you will help them extract insights from it." },
    ],
});

completion.then((result) => console.log(result.choices[0]));
console.log("RESULT ON TOP")


export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: uuidv4(),
            role: 'system',
            content: 'You are a helpful assistant that analyzes CSV data. The user will upload a CSV file and you will help them extract insights from it.',
            timestamp: new Date()
        }
    ]);
    const [isProcessing, setIsProcessing] = useState(false);

    const { apiKey } = useApiKey();
    console.log("THIS IS THE API KEY I EXTRACTED")
    console.log(apiKey)
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

    const sendMessage = useCallback(async (content: string) => {
        if (!apiKey) {
            toast.error('Please add your OpenAI API key first');
            return;
        }

        if (!csvData) {
            toast.error('Please upload a CSV file first');
            return;
        }


        // Add the user message
        addMessage(content, 'user');
        setIsProcessing(true);

        try {
            // Prepare the system message to include information about the CSV data
            const systemMessage = `You are analyzing a CSV file with the following columns: ${csvData.meta.fields.join(', ')}. 
      The file contains ${csvData.data.length} rows of data. 
      Here's a sample of the data: ${JSON.stringify(csvData.data.slice(0, 3))}`;

            // Prepare messages for the API
            const messagesToSend = [
                { role: 'system', content: systemMessage },
                ...messages
                    .filter(m => m.role !== 'system')
                    .map(m => ({ role: m.role, content: m.content })),
                { role: 'user', content }
            ];

            // Make the API request
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: messagesToSend,
                    temperature: 0.7
                })
            });

            console.log(response)
            console.log("CHAT WINDOW")

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Unknown error');
            }

            const data = await response.json();
            const assistantResponse = data.choices[0]?.message?.content;

            if (assistantResponse) {
                addMessage(assistantResponse, 'assistant');
            } else {
                throw new Error('No response from assistant');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);

            // Add an error message from the assistant
            addMessage('I encountered an error while processing your request. Please try again or check your API key.', 'assistant');
        } finally {
            setIsProcessing(false);
        }
    }, [apiKey, csvData, messages, addMessage]);

    return (
        <ChatContext.Provider value={{ messages, addMessage, sendMessage, isProcessing }}>
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