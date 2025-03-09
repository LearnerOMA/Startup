import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4>UPSC & MPSC Exam Assistant</h4>
          <p>Your comprehensive preparation platform for civil services examinations</p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/chatbot">Chatbot</Link></li>
            <li><Link to="/question-generator">Question Generator</Link></li>
            <li><Link to="/quiz-generator">Quiz Generator</Link></li>
            <li><Link to="/news-aggregator">News Aggregator</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Resources</h4>
          <ul className="footer-links">
            <li><Link to="/syllabus">Exam Syllabus</Link></li>
            <li><Link to="/previous-papers">Previous Papers</Link></li>
            <li><Link to="/study-material">Study Material</Link></li>
            <li><Link to="/current-affairs">Current Affairs</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Connect With Us</h4>
          <div className="social-links">
            <a href="#" aria-label="Facebook" className="social-icon">
              <i className="facebook-icon">f</i>
            </a>
            <a href="#" aria-label="Twitter" className="social-icon">
              <i className="twitter-icon">t</i>
            </a>
            <a href="#" aria-label="Instagram" className="social-icon">
              <i className="instagram-icon">i</i>
            </a>
            <a href="#" aria-label="YouTube" className="social-icon">
              <i className="youtube-icon">y</i>
            </a>
          </div>
          <p className="contact-email">support@upscmpscassistant.com</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {currentYear} UPSC & MPSC Exam Assistant. All rights reserved.</p>
        <div className="footer-bottom-links">
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms-of-service">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;