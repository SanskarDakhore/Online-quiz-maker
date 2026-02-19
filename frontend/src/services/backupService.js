// Backup Service for automatic quiz progress saving
class BackupService {
  constructor() {
    this.backupInterval = null;
    this.backupFrequency = 30000; // 30 seconds
  }

  // Start automatic backup for quiz progress
  startBackup(quizId, userId, quizState) {
    // Clear any existing backup interval
    this.stopBackup();
    
    // Save initial backup
    this.saveBackup(quizId, userId, quizState);
    
    // Set up periodic backup
    this.backupInterval = setInterval(() => {
      this.saveBackup(quizId, userId, quizState);
    }, this.backupFrequency);
  }

  // Stop automatic backup
  stopBackup() {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
    }
  }

  // Save quiz progress to localStorage
  saveBackup(quizId, userId, quizState) {
    try {
      const backupKey = `quiz_backup_${quizId}_${userId}`;
      const backupData = {
        quizId,
        userId,
        quizState,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(backupKey, JSON.stringify(backupData));
      console.log('Quiz progress backed up successfully');
      return true;
    } catch (error) {
      console.error('Failed to save backup:', error);
      return false;
    }
  }

  // Load quiz progress from localStorage
  loadBackup(quizId, userId) {
    try {
      const backupKey = `quiz_backup_${quizId}_${userId}`;
      const backupData = localStorage.getItem(backupKey);
      
      if (backupData) {
        const parsedData = JSON.parse(backupData);
        // Check if backup is recent (within 1 hour)
        const backupTime = new Date(parsedData.timestamp);
        const currentTime = new Date();
        const timeDiff = currentTime - backupTime;
        const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
        
        if (timeDiff < oneHour) {
          return parsedData.quizState;
        } else {
          // Backup is too old, remove it
          this.clearBackup(quizId, userId);
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error('Failed to load backup:', error);
      return null;
    }
  }

  // Clear backup data
  clearBackup(quizId, userId) {
    try {
      const backupKey = `quiz_backup_${quizId}_${userId}`;
      localStorage.removeItem(backupKey);
      return true;
    } catch (error) {
      console.error('Failed to clear backup:', error);
      return false;
    }
  }

  // Get all backups for a user
  getUserBackups(userId) {
    try {
      const backups = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(`quiz_backup_`) && key.includes(userId)) {
          const backupData = JSON.parse(localStorage.getItem(key));
          backups.push(backupData);
        }
      }
      return backups;
    } catch (error) {
      console.error('Failed to get user backups:', error);
      return [];
    }
  }

  // Clear all backups for a user
  clearUserBackups(userId) {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(`quiz_backup_`) && key.includes(userId)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Failed to clear user backups:', error);
      return false;
    }
  }
}

// Export singleton instance
const backupService = new BackupService();
export default backupService;