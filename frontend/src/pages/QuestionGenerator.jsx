import React, { useState } from 'react';
import './QuestionGenerator.css';

const QuestionGenerator = () => {
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState([]);

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);

    // Call backend API for question generation based on the file
    // Example: const response = await fetch('API endpoint', { method: 'POST', body: uploadedFile });
    setQuestions([ "Question 1", "Question 2", "Question 3"]); // Dummy example
  };

  return (
    <div className="question-generator">
      <h2>Generate Questions</h2>
      <input 
        type="file" 
        onChange={handleFileUpload} 
      />
      <div className="questions">
        {questions.map((q, index) => (
          <div key={index} className="question-card">
            {q}
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuestionGenerator;
