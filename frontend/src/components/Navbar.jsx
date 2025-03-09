import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ sidebarState }) => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [navbarClass, setNavbarClass] = useState('');
  
  // Update navbar class based on sidebar state
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setNavbarClass('full-width');
    } else if (sidebarState === 'collapsed') {
      setNavbarClass('with-collapsed-sidebar');
    } else if (sidebarState === 'hidden') {
      setNavbarClass('full-width');
    } else {
      setNavbarClass('');
    }
  }, [sidebarState]);
  
  // Also listen for window resize events
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setNavbarClass('full-width');
      } else if (sidebarState === 'collapsed') {
        setNavbarClass('with-collapsed-sidebar');
      } else if (sidebarState === 'hidden') {
        setNavbarClass('full-width');
      } else {
        setNavbarClass('');
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarState]);
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  return (
    <nav className={`navbar ${navbarClass}`}>
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <span className="icon"></span>
            <span></span>
          </Link>
        </div>
        
        <button className="mobile-menu-button" onClick={toggleMenu}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
      
      <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        <Link 
          to="/" 
          className={location.pathname === '/' ? 'active' : ''}
          onClick={() => setMenuOpen(false)}
        >
          Dashboard
        </Link>
        <Link 
          to="/chatbot" 
          className={location.pathname === '/chatbot' ? 'active' : ''}
          onClick={() => setMenuOpen(false)}
        >
          Chatbot
        </Link>
        <Link 
          to="/question-generator" 
          className={location.pathname === '/question-generator' ? 'active' : ''}
          onClick={() => setMenuOpen(false)}
        >
          Questions
        </Link>
        <Link 
          to="/quiz-generator" 
          className={location.pathname === '/quiz-generator' ? 'active' : ''}
          onClick={() => setMenuOpen(false)}
        >
          Quiz
        </Link>
        <Link 
          to="/news-aggregator" 
          className={location.pathname === '/news-aggregator' ? 'active' : ''}
          onClick={() => setMenuOpen(false)}
        >
          News
        </Link>
      </div>
      
      <div className="navbar-profile">
        <button className="profile-button">
          <span className="avatar">U</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;