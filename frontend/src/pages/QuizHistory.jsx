import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './QuizHistory.css';

const QuizHistory = () => {
  const [quizHistory, setQuizHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedQuiz, setExpandedQuiz] = useState(null);
  
  // API URL - change this to match your Flask server
  const API_URL = 'http://127.0.0.1:5000';

  useEffect(() => {
    const fetchQuizHistory = async () => {
      try {
        // Get the current user ID (adjust based on your auth method)
        const userId = localStorage.getItem('userId') || 'default-user';
        
        setLoading(true);
        const response = await fetch(`${API_URL}/get-quiz-history?userId=${userId}`);
        const data = await response.json();

        if (data.status === 'success') {
          setQuizHistory(data.quizzes || []);
        } else {
          console.error('Failed to fetch quiz history:', data.message);
          setError('Failed to load quiz history. Please try again later.');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quiz history:', error);
        setError('Failed to load quiz history. Please try again later.');
        setLoading(false);
      }
    };

    fetchQuizHistory();
  }, []);

  const handleWatchVideo = (videoUrl) => {
    if (videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'))) {
      window.open(videoUrl, '_blank');
    } else {
      alert('Invalid YouTube URL');
    }
  };

  const handleViewQuiz = (quizId) => {
    window.location.href = `/quiz/${quizId}`;
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        const response = await fetch(`${API_URL}/delete-quiz/${quizId}`, {
          method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
          setQuizHistory(quizHistory.filter(quiz => quiz._id !== quizId));
        } else {
          setError('Failed to delete quiz. Please try again.');
        }
      } catch (err) {
        console.error('Error deleting quiz:', err);
        setError('Failed to delete quiz. Please try again.');
      }
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Unknown date';
    }
  };

  const toggleExpandQuiz = async (quizId) => {
    if (expandedQuiz === quizId) {
      setExpandedQuiz(null);
      return;
    }
    
    try {
      // Fetch the complete quiz details including questions
      const response = await fetch(`${API_URL}/get-quiz?id=${quizId}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        // Update the quiz in history with full details
        const updatedHistory = quizHistory.map(quiz => 
          quiz._id === quizId ? { ...quiz, ...data.quiz } : quiz
        );
        setQuizHistory(updatedHistory);
        setExpandedQuiz(quizId);
      } else {
        console.error('Failed to fetch quiz details:', data.message);
      }
    } catch (error) {
      console.error('Error fetching quiz details:', error);
    }
  };

  const formatYoutubeUrl = (url) => {
    if (!url) return "No URL provided";
    if (url.length > 40) {
      return url.substring(0, 37) + "...";
    }
    return url;
  };

  if (loading) {
    return (
      <div className="quiz-history-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your quiz history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-history-container">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-history-container">
      <div className="history-header">
        <h1>Your Quiz History</h1>
        <p>Review and continue your previously saved quizzes</p>
      </div>

      {quizHistory.length === 0 ? (
        <div className="empty-history">
          <div className="empty-icon">📋</div>
          <h3>No quizzes found</h3>
          <p>You haven't saved any quizzes yet. Generate a quiz and save it to see it here!</p>
          <Link to="/quiz-generator" className="create-quiz-btn">Create a Quiz</Link>
        </div>
      ) : (
        <div className="quiz-history-list">
          {quizHistory.map((quiz) => (
            <div key={quiz._id} className="quiz-history-card">
              <div className="quiz-header">
                <div className="quiz-thumbnail">
                  <div className="thumbnail-placeholder">
                    <span>📝</span>
                  </div>
                </div>
                
                <div className="quiz-details">
                  <h3>{quiz.quiz_title || 'Quiz ' + quiz._id.substring(0, 6)}</h3>
                  <div className="quiz-meta">
                    <div className="meta-item">
                      <span className="meta-label">Created:</span>
                      <span className="meta-value">{formatDate(quiz.date_taken || quiz.timestamp)}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">YouTube:</span>
                      <span className="meta-value youtube-link" title={quiz.YoutubeLink}>
                        {formatYoutubeUrl(quiz.YoutubeLink)}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Questions:</span>
                      <span className="meta-value">{quiz.num_questions || "N/A"}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Difficulty:</span>
                      <span className="meta-value">{quiz.difficulty || "N/A"}</span>
                    </div>
                  </div>
                </div>
                
                <div className="quiz-actions">
                  <button 
                    className="video-btn" 
                    onClick={() => handleWatchVideo(quiz.YoutubeLink)}
                    title="Watch original video"
                  >
                    <span className="action-icon">▶️</span>
                  </button>
                  <button 
                    className="quiz-btn" 
                    onClick={() => handleViewQuiz(quiz._id)}
                    title={quiz.completedAt ? "Review quiz" : "Continue quiz"}
                  >
                    <span className="action-icon">{quiz.completedAt ? '📋' : '▶️'}</span>
                  </button>
                  <button 
                    className="expand-btn" 
                    onClick={() => toggleExpandQuiz(quiz._id)}
                    title="View quiz details"
                  >
                    <span className="action-icon">{expandedQuiz === quiz._id ? '🔼' : '🔽'}</span>
                  </button>
                  <button 
                    className="delete-btn" 
                    onClick={() => handleDeleteQuiz(quiz._id)}
                    title="Delete quiz"
                  >
                    <span className="action-icon">🗑️</span>
                  </button>
                </div>
              </div>
              
              {expandedQuiz === quiz._id && (
                <div className="quiz-expanded-details">
                  <div className="quiz-question-count">
                    <h4>Questions ({quiz.num_questions || "Unknown"})</h4>
                  </div>
                  
                  {quiz.questions ? (
                    <div className="quiz-questions-list">
                      {quiz.questions.map((question, index) => (
                        <div key={index} className="question-preview">
                          <p className="question-text">{index + 1}. {question.question}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="quiz-questions-placeholder">
                      <p>Question details not available. Click "Continue quiz" to view the complete quiz.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizHistory;