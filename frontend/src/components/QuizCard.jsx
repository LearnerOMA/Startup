import React, { useState } from 'react';
import './QuizCard.css';

const QuizCard = ({ question, options, correctAnswer }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleOptionSelect = (option) => {
    if (!isSubmitted) {
      setSelectedOption(option);
    }
  };
  
  const handleSubmit = () => {
    setIsSubmitted(true);
  };
  
  const getOptionClass = (option) => {
    if (!isSubmitted) return selectedOption === option ? 'selected' : '';
    
    if (option === correctAnswer) return 'correct';
    if (option === selectedOption && selectedOption !== correctAnswer) return 'incorrect';
    return '';
  };
  
  return (
    <div className="quiz-card">
      <div className="quiz-question">
        <h3>{question}</h3>
      </div>
      
      <div className="quiz-options">
        {options.map((option, index) => (
          <div 
            key={index} 
            className={`quiz-option ${getOptionClass(option)}`}
            onClick={() => handleOptionSelect(option)}
          >
            <span className="option-letter">{String.fromCharCode(65 + index)}</span>
            <span className="option-text">{option}</span>
          </div>
        ))}
      </div>
      
      <div className="quiz-footer">
        {isSubmitted ? (
          <div className="quiz-result">
            {selectedOption === correctAnswer ? (
              <div className="correct-message">Correct! Well done.</div>
            ) : (
              <div className="incorrect-message">
                Incorrect. The correct answer is {correctAnswer}.
              </div>
            )}
          </div>
        ) : (
          <button 
            className="submit-button"
            disabled={selectedOption === null}
            onClick={handleSubmit}
          >
            Submit Answer
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizCard;