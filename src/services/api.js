
// API service for QuizMaster application
// For Vercel deployment, use relative paths to API routes
const API_BASE_URL = (typeof window !== 'undefined' && window.location.hostname !== 'localhost') 
  ? '/api' // Use relative path for deployed version
  : import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api'; // Use env var or localhost for dev

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
    // Initialize mock quizzes storage
    if (!localStorage.getItem('mock_quizzes')) {
      localStorage.setItem('mock_quizzes', JSON.stringify([]));
    }
  }

  setToken(token) {
    console.log('Setting token');
    this.token = token;
    localStorage.setItem('token', token);
  }

  removeToken() {
    console.log('Removing token');
    this.token = null;
    localStorage.removeItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Always get the latest token from localStorage in case it was updated elsewhere
    this.token = localStorage.getItem('token');
    console.log('Making request to:', url, 'Token present:', !!this.token);
    
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      console.log('Response status:', response.status);
      
      // If token is invalid, remove it and show error
      if (response.status === 401 || response.status === 403) {
        console.log('Token invalid, removing token');
        this.removeToken();
        
        // With JWT-based authentication, if the token is invalid, the session has expired
        throw new Error('Session expired. Please log in again.');
      }
      
      // Handle database disconnected case - this might be a server connection issue
      if (response.status === 503 || response.status === 0) {
        // If the server is not responding, use fallback behavior
        throw new Error('Database is not connected. Some features may be limited.');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Request error:', error);
      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // This is likely a network error - server not running
        // Use fallback behavior for disconnected database
        throw new Error('Database is not connected. Some features may be limited.');
      }
      throw error;
    }
  }

  // Auth endpoints
  async register(email, password, fullName, role) {
    try {
      const data = await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, fullName, role })
      });
      
      if (data.token) {
        this.setToken(data.token);
      }
      
      return data;
    } catch (error) {
      // Fallback for when database is not connected
      if (error.message.includes('Database is not connected')) {
        // Create a mock user for demonstration
        const mockToken = 'mock_token_' + Date.now();
        const mockUser = {
          uid: 'mock_uid_' + Date.now(),
          name: fullName,
          email: email,
          role: role
        };
        
        this.setToken(mockToken);
        
        return {
          token: mockToken,
          user: mockUser
        };
      }
      throw error;
    }
  }

  async login(email, password) {
    try {
      const data = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      if (data.token) {
        this.setToken(data.token);
      }
      
      return data;
    } catch (error) {
      // Fallback for when database is not connected
      if (error.message.includes('Database is not connected')) {
        // Mock login for demonstration
        const mockToken = 'mock_token_' + Date.now();
        const mockUser = {
          uid: 'mock_uid_' + Date.now(),
          name: email.includes('admin') ? 'Admin User' : 'Test Student',
          email: email,
          role: email.includes('admin') ? 'teacher' : 'student'
        };
        
        this.setToken(mockToken);
        
        return {
          token: mockToken,
          user: mockUser
        };
      }
      throw error;
    }
  }

  async getCurrentUser() {
    // Always get the latest token from localStorage
    this.token = localStorage.getItem('token');
    console.log('Getting current user, token present:', !!this.token);
    
    if (!this.token) {
      console.log('No token available');
      throw new Error('No token available');
    }
    
    try {
      return await this.request('/auth/me');
    } catch (error) {
      console.error('Error getting current user:', error);
      // Fallback for when database is not connected
      if (error.message.includes('Database is not connected')) {
        // Decode mock token to get user info
        const parts = this.token.split('_');
        if (parts.length >= 3) {
          const isTeacher = parts[2].includes('admin') || parts[2] === 'teacher';
          return {
            user: {
              uid: 'mock_uid_' + parts[3],
              name: isTeacher ? 'Admin User' : 'Test Student',
              email: 'mock@example.com',
              role: isTeacher ? 'teacher' : 'student'
            }
          };
        }
      }
      throw error;
    }
  }

  async logout() {
    this.removeToken();
  }

  // Quiz endpoints (with fallbacks for disconnected database)
  async getQuizzes() {
    try {
      return await this.request('/quizzes');
    } catch (error) {
      // Return mock quizzes when database is not connected
      if (error.message.includes('Database is not connected')) {
        // Get quizzes from localStorage
        const mockQuizzes = JSON.parse(localStorage.getItem('mock_quizzes') || '[]');
        // Only return published quizzes
        return mockQuizzes.filter(quiz => quiz.published === true);
      }
      throw error;
    }
  }

  async getMyQuizzes() {
    try {
      return await this.request('/quizzes/my-quizzes');
    } catch (error) {
      // Return mock quizzes when database is not connected
      if (error.message.includes('Database is not connected')) {
        // Get all quizzes from localStorage (for the current user in demo mode)
        const mockQuizzes = JSON.parse(localStorage.getItem('mock_quizzes') || '[]');
        return mockQuizzes;
      }
      throw error;
    }
  }

  async getQuiz(quizId) {
    try {
      return await this.request(`/quizzes/${quizId}`);
    } catch (error) {
      // Return mock quiz when database is disconnected
      if (error.message.includes('Database is not connected')) {
        // Get quiz from localStorage by ID
        const mockQuizzes = JSON.parse(localStorage.getItem('mock_quizzes') || '[]');
        const quiz = mockQuizzes.find(q => q.quizId === quizId);
        if (quiz) {
          return quiz;
        }
        
        // If not found, return a default quiz
        return {
          quizId: quizId || 'mock-quiz-1',
          title: 'Sample Quiz',
          description: 'This is a sample quiz for demonstration',
          category: 'General',
          difficulty: 'Medium',
          timer: 30,
          published: true,
          questions: [
            {
              questionText: 'What is 2+2?',
              options: ['3', '4', '5', '6'],
              correctAnswer: 1,
              explanation: '2+2 equals 4'
            },
            {
              questionText: 'What is the capital of France?',
              options: ['London', 'Berlin', 'Paris', 'Madrid'],
              correctAnswer: 2,
              explanation: 'The capital of France is Paris'
            }
          ]
        };
      }
      throw error;
    }
  }

  async createQuiz(quizData) {
    try {
      console.log('Creating quiz with data:', quizData);
      const result = await this.request('/quizzes', {
        method: 'POST',
        body: JSON.stringify(quizData)
      });
      console.log('Quiz created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error creating quiz:', error);
      // Mock create quiz when database is disconnected
      if (error.message.includes('Database is not connected')) {
        // Create a new quiz and save it to localStorage
        const newQuiz = {
          ...quizData,
          quizId: 'mock-quiz-' + Date.now(),
          createdAt: new Date().toISOString(),
          published: quizData.published || false
        };
        
        // Add to existing quizzes in localStorage
        const existingQuizzes = JSON.parse(localStorage.getItem('mock_quizzes') || '[]');
        existingQuizzes.push(newQuiz);
        localStorage.setItem('mock_quizzes', JSON.stringify(existingQuizzes));
        
        return newQuiz;
      }
      throw error;
    }
  }

  async updateQuiz(quizId, quizData) {
    try {
      console.log('Updating quiz:', quizId, 'with data:', quizData);
      const result = await this.request(`/quizzes/${quizId}`, {
        method: 'PUT',
        body: JSON.stringify(quizData)
      });
      console.log('Quiz updated successfully:', result);
      return result;
    } catch (error) {
      console.error('Error updating quiz:', error);
      // Mock update quiz when database is disconnected
      if (error.message.includes('Database is not connected')) {
        // Update the quiz in localStorage
        const existingQuizzes = JSON.parse(localStorage.getItem('mock_quizzes') || '[]');
        const quizIndex = existingQuizzes.findIndex(q => q.quizId === quizId);
        
        if (quizIndex !== -1) {
          existingQuizzes[quizIndex] = {
            ...quizData,
            quizId: quizId,
            updatedAt: new Date().toISOString()
          };
          localStorage.setItem('mock_quizzes', JSON.stringify(existingQuizzes));
          return existingQuizzes[quizIndex];
        } else {
          // If quiz doesn't exist, create it
          const newQuiz = {
            ...quizData,
            quizId: quizId,
            updatedAt: new Date().toISOString()
          };
          existingQuizzes.push(newQuiz);
          localStorage.setItem('mock_quizzes', JSON.stringify(existingQuizzes));
          return newQuiz;
        }
      }
      throw error;
    }
  }

  async deleteQuiz(quizId) {
    try {
      return await this.request(`/quizzes/${quizId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      // Mock delete quiz when database is disconnected
      if (error.message.includes('Database is not connected')) {
        // Remove quiz from localStorage
        const existingQuizzes = JSON.parse(localStorage.getItem('mock_quizzes') || '[]');
        const filteredQuizzes = existingQuizzes.filter(q => q.quizId !== quizId);
        localStorage.setItem('mock_quizzes', JSON.stringify(filteredQuizzes));
        return { message: 'Quiz deleted successfully (mock)' };
      }
      throw error;
    }
  }

  async publishQuiz(quizId, published) {
    try {
      console.log('Publishing quiz:', quizId, 'Published:', published);
      const result = await this.request(`/quizzes/${quizId}/publish`, {
        method: 'PATCH',
        body: JSON.stringify({ published })
      });
      console.log('Publish result:', result);
      return result;
    } catch (error) {
      console.error('Error publishing quiz:', error);
      // Mock publish quiz when database is disconnected
      if (error.message.includes('Database is not connected')) {
        // Update the published status in localStorage
        const existingQuizzes = JSON.parse(localStorage.getItem('mock_quizzes') || '[]');
        const quizIndex = existingQuizzes.findIndex(q => q.quizId === quizId);
        
        if (quizIndex !== -1) {
          existingQuizzes[quizIndex].published = published;
          existingQuizzes[quizIndex].updatedAt = new Date().toISOString();
          localStorage.setItem('mock_quizzes', JSON.stringify(existingQuizzes));
        }
        return { message: `Quiz ${published ? 'published' : 'unpublished'} successfully (mock)` };
      }
      throw error;
    }
  }

  // Result endpoints (with fallbacks)
  async submitResult(resultData) {
    try {
      return await this.request('/results', {
        method: 'POST',
        body: JSON.stringify(resultData)
      });
    } catch (error) {
      // Mock submit result when database is disconnected
      if (error.message.includes('Database is not connected')) {
        return {
          ...resultData,
          resultId: 'mock-result-' + Date.now(),
          submittedAt: new Date().toISOString(),
          baseScore: resultData.baseScore || resultData.score,
          hintsUsed: resultData.hintsUsed || 0,
          pointsDeductedForHints: resultData.pointsDeductedForHints || 0
        };
      }
      throw error;
    }
  }

  async getMyResults() {
    try {
      return await this.request('/results/my-results');
    } catch (error) {
      // Return mock results when database is disconnected
      if (error.message.includes('Database is not connected')) {
        return [
          {
            resultId: 'mock-result-1',
            quizId: 'mock-quiz-1',
            score: 80,
            baseScore: 80,
            hintsUsed: 0,
            pointsDeductedForHints: 0,
            totalQuestions: 5,
            correctAnswers: 4,
            submittedAt: new Date().toISOString()
          }
        ];
      }
      throw error;
    }
  }

  async getResult(resultId) {
    try {
      return await this.request(`/results/${resultId}`);
    } catch (error) {
      // Return mock result when database is disconnected
      if (error.message.includes('Database is not connected')) {
        return {
          resultId: resultId || 'mock-result-1',
          quizId: 'mock-quiz-1',
          score: 80,
          baseScore: 80,
          hintsUsed: 0,
          pointsDeductedForHints: 0,
          totalQuestions: 5,
          correctAnswers: 4,
          submittedAt: new Date().toISOString()
        };
      }
      throw error;
    }
  }

  async getQuizResults(quizId) {
    try {
      return await this.request(`/results/quiz/${quizId}`);
    } catch (error) {
      // Return mock results when database is disconnected
      if (error.message.includes('Database is not connected')) {
        return [
          {
            resultId: 'mock-result-1',
            quizId: quizId || 'mock-quiz-1',
            score: 80,
            baseScore: 80,
            hintsUsed: 0,
            pointsDeductedForHints: 0,
            totalQuestions: 5,
            correctAnswers: 4,
            submittedAt: new Date().toISOString()
          }
        ];
      }
      throw error;
    }
  }

  // Trigger server-side activation (e.g., resume Atlas cluster)
  async activateDb() {
    try {
      // For Vercel deployment, always use relative path
      const isDeployed = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
      const url = isDeployed ? '/api/activate-db' : `${API_BASE_URL}/activate-db`;
      const response = await fetch(url, { method: 'POST' });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.warn('activateDb failed:', response.status, err);
        // If the error is due to missing configuration, return null
        // Otherwise, we might want to handle other errors differently
        if (response.status === 400 && err.error && err.error.includes('Missing Atlas API environment variables')) {
          return null; // Configuration issue - return null to indicate not configured
        }
        return null;
      }
      return await response.json();
    } catch (err) {
      console.error('activateDb request error:', err);
      return null;
    }
  }
}

const apiService = new ApiService();
export default apiService;