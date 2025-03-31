import React, { useState, useEffect } from 'react';
import './QuizGenerator.css';
import { Link, useNavigate } from 'react-router-dom';

const QuizGenerator = () => {
  const [urlOrTopic, setUrlOrTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [questionTypes, setQuestionTypes] = useState(['multiple_choice']);
  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAnswers, setShowAnswers] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [savedQuizId, setSavedQuizId] = useState(null);
  const [quizHistory, setQuizHistory] = useState([]);
  
  // Add navigate hook for redirection
  const navigate = useNavigate();

  // API URL - change this to match your Flask server
  const API_URL = 'http://127.0.0.1:5000';

  // Fetch quiz history when component mounts
  useEffect(() => {
    fetchQuizHistory();
  }, []);

  const fetchQuizHistory = async () => {
    try {
      // Get the current user ID (adjust based on your auth method)
      const userId = localStorage.getItem('userId') || 'default-user';
      
      const response = await fetch(`${API_URL}/get-quiz-history?userId=${userId}`);
      const data = await response.json();

      if (data.status === 'success') {
        setQuizHistory(data.quizzes || []);
      } else {
        console.error('Failed to fetch quiz history:', data.message);
      }
    } catch (error) {
      console.error('Error fetching quiz history:', error);
    }
  };

  const handleQuestionTypeChange = (type) => {
    if (questionTypes.includes(type)) {
      // Remove type if already selected
      setQuestionTypes(questionTypes.filter(item => item !== type));
    } else {
      // Add type if not already selected
      setQuestionTypes([...questionTypes, type]);
    }
  };

  const generateQuiz = async () => {
    if (questionTypes.length === 0) {
      setError('Please select at least one question type');
      return;
    }

    setLoading(true);
    setError('');
    setQuiz([]);
    setIsSaved(false);
    setSavedQuizId(null);

    // Auto-generate a title based on topic
    setQuizTitle(`Quiz on ${urlOrTopic.length > 30 ? urlOrTopic.substring(0, 30) + '...' : urlOrTopic}`);

    try {
      const response = await fetch(`${API_URL}/generate-quiz-with-preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url_or_topic: urlOrTopic,
          num_questions: parseInt(numQuestions),
          difficulty: difficulty,
          question_types: questionTypes
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        // Handle different quiz formats
        if (Array.isArray(data.quiz)) {
          setQuiz(data.quiz);
        } else if (typeof data.quiz === 'string') {
          // Parse string format quiz (from YouTube transcript generator)
          const parsedQuiz = parseStringQuiz(data.quiz);
          setQuiz(parsedQuiz);
        }
        
        // If the quiz was automatically saved by the backend
        if (data.quiz_id) {
          setIsSaved(true);
          setSavedQuizId(data.quiz_id);
        }
      } else {
        setError(data.message || 'Failed to generate quiz');
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      setError('An error occurred while connecting to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to parse string format quiz (from YouTube transcript generator)
  const parseStringQuiz = (quizString) => {
    const quizLines = quizString.split('\n');
    const parsedQuiz = [];
    let currentQuestion = null;
    
    for (let line of quizLines) {
      line = line.trim();
      
      if (/^\d+\./.test(line)) {
        // New question
        if (currentQuestion) {
          parsedQuiz.push(currentQuestion);
        }
        currentQuestion = {
          question: line,
          options: [],
          correct_answer: '',
          type: 'multiple_choice'
        };
      } else if (currentQuestion && /^[a-d]\)/.test(line)) {
        // Option
        currentQuestion.options.push(line);
      } else if (currentQuestion && line.startsWith('Correct Answer:')) {
        // Answer
        currentQuestion.correct_answer = line.substring('Correct Answer:'.length).trim();
      }
    }
    
    // Add the last question
    if (currentQuestion) {
      parsedQuiz.push(currentQuestion);
    }
    
    return parsedQuiz;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generateQuiz();
  };

  const saveQuiz = async () => {
    try {
      // Get the current user ID (you may need to adjust this based on your auth method)
      const userId = localStorage.getItem('userId') || 'default-user';
      
      // Only save if not already saved or if title was updated
      if (!isSaved || savedQuizId === null) {
        const response = await fetch(`${API_URL}/save-quiz`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: userId,
            quizId: Date.now().toString(), // Generate a simple ID 
            YoutubeLink: urlOrTopic, // Using the URL/topic as the YouTube link
            title: quizTitle,
            difficulty: difficulty,
            question_types: questionTypes,
            num_questions: numQuestions
          })
        });

        const data = await response.json();

        if (data.status === 'success') {
          setIsSaved(true);
          setSavedQuizId(data.id);
          alert("Quiz saved successfully!");
          // Refresh quiz history
          fetchQuizHistory();
        } else {
          setError(data.message || 'Failed to save quiz');
        }
      } else {
        // Update existing quiz with new title
        const response = await fetch(`${API_URL}/update-quiz/${savedQuizId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            quiz_title: quizTitle
          })
        });

        const data = await response.json();

        if (data.status === 'success') {
          alert("Quiz updated successfully!");
          // Refresh quiz history
          fetchQuizHistory();
        } else {
          setError(data.message || 'Failed to update quiz');
        }
      }
    } catch (error) {
      console.error('Error saving quiz:', error);
      setError('An error occurred while saving the quiz. Please try again.');
    }
  };

  const loadQuiz = async (quizId) => {
    try {
      const response = await fetch(`${API_URL}/get-quiz?id=${quizId}`);
      const data = await response.json();

      if (data.status === 'success') {
        setUrlOrTopic(data.quiz.YoutubeLink || '');
        setDifficulty(data.quiz.difficulty || 'medium');
        setQuestionTypes(data.quiz.question_types || ['multiple_choice']);
        setNumQuestions(data.quiz.num_questions || 5);
        setQuizTitle(data.quiz.quiz_title || '');
        setIsSaved(true);
        setSavedQuizId(data.quiz._id);
      } else {
        setError(data.message || 'Failed to load quiz');
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
      setError('An error occurred while loading the quiz. Please try again.');
    }
  };

  // Replace toggleHistory with navigation function
  const goToHistory = () => {
    navigate('/quiz-history');
  };

  return (
    <div className="quiz-generator">
      <h2>Generate a Quiz</h2>
      
      <div className="quiz-buttons">
        <button 
          onClick={goToHistory} 
          className="history-button"
        >
          View Quiz History
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="urlOrTopic">YouTube URL</label>
          <input
            type="text"
            id="urlOrTopic"
            value={urlOrTopic}
            onChange={(e) => setUrlOrTopic(e.target.value)}
            placeholder="Enter YouTube URL or topic"
            required
            className="form-control"
          />
          <small className="form-text">Enter a YouTube URL</small>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="numQuestions">Number of Questions:</label>
            <input
              type="number"
              id="numQuestions"
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value))}
              min="1"
              max="20"
              required
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="difficulty">Difficulty Level:</label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="form-control"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label>Question Types:</label>
          <div className="question-types-grid">
            <label className="question-type-option">
              <input
                type="checkbox"
                checked={questionTypes.includes('multiple_choice')}
                onChange={() => handleQuestionTypeChange('multiple_choice')}
              />
              <span>Multiple Choice</span>
            </label>
            
            <label className="question-type-option">
              <input
                type="checkbox"
                checked={questionTypes.includes('true_false')}
                onChange={() => handleQuestionTypeChange('true_false')}
              />
              <span>True/False</span>
            </label>
            
            <label className="question-type-option">
              <input
                type="checkbox"
                checked={questionTypes.includes('fill_blank')}
                onChange={() => handleQuestionTypeChange('fill_blank')}
              />
              <span>Fill in the Blank</span>
            </label>
            
            <label className="question-type-option">
              <input
                type="checkbox"
                checked={questionTypes.includes('wh_question')}
                onChange={() => handleQuestionTypeChange('wh_question')}
              />
              <span>WH Questions</span>
            </label>
          </div>
        </div>
        
        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'Generating Quiz...' : 'Generate Quiz'}
        </button>
      </form>

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Generating quiz. This may take a minute...</p>
        </div>
      )}

      {error && <p className="error">{error}</p>}

      {quiz.length > 0 && (
        <div className="quiz-display">
          <div className="quiz-header">
            <div className="quiz-title-container">
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="Quiz Title"
                className="quiz-title-input"
              />
              <button 
                onClick={saveQuiz} 
                className="save-quiz-button"
                disabled={loading}
              >
                {isSaved ? 'Update Quiz' : 'Save Quiz'}
              </button>
              {isSaved && <span className="saved-status">✓ Saved</span>}
            </div>
            
            <button 
              onClick={() => setShowAnswers(!showAnswers)} 
              className="toggle-answers-button"
            >
              {showAnswers ? 'Hide Answers' : 'Show Answers'}
            </button>
          </div>
          
          {quiz.map((q, index) => (
            <div key={index} className="quiz-question">
              <h4>{q.question}</h4>
              
              {q.type === 'multiple_choice' && (
                <div className="quiz-options">
                  {q.options.map((option, i) => (
                    <div key={i} className="quiz-option">
                      <input
                        type="radio"
                        id={`q${index}_opt${i}`}
                        name={`question${index}`}
                      />
                      <label htmlFor={`q${index}_opt${i}`}>
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              )}
              
              {q.type === 'true_false' && (
                <div className="quiz-options">
                  <div className="quiz-option">
                    <input
                      type="radio"
                      id={`q${index}_true`}
                      name={`question${index}`}
                    />
                    <label htmlFor={`q${index}_true`}>True</label>
                  </div>
                  <div className="quiz-option">
                    <input
                      type="radio"
                      id={`q${index}_false`}
                      name={`question${index}`}
                    />
                    <label htmlFor={`q${index}_false`}>False</label>
                  </div>
                </div>
              )}
              
              {q.type === 'fill_blank' && (
                <input
                  type="text"
                  placeholder="Your answer"
                  className="fill-blank-input"
                />
              )}
              
              {q.type === 'wh_question' && (
                <textarea
                  placeholder="Your answer"
                  rows="3"
                  className="wh-question-textarea"
                ></textarea>
              )}
              
              {showAnswers && (
                <div className="answer-container">
                  <p className="correct-answer">
                    <strong>Correct Answer:</strong> {q.correct_answer}
                  </p>
                  {q.explanation && (
                    <p className="explanation">
                      <strong>Explanation:</strong> {q.explanation}
                    </p>
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

export default QuizGenerator;