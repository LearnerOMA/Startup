import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer'; // Fixed import path
import './Home.css';

const Home = () => {
  const [greeting, setGreeting] = useState('');
  const [activeCard, setActiveCard] = useState(null);
  const [tipOfTheDay, setTipOfTheDay] = useState('');

  // Tips for UPSC/MPSC aspirants
  const examTips = [
    "Focus on NCERT books first for a strong foundation",
    "Practice previous years' question papers regularly",
    "Make short notes for quick revision",
    "Stay updated with current affairs daily",
    "Develop answer writing skills through regular practice",
    "Create a realistic study timetable and stick to it",
    "Join study groups to discuss complex topics",
    "Take regular breaks to avoid burnout"
  ];

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
    
    // Set random tip of the day
    const randomTip = examTips[Math.floor(Math.random() * examTips.length)];
    setTipOfTheDay(randomTip);

    // Animation for cards on load
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('card-visible');
      }, 100 * index);
    });
  }, []);

  const features = [
    {
      id: 1,
      title: "Chatbot",
      description: "Get instant answers to your exam preparation questions",
      path: "/chatbot",
      icon: "💬"
    },
    {
      id: 2,
      title: "Question Generator",
      description: "Practice with custom exam-style questions based on your needs",
      path: "/question-generator",
      icon: "❓"
    },
    {
      id: 3,
      title: "Quiz Generator",
      description: "Test your knowledge with daily topical quizzes",
      path: "/quiz-generator",
      icon: "📝"
    },
    {
      id: 4,
      title: "News Aggregator",
      description: "Stay updated with exam-relevant current affairs",
      path: "/news-aggregator",
      icon: "📰"
    }
  ];

  return (
    <div className="home-container">
      <div className="home">
        <div className="hero-section">
          <h1>PrepMate</h1>
          <h2>{greeting}, Aspirant!</h2>
          <p className="tagline">Your intelligent companion for civil services exam preparation</p>
          
          <div className="tip-container">
            <div className="tip-label">Tip of the day:</div>
            <div className="tip-content">{tipOfTheDay}</div>
          </div>
        </div>

        <div className="dashboard-cards">
          {features.map((feature) => (
            <div 
              className="card" 
              key={feature.id}
              onMouseEnter={() => setActiveCard(feature.id)}
              onMouseLeave={() => setActiveCard(null)}
            >
              <div className="card-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <Link 
                to={feature.path} 
                className={`card-button ${activeCard === feature.id ? 'active' : ''}`}
              >
                Start Now
                <span className="arrow-icon">→</span>
              </Link>
            </div>
          ))}
        </div>

        <div className="motivation-section">
          <h3>Success comes to those who persevere</h3>
          <p>Join thousands of successful aspirants who use PrepMate daily</p>
        </div>
      </div>
      
      {/* Footer is already included in App.js for all pages */}
    </div>
  );
}

export default Home;