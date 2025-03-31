import React, { useState } from 'react';
import Chatbot from './Chatbot';
import VectorDatabase from './VectorDatabase';
import FineTunedChatbot from './FineTunedChatbot';
import './DataBasedChatbot.css'; // Fixed import syntax

const DataBasedChatbot = () => {
  const [activeTab, setActiveTab] = useState('fine-tuned'); // 'general', 'fine-tuned', or 'vector-db'

  return (
    <div className="chatbot-container">
      {/* Tab Navigation */}
      <div className="chat-mode-slider">
        <div className="slider-container">
          {/* <button
            className={`slider-option ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            General Chat
          </button> */}
          <button
            className={`slider-option ${activeTab === 'fine-tuned' ? 'active' : ''}`}
            onClick={() => setActiveTab('fine-tuned')}
          >
            Fine-Tuned Chat
          </button>
          <button
            className={`slider-option ${activeTab === 'vector-db' ? 'active' : ''}`}
            onClick={() => setActiveTab('vector-db')}
          >
            Vector Powered Chat
          </button>
        </div>
      </div>

      {/* Render the appropriate component based on active tab */}
      <div className="chatbot-content">
        {/* {activeTab === 'general' && <Chatbot />} */}
        {activeTab === 'fine-tuned' && <FineTunedChatbot />}
        {activeTab === 'vector-db' && <VectorDatabase />}
      </div>
    </div>
  );
};

export default DataBasedChatbot;
