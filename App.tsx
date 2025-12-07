
import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Header from './components/Header';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import LiveCallOverlay from './components/LiveCallOverlay';
import { Message } from './types';
import { initializeChat, sendMessageStream } from './services/geminiService';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLiveCallActive, setIsLiveCallActive] = useState(false);

  // Initialize the chat session once on mount
  useEffect(() => {
    initializeChat();
  }, []);

  const handleSendMessage = useCallback(async (text: string, imageBase64?: string) => {
    // 1. Add User Message
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      text: text,
      attachment: imageBase64 ? { type: 'image', content: imageBase64 } : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // 2. Prepare Model Message placeholder
    const modelMessageId = uuidv4();
    const initialModelMessage: Message = {
      id: modelMessageId,
      role: 'model',
      text: '', // Start empty
    };
    setMessages((prev) => [...prev, initialModelMessage]);

    try {
      // 3. Stream Response
      const stream = sendMessageStream(text, imageBase64);
      let accumulatedText = '';
      let accumulatedSources: { title?: string; uri: string }[] = [];

      for await (const chunk of stream) {
        accumulatedText += chunk.text;
        
        // Check for grounding metadata
        if (chunk.groundingMetadata?.groundingChunks) {
            const chunks = chunk.groundingMetadata.groundingChunks;
            const newSources = chunks
                .filter((c: any) => c.web?.uri)
                .map((c: any) => ({ 
                    title: c.web.title || '', 
                    uri: c.web.uri 
                }));
            
            if (newSources.length > 0) {
               // Merge and deduplicate based on URI
               const existingUris = new Set(accumulatedSources.map(s => s.uri));
               const uniqueNewSources = newSources.filter((s: { uri: string; }) => !existingUris.has(s.uri));
               accumulatedSources = [...accumulatedSources, ...uniqueNewSources];
            }
        }

        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === modelMessageId 
              ? { 
                  ...msg, 
                  text: accumulatedText,
                  groundingSources: accumulatedSources.length > 0 ? accumulatedSources : undefined
                } 
              : msg
          )
        );
      }
    } catch (error: any) {
      console.error("Chat Error:", error);
      
      // Default fallback message
      let errorMessage = "I'm having trouble connecting right now. Please try again in a moment.";

      if (error instanceof Error) {
        const msg = error.message.toLowerCase();

        // 1. Network / Connection Issues
        if (
            msg.includes("fetch failed") || 
            msg.includes("networkerror") || 
            msg.includes("failed to fetch") ||
            msg.includes("network request failed")
        ) {
          errorMessage = "It looks like you're offline. Please check your internet connection and try again.";
        } 
        // 2. Overload / Service Availability (503)
        else if (msg.includes("503") || msg.includes("overloaded") || msg.includes("capacity")) {
          errorMessage = "I'm currently experiencing high traffic. Please give me a moment and try again.";
        } 
        // 3. Rate Limiting (429)
        else if (msg.includes("429") || msg.includes("quota") || msg.includes("limit")) {
           errorMessage = "I've reached my message limit for now. Please wait a minute before asking again.";
        } 
        // 4. API Key / Auth (403/400)
        else if (msg.includes("403") || msg.includes("key") || msg.includes("unauthorized") || msg.includes("permission")) {
           errorMessage = "There seems to be a configuration issue with the service connection. Please refresh the page.";
        } 
        // 5. Unsupported Location (400 often)
        else if (msg.includes("location") || msg.includes("region") || msg.includes("supported")) {
            errorMessage = "I'm sorry, but this service might not be available in your region yet.";
        }
        // 6. Safety / Content Policy
        else if (msg.includes("safety") || msg.includes("blocked") || msg.includes("candidate")) {
           errorMessage = "I couldn't provide a response to that specific request due to safety guidelines. Please try asking in a different way.";
        }
        // 7. Use the provided message if it looks like a clean custom error from our service (e.g. from geminiService.ts)
        else if (!msg.includes("{") && !msg.includes("Error:") && error.message.length < 200) {
           errorMessage = error.message;
        }
      }

      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === modelMessageId 
            ? { ...msg, text: errorMessage, isError: true } 
            : msg
        )
      );
    } finally {
      setIsTyping(false);
    }
  }, []);

  return (
    <>
      <Header 
        onStartLiveCall={() => setIsLiveCallActive(true)} 
        onSearch={(term) => handleSendMessage(`Provide information about ${term}, including expertise and common conditions.`)}
      />
      <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-50/50">
        <MessageList messages={messages} isTyping={isTyping} onQuickReply={(text) => handleSendMessage(text)} />
        <MessageInput onSendMessage={handleSendMessage} isLoading={isTyping} />
        
        {isLiveCallActive && (
          <LiveCallOverlay onClose={() => setIsLiveCallActive(false)} />
        )}
      </main>
    </>
  );
};

export default App;