import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SidebarContext } from '../App'; // Make sure this path is correct
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const { sidebarState, setSidebarState } = useContext(SidebarContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Determine if sidebar is collapsed
  const isCollapsed = sidebarState === 'collapsed';
  
  // Close mobile sidebar when location changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);
  
  // Close mobile sidebar when window is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const mainMenuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/chatbot', label: 'Chatbot', icon: '💬' },
    { path: '/data-based-chatbot', label: 'Fine-Tuned Chatbot', icon: '🤖' },
    { path: '/question-generator', label: 'Questions', icon: '❓' },
    { path: '/quiz-generator', label: 'Quiz', icon: '📝' },
    { path: '/quiz-history', label: 'History', icon: '📜' },
    { path: '/news-aggregator', label: 'News', icon: '📰' },
  ];
  
  const supportMenuItems = [
    { path: '/resources', label: 'Resources', icon: '📚' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
    { path: '/help', label: 'Help & Support', icon: '🔍' },
  ];

  const toggleSidebar = () => {
    setSidebarState(isCollapsed ? 'expanded' : 'collapsed');
  };
  
  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      <div 
        className={`sidebar-overlay ${mobileOpen ? 'active' : ''}`} 
        onClick={() => setMobileOpen(false)}
      ></div>
      
      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="toggle-sidebar" onClick={toggleSidebar}>
          {isCollapsed ? '→' : '←'}
        </div>
        
        <div className="sidebar-header">
          <span className="logo-icon"></span>
          <h3></h3>
        </div>
        
        <div className="sidebar-menu">
          <div className="menu-section">
            <div className="menu-section-title">Main</div>
            {mainMenuItems.map(item => (
              <Link 
                key={item.path}
                to={item.path} 
                className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
              </Link>
            ))}
          </div>
          
          <div className="menu-section">
            <div className="menu-section-title">Support</div>
            {supportMenuItems.map(item => (
              <Link 
                key={item.path}
                to={item.path} 
                className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
        
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">U</div>
            <div className="user-info">
              <h4>User</h4>
              <p>Student</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;