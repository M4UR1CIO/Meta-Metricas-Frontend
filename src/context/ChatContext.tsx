import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Message {
  text: string;
  sender: 'bot' | 'user';
}

interface ChatContextType {
  messages: Message[];
  addMessage: (message: Message) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([
    { text: 'Hola aquí tu bot, ¿en qué te ayudo?', sender: 'bot' },
  ]);

  const addMessage = (message: Message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  return (
    <ChatContext.Provider value={{ messages, addMessage }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat debe usarse dentro de un ChatProvider');
  }
  return context;
};
