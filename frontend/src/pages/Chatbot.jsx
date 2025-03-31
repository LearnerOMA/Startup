import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from '../components/ChatMessage';
import DocumentChatbot from './DocumentChatbot';
import './Chatbot.css';

const Chatbot = () => {
  const [chatMode, setChatMode] = useState('general'); // 'general' or 'document'
  const [messages, setMessages] = useState([
    { 
      text: "Hello! I'm your UPSC & MPSC exam assistant. How can I help you today?", 
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages]);

  // useEffect(() => {
  //   // Focus the input field when the component mounts
  //   inputRef.current?.focus();
  // }, []);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;
    
    const userMessage = { 
      text: input, 
      isUser: true,
      timestamp: new Date()
    };
  
    setMessages([...messages, userMessage]);
    setInput('');
    setIsTyping(true);
  
    try {
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ message: userMessage.text })
      });
  
      const data = await response.json();
      const botMessage = { 
        text: data.response || "I'm having trouble understanding. Please try again.", 
        isUser: false,
        timestamp: new Date()
      };
  
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error communicating with backend:', error);
    }
  
    setIsTyping(false);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const handleModeChange = (mode) => {
    setChatMode(mode);
    // Reset messages if switching to general chat
    if (mode === 'general') {
      setMessages([
        { 
          text: "Hello! I'm your UPSC & MPSC exam assistant. How can I help you today?", 
          isUser: false,
          timestamp: new Date()
        }
      ]);
    }
  };

  if (chatMode === 'document') {
    return <DocumentChatbot onSwitchMode={handleModeChange} />;
  }

  return (
    <div className="chatbot">
      <div className="chatbot-header">
        <div className="chatbot-icon">
          <span>📚</span>
        </div>
        <div>
          <h2>AI Exam Assistant</h2>
          <p>Your UPSC & MPSC preparation partner</p>
        </div>
      </div>
      
      {/* Chat Mode Slider */}
      <div className="chat-mode-slider">
        <div className="slider-container">
          <button 
            className={`slider-option ${chatMode === 'general' ? 'active' : ''}`} 
            onClick={() => handleModeChange('general')}
          >
            General Chat
          </button>
          <button 
            className={`slider-option ${chatMode === 'document' ? 'active' : ''}`} 
            onClick={() => handleModeChange('document')}
          >
            Document Chat
          </button>
        </div>
      </div>
      
      <div className="chat-window">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} isUser={msg.isUser} />
        ))}
        
        {isTyping && (
          <div className="typing-indicator">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input">
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Ask me anything about UPSC & MPSC..." 
          onKeyPress={handleKeyPress}
          disabled={isTyping}
          ref={inputRef}
        />
        <button 
          onClick={handleSendMessage}
          disabled={isTyping || input.trim() === ''}
          aria-label="Send message"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      
      <div className="chatbot-suggestions">
        <div className="suggestion-label">Try asking:</div>
        <div className="suggestion-buttons">
          <button onClick={() => handleSuggestionClick("What's the UPSC syllabus?")}>UPSC syllabus</button>
          <button onClick={() => handleSuggestionClick("How to prepare for MPSC?")}>MPSC preparation</button>
          <button onClick={() => handleSuggestionClick("Recommend books for UPSC")}>Recommended books</button>
          <button onClick={() => handleSuggestionClick("Current affairs resources")}>Current affairs</button>
          <button onClick={() => handleSuggestionClick("Previous years papers")}>Previous papers</button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;