import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from '../components/ChatMessage';
import './DocumentChatbot.css';

const DocumentChatbot = ({ onSwitchMode }) => {
  const [messages, setMessages] = useState([
    { 
      text: "Hello! I'm your document chat assistant. Please upload a document (PDF, DOCX, PPTX, or TXT) to get started.", 
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [document, setDocument] = useState(null);
  const [documentName, setDocumentName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

  useEffect(() => {
    // Focus the input field when the component mounts
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async () => {
    if (input.trim() === '' || !document) return;
    
    const userMessage = { 
      text: input, 
      isUser: true,
      timestamp: new Date()
    };
  
    setMessages([...messages, userMessage]);
    setInput('');
    setIsTyping(true);
  
    try {
      // Create form data to send the document and the query
      const formData = new FormData();
      formData.append('document_id', document.id); // Send document ID instead of the file again
      formData.append('message', userMessage.text);

      const response = await fetch('http://localhost:5000/document-chat', {
        method: 'POST',
        body: formData
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
      
      const errorMessage = {
        text: "Sorry, I encountered an error processing your request. Please try again.",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    }
  
    setIsTyping(false);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop().toLowerCase();
    const allowedExtensions = ['pdf', 'docx', 'pptx', 'txt'];

    if (!allowedExtensions.includes(fileExtension)) {
      const errorMessage = {
        text: "Sorry, only PDF, DOCX, PPTX, and TXT files are supported.",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
      return;
    }

    setIsUploading(true);
    setDocumentName(file.name);

    const uploadMessage = {
      text: `Uploading document: ${file.name}...`,
      isUser: false,
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, uploadMessage]);

    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await fetch('http://localhost:5000/upload-document', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        setDocument(data.document);
        
        const successMessage = {
          text: `Document "${file.name}" uploaded successfully! You can now ask questions about its content.`,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prevMessages => [...prevMessages, successMessage]);
      } else {
        const errorMessage = {
          text: `Error uploading document: ${data.message}`,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      
      const errorMessage = {
        text: "Sorry, I encountered an error uploading your document. Please try again.",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    }

    setIsUploading(false);
  };

  return (
    <div className="document-chatbot">
      <div className="chatbot-header">
        <div className="chatbot-icon">
          <span>📄</span>
        </div>
        <div>
          <h2>Document Chat Assistant</h2>
          <p>Ask questions about your uploaded documents</p>
        </div>
      </div>
      
      {/* Chat Mode Slider */}
      <div className="chat-mode-slider">
        <div className="slider-container">
          <button 
            className={`slider-option`} 
            onClick={() => onSwitchMode('general')}
          >
            General Chat
          </button>
          <button 
            className={`slider-option active`}
          >
            Document Chat
          </button>
        </div>
      </div>
      
      {/* Document Upload Section */}
      <div className="document-upload-section">
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          accept=".pdf,.docx,.pptx,.txt"
        />
        
        <button 
          onClick={handleFileSelect}
          disabled={isUploading}
          className="upload-button"
        >
          {isUploading ? 'Uploading...' : document ? 'Change Document' : 'Upload Document'}
        </button>
        
        {document && (
          <div className="document-info">
            <span className="document-icon">📄</span>
            <span className="document-name">{documentName}</span>
          </div>
        )}
      </div>
      
      <div className="chat-window">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} isUser={msg.isUser}/>
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
          placeholder={document ? "Ask me about the document..." : "Upload a document first..."}
          onKeyPress={handleKeyPress}
          disabled={isTyping || !document}
          ref={inputRef}
        />
        <button 
          onClick={handleSendMessage}
          disabled={isTyping || input.trim() === '' || !document}
          aria-label="Send message"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      
      {document && (
        <div className="chatbot-suggestions">
          <div className="suggestion-label">Try asking:</div>
          <div className="suggestion-buttons">
            <button onClick={() => setInput("Summarize this document")}>Summarize document</button>
            <button onClick={() => setInput("What are the key points?")}>Key points</button>
            <button onClick={() => setInput("Explain the most important concept")}>Important concepts</button>
            <button onClick={() => setInput("What is this document about?")}>Document topic</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentChatbot;