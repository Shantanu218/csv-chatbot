// CSV Data Types
export interface CSVData {
  data: Array<Record<string, string | number>>;
  meta: {
    fields: string[];
    delimiter: string;
    linebreak: string;
    aborted: boolean;
    truncated: boolean;
    cursor: number;
  };
}

// Message Types
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

// API Types
export interface ApiKeyContextType {
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
  isValidating: boolean;
  isValid: boolean | null;
  validateKey: (key: string) => Promise<boolean>;
}

// App State Types
export interface AppState {
  isDataLoaded: boolean;
  isApiConfigured: boolean;
  activeTab: 'data' | 'chat';
  isDarkMode: boolean;
}

// Theme Type
export interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}