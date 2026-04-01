import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import { apiFetch } from '../lib/api';

interface ChatbotProps {
  user?: any;
  onTriggerAction?: (action: string, data?: any) => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ onTriggerAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{id: number, text: string, sender: 'user' | 'bot', timestamp: number}>>([
    { id: 1, text: "Hi! I'm here to help with your creative prompts.", sender: 'bot', timestamp: Date.now() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user' as const,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setRateLimitError(null);

    try {
      const response = await apiFetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputValue,
          context: 'Browsing home feed',
          conversationId: conversationId
        })
      });
    
      // ✅ Check ok BEFORE parsing
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to get response');


      }
    
      const data = await response.json();
      setIsTyping(false);

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }
    
      // ✅ Check data.message exists
      const botReply = data.message || "Sorry, I didn't get that. Try again!";
    
      const botMessage = {
        id: Date.now() + 1,
        text: botReply,
        sender: 'bot' as const,
        timestamp: Date.now()
      };
    
      setMessages(prev => [...prev, botMessage]);
    
      if (data.actions?.length > 0 && onTriggerAction) {
        data.actions.forEach((action: any) => {
          onTriggerAction(action.type, action);
        });
      }
    
    } catch (error: any) {
      setIsTyping(false);
    
      if (error.message?.includes('Too many')) {
        setRateLimitError('Slow down there! Let\'s chat a bit slower.');
      }
    
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: error.message || "Oops! Something went wrong. Try again!",
        sender: 'bot' as const,
        timestamp: Date.now()
      }]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <div className="fixed right-6 bottom-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors duration-200"
        >
          {isOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <MessageCircle className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white border border-gray-100 rounded-xl shadow-md z-40 overflow-hidden">
          {/* Header */}
          <div className="bg-white border-b border-gray-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">Chat Assistant</h3>
          </div>

          {/* Messages */}
          <div className="overflow-y-auto flex-1 p-4 space-y-4 h-80">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    message.sender === 'user'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-50 text-gray-700 border border-gray-100'
                  }`}
                >
                  <p>{message.text}</p>
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-100">
            {rateLimitError && (
              <div className="mb-3 text-sm text-red-500">{rateLimitError}</div>
            )}
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                maxLength={500}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none transition-colors duration-200"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="px-3 py-2 text-white bg-gray-900 rounded-lg hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-2 text-xs text-center text-gray-400">
              {inputValue.length}/500 characters
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;