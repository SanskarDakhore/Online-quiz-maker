// Session Management Service for tracking active user sessions
class SessionService {
  constructor() {
    this.sessions = {};
    this.maxConcurrentSessions = 1; // Only allow 1 session per user
    
    // Initialize with an empty object if needed
    if (typeof this.sessions !== 'object' || this.sessions === null) {
      this.sessions = {};
    }
    
    this.loadSessionsFromStorage();
  }

  // Generate a unique session ID
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Create a new session for a user
  createSession(userId) {
    const sessionId = this.generateSessionId();
    
    // Initialize sessions object for this user if it doesn't exist
    if (!this.sessions[userId]) {
      this.sessions[userId] = {};
    }
    
    // Check if we've reached the maximum concurrent sessions
    if (Object.keys(this.sessions[userId]).length >= this.maxConcurrentSessions) {
      // Remove the oldest session
      const oldestSessionId = Object.keys(this.sessions[userId])[0];
      this.removeSession(userId, oldestSessionId);
      
      // Reinitialize if all sessions were removed
      if (!this.sessions[userId]) {
        this.sessions[userId] = {};
      }
    }
    
    // Create new session
    const sessionData = {
      sessionId,
      userId,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };
    
    this.sessions[userId][sessionId] = sessionData;
    this.saveSessionsToStorage();
    
    return sessionData;
  }

  // Remove a session
  removeSession(userId, sessionId) {
    // Ensure user sessions object exists
    if (!this.sessions[userId]) {
      this.sessions[userId] = {};
      return false;
    }
    
    if (this.sessions[userId][sessionId]) {
      delete this.sessions[userId][sessionId];
      
      // Clean up user entry if no more sessions
      if (Object.keys(this.sessions[userId]).length === 0) {
        delete this.sessions[userId];
      }
      
      this.saveSessionsToStorage();
      return true;
    }
    return false;
  }

  // Check if user has an active session
  hasActiveSession(userId) {
    // Ensure user sessions object exists
    if (!this.sessions[userId]) {
      this.sessions[userId] = {};
      return false;
    }
    
    return Object.keys(this.sessions[userId]).length > 0;
  }

  // Get active sessions for a user
  getUserSessions(userId) {
    // Ensure user sessions object exists
    if (!this.sessions[userId]) {
      this.sessions[userId] = {};
    }
    
    return this.sessions[userId];
  }

  // Update session activity
  updateSessionActivity(userId, sessionId) {
    // Ensure user sessions object exists
    if (!this.sessions[userId]) {
      this.sessions[userId] = {};
    }
    
    if (this.sessions[userId] && this.sessions[userId][sessionId]) {
      this.sessions[userId][sessionId].lastActivity = new Date().toISOString();
      this.saveSessionsToStorage();
      return true;
    }
    return false;
  }

  // Validate if a session is still valid
  isSessionValid(userId, sessionId) {
    // Ensure user sessions object exists
    if (!this.sessions[userId]) {
      this.sessions[userId] = {};
      return false;
    }
    
    if (!this.sessions[userId][sessionId]) {
      return false;
    }
    
    // Check if session is too old (more than 24 hours)
    const session = this.sessions[userId][sessionId];
    const sessionAge = new Date() - new Date(session.createdAt);
    const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
    
    if (sessionAge > maxSessionAge) {
      this.removeSession(userId, sessionId);
      return false;
    }
    
    return true;
  }

  // Save sessions to localStorage
  saveSessionsToStorage() {
    try {
      // Ensure sessions object is valid
      if (typeof this.sessions !== 'object' || this.sessions === null) {
        this.sessions = {};
      }
      
      localStorage.setItem('active_sessions', JSON.stringify(this.sessions));
    } catch (error) {
      console.error('Failed to save sessions to storage:', error);
    }
  }

  // Load sessions from localStorage
  loadSessionsFromStorage() {
    try {
      const sessionsData = localStorage.getItem('active_sessions');
      if (sessionsData) {
        const parsedData = JSON.parse(sessionsData);
        
        // Validate parsed data
        if (typeof parsedData === 'object' && parsedData !== null) {
          this.sessions = parsedData;
        } else {
          this.sessions = {};
        }
      }
    } catch (error) {
      console.error('Failed to load sessions from storage:', error);
      this.sessions = {};
    }
    
    // Ensure sessions object is valid
    if (typeof this.sessions !== 'object' || this.sessions === null) {
      this.sessions = {};
    }
  }

  // Clean up expired sessions
  cleanupExpiredSessions() {
    const now = new Date();
    const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
    
    for (const userId in this.sessions) {
      // Ensure user sessions object exists
      if (!this.sessions[userId]) {
        this.sessions[userId] = {};
        continue;
      }
      
      for (const sessionId in this.sessions[userId]) {
        const session = this.sessions[userId][sessionId];
        const sessionAge = now - new Date(session.createdAt);
        
        if (sessionAge > maxSessionAge) {
          this.removeSession(userId, sessionId);
        }
      }
    }
  }
}

// Export singleton instance
const sessionService = new SessionService();
export default sessionService;