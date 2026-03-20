import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Heart, Star } from 'lucide-react';
import { apiFetch } from '../lib/api';

interface ChatbotProps {
  user?: any;
  onTriggerAction?: (action: string, data?: any) => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ onTriggerAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{id: number, text: string, sender: 'user' | 'bot', timestamp: number}>>([
    { id: 1, text: "Hey there! 👋 I'm Prompty, your creative assistant!", sender: 'bot', timestamp: Date.now() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [botMood, setBotMood] = useState('happy');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const randomGreetings = [
    "Hiya! 👋",
    "Hey beautiful! ✨",
    "What's up, creator? 🎨",
    "Ready to create magic? 🪄",
    "Let's make art! 🎭",
    "Feeling creative today? 💡",
    "Time to inspire! 🌟"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        const greetings = randomGreetings;
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        
        // Randomly show a greeting message
        if (Math.random() < 0.3) {
          setMessages(prev => [...prev, {
            id: Date.now(),
            text: randomGreeting,
            sender: 'bot',
            timestamp: Date.now()
          }]);
        }
      }, 15000);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

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
      const botReply = data.message || "Sorry, I didn't get that. Try again! 😊";
    
      const botMessage = {
        id: Date.now() + 1,
        text: botReply,
        sender: 'bot' as const,
        timestamp: Date.now()
      };
    
      setMessages(prev => [...prev, botMessage]);
      setBotMood(Math.random() > 0.5 ? 'excited' : 'happy');
    
      if (data.actions?.length > 0 && onTriggerAction) {
        data.actions.forEach((action: any) => {
          onTriggerAction(action.type, action);
        });
      }
    
    } catch (error: any) {
      setIsTyping(false);
    
      if (error.message?.includes('Too many')) {
        setRateLimitError('Slow down there! 😅 Let\'s chat a bit slower.');
      }
    
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: error.message || "Oops! Something went wrong. Try again! 😊",
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

  const getBotEmoji = () => {
    switch (botMood) {
      case 'excited': return '🤩';
      case 'thinking': return '🤔';
      case 'creative': return '🎨';
      default: return '😊';
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <div className="fixed right-6 bottom-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-16 h-16 rounded-full shadow-2xl transition-all duration-500 transform hover:scale-110 ${
            isOpen 
              ? 'bg-gradient-to-r from-red-500 to-pink-500 rotate-180' 
              : 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-pulse-glow hover:rotate-12'
          }`}
        >
          {isOpen ? (
            <X className="absolute top-1/2 left-1/2 w-8 h-8 text-white transform -translate-x-1/2 -translate-y-1/2" />
          ) : (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="text-2xl animate-bounce">{getBotEmoji()}</div>
            </div>
          )}
          
          {/* Floating notification dots */}
          {!isOpen && (
            <>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"></div>
            </>
          )}
        </button>

        {/* Floating helper text */}
        {!isOpen && (
          <div className="absolute right-0 bottom-20 px-4 py-2 rounded-2xl border shadow-xl backdrop-blur-md bg-white/95 border-white/20 animate-bounce-slow">
            <p className="text-sm font-medium text-gray-800 whitespace-nowrap">
              Need help? Chat with me! 💬
            </p>
            <div className="absolute right-4 top-full w-0 h-0 border-t-8 border-r-8 border-l-8 border-l-transparent border-r-transparent border-t-white/95"></div>
          </div>
        )}
      </div>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 z-40 animate-fade-in-up overflow-hidden">
          {/* Header */}
          <div className="p-4 text-white bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="flex justify-center items-center w-12 h-12 rounded-full bg-white/20 animate-float">
                  <span className="text-2xl">{getBotEmoji()}</span>
                </div>
                <div className="absolute -right-1 -bottom-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-lg font-bold">Prompty</h3>
                <p className="text-sm text-white/80">Your Creative Assistant</p>
              </div>
              <div className="flex-1"></div>
              <div className="flex space-x-1">
                <Sparkles className="w-4 h-4 animate-spin-slow" />
                <Heart className="w-4 h-4 animate-pulse" />
                <Star className="w-4 h-4 animate-bounce" />
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="overflow-y-auto flex-1 p-4 space-y-4 h-80 bg-gradient-to-b from-gray-50/50 to-white/50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-2xl shadow-md transition-all duration-300 hover:scale-105 ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-100'
                  }`}
                >
                  {message.sender === 'bot' && (
                    <div className="flex items-center mb-1 space-x-2">
                      <span className="text-lg">{getBotEmoji()}</span>
                      <span className="text-xs font-medium text-gray-500">Prompty</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed">{message.text}</p>
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="px-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-md">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getBotEmoji()}</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-100 backdrop-blur-md bg-white/80">
            {rateLimitError && (
              <div className="p-2 mb-3 text-sm text-center text-red-600 bg-red-50 rounded-lg border border-red-200">
                {rateLimitError}
              </div>
            )}
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message... 💭"
                maxLength={500}
                className="flex-1 px-4 py-3 text-sm rounded-2xl border border-gray-200 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="flex justify-center items-center w-12 h-12 text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl transition-all duration-300 hover:shadow-lg hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Send className="w-5 h-5" />
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