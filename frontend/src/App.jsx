import React, { useState, createContext } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Chatbot from './pages/Chatbot';
import FineTunedChatbot from './pages/FineTunedChatbot';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import QuestionGenerator from './pages/QuestionGenerator';
import NewsAggregator from './pages/NewsAggregator';
import Footer from './components/Footer';
import VectorDatabase from './pages/vectorDatabase';
import DataBasedChatbot from './pages/DataBasedChatbot';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import QuizHistory from './pages/QuizHistory'; 
import QuizGenerator from './pages/QuizGenerator';
import './App.css';
import './pages/global.css';

export const SidebarContext = createContext();

// Create a layout component that handles the footer logic
const AppLayout = ({ children }) => {
  const location = useLocation();
  const [sidebarState, setSidebarState] = useState('expanded');
  // Only show footer on non-Home routes
  // const showFooter = location.pathname !== "/";
    // Don't show sidebar, navbar, or footer on login page
    const isLoginPage = location.pathname === "/login";
    // Only show footer on routes that are not Home or Login
    const showFooter = location.pathname !== "/" && location.pathname !== "/login";
  return (
    <div className="main-content">
      <div className="page-container">
        {children}
      </div>
      {showFooter && <Footer />}
    </div>
  );
};

function App() {
  const [sidebarState, setSidebarState] = useState('expanded');
  
  return (
    <Router>
      <SidebarContext.Provider value={{ sidebarState, setSidebarState }}>
        <div className={`app-container ${sidebarState !== 'hidden' ? 'with-sidebar' : ''} ${sidebarState === 'collapsed' ? 'with-collapsed-sidebar' : ''}`}>
          {sidebarState !== 'hidden' && <Sidebar />}
          <Navbar sidebarState={sidebarState} />
          <AppLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/chatbot" element={<Chatbot />} />
              <Route path="/fine-tuned-chatbot" element={<FineTunedChatbot />} />
              <Route path="/vector-database-chatbot" element={<VectorDatabase />} />
              <Route path="/question-generator" element={<QuestionGenerator />} />
              <Route path="/quiz-generator" element={<QuizGenerator />} />
              <Route path="/quiz-history" element={<QuizHistory />} /> {/* Add the QuizHistory route */}
              <Route path='/login' element={<LoginPage />} />
              <Route path='/SignUp' element={<SignupPage />} />
              <Route path="/news-aggregator" element={<NewsAggregator />} />
              <Route path="/data-based-chatbot" element={<DataBasedChatbot />} />
              {/* Support routes */}
              <Route path="/resources" element={<div>Resources Page</div>} />
              <Route path="/settings" element={<div>Settings Page</div>} />
              <Route path="/help" element={<div>Help & Support Page</div>} />
              
              {/* Footer link routes */}
              <Route path="/syllabus" element={<div>Exam Syllabus Page</div>} />
              <Route path="/previous-papers" element={<div>Previous Papers Page</div>} />
              <Route path="/study-material" element={<div>Study Material Page</div>} />
              <Route path="/current-affairs" element={<div>Current Affairs Page</div>} />
              <Route path="/privacy-policy" element={<div>Privacy Policy Page</div>} />
              <Route path="/terms-of-service" element={<div>Terms of Service Page</div>} />
            </Routes>
          </AppLayout>
        </div>
      </SidebarContext.Provider>
    </Router>
  );
}

export default App;