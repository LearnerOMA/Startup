import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Loader2, MessageCircle } from 'lucide-react';
import ChatMessage from '../components/ChatMessage';

const FineTunedChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    // Validate input
    if (!input.trim()) return;

    // Prepare user message
    const userMessage = {
      id: Date.now(),
      role: 'user',
      text: input,
      timestamp: new Date().toISOString()
    };

    // Create new messages array with the user's message
    const updatedMessages = [...messages, userMessage];
    
    // Update UI immediately with user message
    setMessages(updatedMessages);
    setInput(''); // Clear input
    setIsLoading(true);

    try {
      // Send request to backend
      const response = await axios.post('http://localhost:5000/fine-tuned-chat', {
        messages: updatedMessages.map(msg => ({
          role: msg.role,
          content: msg.text
        }))
      });

      // Prepare AI response
      const aiMessage = {
        id: Date.now(),
        role: 'assistant',
        text: response.data.message,
        timestamp: new Date().toISOString()
      };

      // Update messages with AI response
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error('Error in fine-tuned chat:', error);
      
      // Error handling message
      const errorMessage = {
        id: Date.now(),
        role: 'assistant',
        text: 'Oops! Something went wrong. Please try again.',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-[1000px] mx-auto bg-[#1a1a2e] text-gray-100 shadow-2xl border-x border-gray-800 w-[1000px] mb-[200px]">
      {/* Chat Header */}
      <div className="bg-[#16213e] p-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <MessageCircle className="h-7 w-7 text-indigo-400" />
          <h1 className="text-xl font-bold text-indigo-300">Fine-Tuned AI Chatbot</h1>
        </div>
        <div className="text-gray-400 text-sm">Powered by AI</div>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-[#0f1020] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 text-center">
            <MessageCircle className="h-16 w-16 mb-4 opacity-30" />
            <p>Start a conversation with your AI assistant</p>
            <p className="text-sm mt-2">Send a message to begin</p>
          </div>
        )}

        {messages.map((message) => (
          <ChatMessage 
            key={message.id}
            message={message}
            isUser={message.role === 'user'}
          />
        ))}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#16213e] border border-gray-700 p-3 rounded-2xl flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
              <span className="text-gray-400">Thinking...</span>
            </div>
          </div>
        )}

        {/* Scroll to bottom ref */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-[#16213e] p-4 border-t border-gray-700 flex space-x-2 items-center">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          className="flex-grow p-2 bg-[#0f1020] text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button 
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="bg-indigo-700 text-white p-2 rounded-lg hover:bg-indigo-600 disabled:opacity-50 flex items-center justify-center transition-colors duration-300"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default FineTunedChatbot;