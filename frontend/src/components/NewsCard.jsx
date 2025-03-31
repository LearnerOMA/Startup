import React, { useState } from 'react';
import './NewsCard.css';
import axios from 'axios';

const NewsCard = ({ article }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [translatedText, setTranslatedText] = useState(article.Article_Summary);
  const [showLanguageOptions, setShowLanguageOptions] = useState(false);
  //const [translated , setTranslated] = useState(flase);   
  const languages = [
    { name: "Hindi", code: "hindi" },
    { name: "Marathi", code: "marathi" },
    { name: "Gujarati", code: "gujarati" },
    { name: "Telugu", code: "telugu" },
    { name: "Tamil", code: "tamil" }
  ];
  // const handleReadMore = () => {
  //   //setIsExpanded(!isExpanded);
    
  //   // Scroll to the expanded content when opening
  //   // if (!isExpanded) {
  //   //   setTimeout(() => {
  //   //     // const element = document.getElementById(`full-content-${article.id || 'default'}`);
  //   //     const element = article.Article_Summary;
  //   //     if (element) {
  //   //       element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  //   //     }
  //   //   }, 100);
  //   // }
  //   console.log("lik :" , article.Link);
  //   if (article.url) {
  //     window.open(article.Link, "_blank");
  //      // Open in a new tab
  //      console.log("lik :" , article.Link);
  //   } else {
  //     alert("No article URL available");
  //   }

  // };

  const handleTranslate = async (language) => {
    try {
      const response = await axios.post('http://localhost:5000/translate', {
        text: article.Article_Summary,
        language: language
      });

      setTranslatedText(response.data.translated_text);
      setShowLanguageOptions(false); // Hide options after selection
    } catch (error) {
      console.error("Error translating text:", error);
    }
  };

  const handleReadMore = () => {
    if (article.Link) {
      window.open(article.Link, "_blank"); // Ensure correct property
      console.log("Link:", article.Link);
    } else {
      alert("No article URL available");
    }
  };

  const handleReadAloud = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(article.Article_Summary || "No content available.");
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-Speech not supported in this browser.");
    }
  };
  

  // Fallback image - using a simple div with background color instead of external URL
  const renderImage = () => {
    if (article.imageUrl) {
      return (
        <img src={article.imageUrl} alt={article.title} />
      );
    } else {
      return (
        <div style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#2a2a2a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666',
          fontSize: '1.2rem'
        }}>
          {article.Headline || 'News Article'}
        </div>
      );
    }
  };

  return (
    <div className="news-card-container">
      <div className="news-card">
        <div className="news-image">
          {renderImage()}
          
          <div className="news-toolbar">
            <div className="toolbar-icon" onClick={() => setShowLanguageOptions(!showLanguageOptions)} title="Translate">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4.545 6.714 4.11 8H3l1.862-5h1.284L8 8H6.833l-.435-1.286H4.545zm1.634-.736L5.5 3.956h-.049l-.679 2.022H6.18z"/>
                <path d="M0 2a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3H2a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2zm7.138 9.995c.193.301.402.583.63.846-.748.575-1.673 1.001-2.768 1.292.178.217.451.635.555.867 1.125-.359 2.08-.844 2.886-1.494.777.665 1.739 1.165 2.93 1.472.133-.254.414-.673.629-.89-1.125-.253-2.057-.694-2.82-1.284.681-.747 1.222-1.651 1.621-2.757H14v-.718h-2.375c-.081-.295-.141-.657-.182-1.054H13.5v-.719h-2.14c.041-.995.195-1.912.463-2.756H9.957c-.271.855-.376 1.755-.375 2.756H6.752c-.001-1-.106-1.901-.378-2.756H4.51c.27.856.425 1.774.467 2.756H2.5v.719h2.57c-.04.397-.1.759-.182 1.054H2.5v.718h2.338c.18.554.433 1.059.761 1.517-1.179.755-2.165 1.084-2.165 1.084v.755c.298-.172 1.238-.436 2.433-1.272.566.574 1.246 1.055 2.043 1.408.377-.66.61-.971.696-1.173-.777-.304-1.409-.762-1.9-1.328.59-.608 1.061-1.315 1.415-2.1H12.5v.718h-1.287z"/>
              </svg>
            </div>
            {showLanguageOptions && (
              <div className="absolute top-10 right-4 flex flex-col bg-transparent backdrop-blur-lg border border-white/50 rounded-lg p-2 shadow-md">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    className="px-4 py-2 text-white text-left hover:bg-white/10 rounded transition"
                    onClick={() => handleTranslate(lang.code)}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
            
            <div className="toolbar-icon" onClick={handleReadAloud} title="Read Aloud">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"/>
                <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z"/>
                <path d="M8.707 11.182A4.486 4.486 0 0 0 10.025 8a4.486 4.486 0 0 0-1.318-3.182L8 5.525A3.489 3.489 0 0 1 9.025 8 3.49 3.49 0 0 1 8 10.475l.707.707zM6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="news-content">
          <h2 className="news-title">{article.title}</h2>
          <p className="news-summary">{translatedText}</p>
          
          {/* <div className="news-meta">
            <span className="news-category">{article.category || 'General'}</span>
            <span className="news-date">{article.date || 'Today'}</span>
          </div> */}
          
          <button onClick={() => window.open(article.Link, "_blank")}>
          Read More
          </button>
        </div>
        
        <div id={`full-content-${article.id || 'default'}`} className={`news-full-content ${isExpanded ? 'expanded' : ''}`}>
          <div className="full-content-inner">
            {article.content ? (
              <>
                {article.content.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </>
            ) : (
              <p>No additional content available for this article.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;