import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Loader2, MessageCircle } from 'lucide-react';

const VectorDatabase = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ✅ Send message and get response
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return; // Prevent sending empty or multiple messages

    // User message object
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
    };

    // Add user message to chat
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true); // Block input and wait for response

    try {

        console.log('Sending request to vector database API...' , input);
      // Send request to the vector database API
      const response = await axios.post('http://localhost:5000/get-answer-from-vector-database', {
        question: input,
      });

      console.log('Response from vector database:', response.data);

      // ✅ Prepare AI response with answer and reference
      const aiMessage = {
        id: Date.now(),
        role: 'assistant',
        content: {
          answer: response.data.data.answer || 'No relevant information found.',
          reference: response.data.data.reference || ['No references available'],
        },
      };

      console.log('AI Message:', aiMessage);

      // Add AI response to chat
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error('Error fetching data:', error);

      // Error message in case of failure
      const errorMessage = {
        id: Date.now(),
        role: 'assistant',
        content: 'Oops! Something went wrong. Please try again.',
      };

      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false); // Enable input after response
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-[1000px] mx-auto bg-[#1a1a2e] text-gray-100 shadow-2xl border-x border-gray-800 w-[1000px] mb-[200px]">
      {/* Header */}
      <div className="bg-[#16213e] p-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <MessageCircle className="h-7 w-7 text-indigo-400" />
          <h2 className="text-xl font-bold text-indigo-300">Vectored Chatbot</h2>
        </div>
        <div className="text-gray-400 text-sm">Powered by Vector Database</div>
      </div>

      {/* Chat Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-[#0f1020] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        {/* Show welcome message if no messages */}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 text-center">
            <MessageCircle className="h-16 w-16 mb-4 opacity-30" />
            <p>Start a conversation with your AI assistant</p>
            <p className="text-sm mt-2">Send a message to begin</p>
          </div>
        )}

        {/* Render messages */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl shadow-lg ${
                message.role === 'user'
                  ? 'bg-indigo-700 text-white'
                  : 'bg-[#16213e] text-gray-200 border border-gray-700'
              }`}
            >
              {/* ✅ Check if content is an object with answer and reference */}
              {typeof message.content === 'object' ? (
                <>
                  <p className="mb-2">{message.content.answer}</p>
                  {message.content.reference?.length > 0 && (
                    <div className="mt-2 text-sm text-indigo-300">
                      <p className="font-semibold">References:</p>
                      <ul className="list-disc pl-4">
                        {message.content.reference.map((link, index) => (
                          <li key={index}>
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-400 hover:underline"
                            >
                              {link}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                // Fallback for regular string messages
                <p>{message.content}</p>
              )}
            </div>
          </div>
        ))}

        {/* Show loading indicator while fetching */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#16213e] border border-gray-700 p-3 rounded-2xl flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
              <span className="text-gray-400">Fetching data...</span>
            </div>
          </div>
        )}

        {/* Auto-scroll anchor */}
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
          disabled={isLoading} // Block input while waiting for response
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

export default VectorDatabase;
