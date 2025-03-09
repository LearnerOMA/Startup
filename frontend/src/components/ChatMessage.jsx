import React from 'react';
import './ChatMessage.css';

const ChatMessage = ({ message, isUser }) => {
  return (
    <div className={`chat-message ${isUser ? 'user-message' : 'bot-message'}`}>
      <div className="message-avatar">
        {isUser ? 'U' : 'A'}
      </div>
      <div className="message-content">
        <div className="message-text">{message.text}</div>
        {message.timestamp && (
          <div className="message-time">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;