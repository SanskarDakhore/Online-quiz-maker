import React, { useEffect, useState } from 'react';
import apiService from '../services/api';

const DatabaseActivation = () => {
  const [activationStatus, setActivationStatus] = useState('pending');
  const [message, setMessage] = useState('Checking database connection...');
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    const activateDatabase = async () => {
      if (attempted) return; // Prevent multiple attempts
      
      setAttempted(true);
      
      try {
        setMessage('Attempting to activate database...');
        const result = await apiService.activateDb();
        
        if (result) {
          if (result.message && result.message.includes('cooldown')) {
            setActivationStatus('cooldown');
            setMessage('Database activation not needed - already active or in cooldown period');
          } else if (result.message && result.message.includes('Resume request sent')) {
            setActivationStatus('activated');
            setMessage('Database activation request sent successfully');
            
            // After activation, periodically check if database is ready
            // by making a simple health check request
            let attempts = 0;
            const maxAttempts = 10; // Check up to 10 times (about 30 seconds)
                        
            const checkDbReady = async () => {
              attempts++; 
              try {
                // Make a simple API call to check if database is ready
                // For deployed version, use relative path
                const isDeployed = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
                const healthUrl = isDeployed ? '/api/health' : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/health`;
                            
                const response = await fetch(healthUrl);
                const health = await response.json();
                            
                if (health.database === 'Connected') {
                  setActivationStatus('success');
                  setMessage('Database is now active and ready');
                  return;
                }
              } catch (error) {
                // If health check fails, continue waiting
              }
                          
              if (attempts < maxAttempts) {
                setTimeout(checkDbReady, 3000); // Check every 3 seconds
              } else {
                setMessage('Database activation requested - it may take a moment to become fully active');
              }
            };
                        
            setTimeout(checkDbReady, 5000); // Start checking after 5 seconds
          } else {
            setActivationStatus('success');
            setMessage('Database is ready');
          }
        } else {
          // If result is null, it means activation wasn't configured or failed silently
          setActivationStatus('not-configured');
          setMessage('Database activation not configured on this server');
        }
        
        console.log('Database activation result:', result);
      } catch (error) {
        setActivationStatus('error');
        setMessage(`Database activation failed: ${error.message}`);
        console.error('Database activation error:', error);
      }
    };

    // Add a small delay to allow the app to initialize
    const timer = setTimeout(() => {
      activateDatabase();
    }, 1000);

    return () => clearTimeout(timer);
  }, [attempted]);

  // Only show activation message if there's an actual issue
  if (activationStatus === 'pending' || activationStatus === 'success' || activationStatus === 'cooldown') {
    return null; // Don't render anything if activation is successful or in cooldown
  }

  return (
    <div className={`db-activation-message db-activation-${activationStatus}`}>
      <div className="db-activation-content">
        <p>{message}</p>
        {activationStatus === 'activated' && (
          <p className="db-activation-note">Note: Database may take a few seconds to become fully active</p>
        )}
      </div>
    </div>
  );
};

export default DatabaseActivation;