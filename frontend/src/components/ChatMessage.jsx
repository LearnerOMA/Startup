import React from 'react';
import './ChatMessage.css';
import PDFViewerWithHighlights from './PDFViewerWithHighlights';
import { useState } from 'react';

const ChatMessage = ({ message, isUser }) => {
  const [showHighlights, setShowHighlights] = useState(false);
  
  const processText = (text) => {
    // Split by newlines
    const lines = text.split('\n');
    
    // Process each line and create appropriate elements
    return lines.map((line, index) => {
      // Check if the line starts with a bullet point marker
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('*') && !line.trim().startsWith('**');
      
      // Remove bullet markers for non-bullet points
      let processedLine = isBullet ? line : line.replace(/^[\s•*]+(?!\*)/g, '');
      
      // Process bold text (text between ** **)
      processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Return paragraph with appropriate class and parsed HTML
      return (
        <p 
          key={index} 
          className={`message-line ${isBullet ? 'bullet-point' : ''}`}
          dangerouslySetInnerHTML={{ __html: processedLine }}
        />
      );
    });
  };

  return (
    <div className={`chat-message ${isUser ? 'user-message' : 'bot-message'}`}>
      <div className="message-avatar">
        {isUser ? 'U' : 'A'}
      </div>
      <div className="message-content">
        <div className="message-text">{processText(message.text)}</div>
        {message.timestamp && (
          <div className="message-time">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}

        {/* Show "View References" button only if available */}
        {!isUser && message.references && message.fileUrl && (
          <>
            <button
              className="mt-2 bg-blue-500 text-white py-1 px-3 rounded text-sm"
              onClick={() => setShowHighlights(!showHighlights)}
            >
              {showHighlights ? 'Hide References' : 'View References in PDF'}
            </button>

            {showHighlights && (
              <PDFViewerWithHighlights
                fileUrl={message.fileUrl}
                references={message.references}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
