import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import './QuizCreator.css';

const QuizCreator = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    category: 'General',
    difficulty: 'Medium',
    timer: 30, // minutes
    timerPerQuestion: false,
    questions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    image: null,
    imageUrl: ''
  });

  // Fetch quiz data if editing
  useEffect(() => {
    if (quizId) {
      fetchQuizData();
    }
  }, [quizId]);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
      
      if (quizDoc.exists()) {
        const data = quizDoc.data();
        setQuizData({
          title: data.title || '',
          description: data.description || '',
          category: data.category || 'General',
          difficulty: data.difficulty || 'Medium',
          timer: data.timer || 30,
          timerPerQuestion: data.timerPerQuestion || false,
          questions: data.questions || []
        });
        setIsEditMode(true);
      } else {
        alert('Quiz not found');
        navigate('/teacher/quizzes');
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      alert('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  // Handle quiz info change
  const handleQuizChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuizData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle question change
  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setCurrentQuestion(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle option change
  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setCurrentQuestion(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  // Add question to quiz
  const addQuestion = () => {
    if (!currentQuestion.questionText || currentQuestion.options.some(opt => !opt)) {
      alert('Please fill in all question fields');
      return;
    }

    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion }]
    }));

    // Reset current question
    setCurrentQuestion({
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      image: null,
      imageUrl: ''
    });
  };

  // Remove question
  const removeQuestion = (index) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  // Save quiz
  const saveQuiz = async (publish = false) => {
    if (!quizData.title || quizData.questions.length === 0) {
      alert('Please add a title and at least one question');
      return;
    }

    try {
      setLoading(true);

      // Upload images and get URLs
      const questionsWithImages = await Promise.all(
        quizData.questions.map(async (question) => {
          if (question.image) {
            const imageRef = ref(storage, `quiz-images/${Date.now()}_${question.image.name}`);
            await uploadBytes(imageRef, question.image);
            const imageUrl = await getDownloadURL(imageRef);
            return { ...question, imageUrl, image: null };
          }
          return { ...question, image: null };
        })
      );

      const quizDoc = {
        ...quizData,
        questions: questionsWithImages,
        createdBy: currentUser.uid,
        published: publish
      };

      if (isEditMode) {
        // Update existing quiz
        await updateDoc(doc(db, 'quizzes', quizId), quizDoc);
        alert(`Quiz ${publish ? 'published' : 'updated'} successfully!`);
      } else {
        // Create new quiz
        quizDoc.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'quizzes'), quizDoc);
        alert(`Quiz ${publish ? 'published' : 'saved as draft'} successfully!`);
      }
      
      navigate('/teacher/quizzes');
    } catch (error) {
      console.error('Error saving quiz:', error);
      alert('Failed to save quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quiz-creator-container">
      <motion.div 
        className="quiz-creator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="creator-header">
          <div>
            <h1>{isEditMode ? 'Edit Quiz ✏️' : 'Create New Quiz 📝'}</h1>
          </div>
          <div className="header-actions">
            <button onClick={() => navigate('/teacher/quizzes')} className="btn btn-outline">
              ← Back
            </button>
            <button onClick={() => setShowPreview(true)} className="btn btn-secondary">
              👁️ Preview
            </button>
            <button onClick={() => saveQuiz(false)} className="btn btn-outline" disabled={loading}>
              💾 Save Draft
            </button>
            <button onClick={() => saveQuiz(true)} className="btn btn-primary" disabled={loading}>
              🚀 Publish Quiz
            </button>
          </div>
        </div>

        {/* Quiz Information */}
        <motion.div 
          className="glass-card creator-section"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h2>Quiz Information</h2>
          
          <div className="input-group">
            <label>Quiz Title *</label>
            <input
              type="text"
              name="title"
              value={quizData.title}
              onChange={handleQuizChange}
              placeholder="Enter quiz title"
            />
          </div>

          <div className="input-group">
            <label>Description</label>
            <textarea
              name="description"
              value={quizData.description}
              onChange={handleQuizChange}
              placeholder="What is this quiz about?"
              rows="3"
            />
          </div>

          <div className="input-row">
            <div className="input-group">
              <label>Category</label>
              <select name="category" value={quizData.category} onChange={handleQuizChange}>
                <option>General</option>
                <option>Science</option>
                <option>Math</option>
                <option>History</option>
                <option>Technology</option>
                <option>Literature</option>
                <option>Other</option>
              </select>
            </div>

            <div className="input-group">
              <label>Difficulty</label>
              <select name="difficulty" value={quizData.difficulty} onChange={handleQuizChange}>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>

            <div className="input-group">
              <label>Timer (minutes)</label>
              <input
                type="number"
                name="timer"
                value={quizData.timer}
                onChange={handleQuizChange}
                min="1"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="timerPerQuestion"
                checked={quizData.timerPerQuestion}
                onChange={handleQuizChange}
              />
              <span>Apply timer per question instead of entire quiz</span>
            </label>
          </div>
        </motion.div>

        {/* Add Questions */}
        <motion.div 
          className="glass-card creator-section"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h2>Add Question {quizData.questions.length > 0 && `(${quizData.questions.length} added)`}</h2>

          <div className="input-group">
            <label>Question Text *</label>
            <textarea
              name="questionText"
              value={currentQuestion.questionText}
              onChange={handleQuestionChange}
              placeholder="Enter your question"
              rows="2"
            />
          </div>

          <div className="options-grid">
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="option-input">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                <label className="radio-label">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={currentQuestion.correctAnswer === index}
                    onChange={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: index }))}
                  />
                  <span>Correct</span>
                </label>
              </div>
            ))}
          </div>

          <div className="input-group">
            <label>Explanation (Optional)</label>
            <textarea
              name="explanation"
              value={currentQuestion.explanation}
              onChange={handleQuestionChange}
              placeholder="Explain the correct answer"
              rows="2"
            />
          </div>

          <div className="input-group">
            <label>Image (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
            {currentQuestion.image && (
              <p className="file-name">Selected: {currentQuestion.image.name}</p>
            )}
          </div>

          <button onClick={addQuestion} className="btn btn-primary">
            ➕ Add Question
          </button>
        </motion.div>

        {/* Questions List */}
        {quizData.questions.length > 0 && (
          <motion.div 
            className="glass-card creator-section"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2>Questions ({quizData.questions.length})</h2>
            
            <div className="questions-list">
              {quizData.questions.map((question, index) => (
                <motion.div 
                  key={index}
                  className="question-preview"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="question-header">
                    <h4>Q{index + 1}. {question.questionText}</h4>
                    <button 
                      onClick={() => removeQuestion(index)}
                      className="btn btn-danger btn-sm"
                    >
                      🗑️ Remove
                    </button>
                  </div>
                  <div className="question-options">
                    {question.options.map((opt, i) => (
                      <p key={i} className={i === question.correctAnswer ? 'correct-option' : ''}>
                        {i === question.correctAnswer && '✅ '}{opt}
                      </p>
                    ))}
                  </div>
                  {question.explanation && (
                    <p className="question-explanation">💡 {question.explanation}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPreview(false)}
          >
            <motion.div 
              className="modal-content glass-card"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Quiz Preview</h2>
                <button onClick={() => setShowPreview(false)} className="close-btn">✕</button>
              </div>
              
              <div className="modal-body">
                <h3>{quizData.title}</h3>
                <p>{quizData.description}</p>
                <div className="preview-meta">
                  <span>📂 {quizData.category}</span>
                  <span>📊 {quizData.difficulty}</span>
                  <span>⏱️ {quizData.timer} min</span>
                  <span>❓ {quizData.questions.length} questions</span>
                </div>

                <div className="preview-questions">
                  {quizData.questions.map((q, i) => (
                    <div key={i} className="preview-question">
                      <h4>Question {i + 1}</h4>
                      <p>{q.questionText}</p>
                      <ul>
                        {q.options.map((opt, j) => (
                          <li key={j}>{opt}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizCreator;
