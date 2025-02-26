import React, { createContext, useContext, useState } from "react";

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <ChatContext.Provider value={{ messages, setMessages, isLoading, setIsLoading }}>
      {children}
    </ChatContext.Provider>
  );
};