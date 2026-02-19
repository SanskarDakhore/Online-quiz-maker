const normalizeApiBase = (raw) => {
  const trimmed = (raw || '').trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  return /\/api$/i.test(trimmed) ? trimmed : `${trimmed}/api`;
};

const ENV_API_BASE_URL = normalizeApiBase(import.meta.env.VITE_API_BASE_URL);
const IS_LOCAL =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL = ENV_API_BASE_URL || (IS_LOCAL ? 'http://localhost:5000/api' : '/api');

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    this.token = localStorage.getItem('token');
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401 || response.status === 403) {
      this.removeToken();
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    if (response.status === 204) return null;
    return response.json();
  }

  async register(email, password, fullName, role) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, role })
    });
    if (data.token) this.setToken(data.token);
    return data;
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.token) this.setToken(data.token);
    return data;
  }

  async getCurrentUser() {
    if (!localStorage.getItem('token')) {
      throw new Error('No token available');
    }
    return this.request('/auth/me');
  }

  async logout() {
    this.removeToken();
  }

  async getQuizzes() {
    return this.request('/quizzes');
  }

  async getMyQuizzes() {
    return this.request('/quizzes/my-quizzes');
  }

  async getQuiz(quizId) {
    return this.request(`/quizzes/${quizId}`);
  }

  async createQuiz(quizData) {
    return this.request('/quizzes', {
      method: 'POST',
      body: JSON.stringify(quizData)
    });
  }

  async updateQuiz(quizId, quizData) {
    return this.request(`/quizzes/${quizId}`, {
      method: 'PUT',
      body: JSON.stringify(quizData)
    });
  }

  async deleteQuiz(quizId) {
    return this.request(`/quizzes/${quizId}`, {
      method: 'DELETE'
    });
  }

  async publishQuiz(quizId, published) {
    return this.request(`/quizzes/${quizId}/publish`, {
      method: 'PATCH',
      body: JSON.stringify({ published })
    });
  }

  async submitResult(resultData) {
    return this.request('/results', {
      method: 'POST',
      body: JSON.stringify(resultData)
    });
  }

  async getMyResults() {
    return this.request('/results/my-results');
  }

  async getResult(resultId) {
    return this.request(`/results/${resultId}`);
  }

  async getQuizResults(quizId) {
    return this.request(`/results/quiz/${quizId}`);
  }

  async activateDb() {
    try {
      const url = `${API_BASE_URL}/activate-db`;
      const response = await fetch(url, { method: 'POST' });
      if (!response.ok) return null;
      return response.json();
    } catch {
      return null;
    }
  }
}

const apiService = new ApiService();
export default apiService;
