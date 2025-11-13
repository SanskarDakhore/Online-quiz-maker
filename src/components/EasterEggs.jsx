import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './EasterEggs.css';

const EasterEggs = () => {
  const [konamiSequence, setKonamiSequence] = useState([]);
  const [showDarkModeUnlock, setShowDarkModeUnlock] = useState(false);
  const [showMascot, setShowMascot] = useState(false);
  const [mascotTip, setMascotTip] = useState('');

  const KONAMI_CODE = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
  ];

  const mascotTips = [
    "💡 Pro tip: Take breaks between quizzes to stay fresh!",
    "🎯 Fun fact: The average quiz completion time is 15 minutes!",
    "✨ Did you know? You can earn badges by taking quizzes!",
    "🚀 Challenge yourself with Hard difficulty quizzes!",
    "🎨 Try switching themes for a fresh look!",
    "📚 Reading explanations helps you learn better!",
    "⚡ Quick tip: Answer what you know first, then review!",
    "🌟 Consistency is key! Take a quiz every day!",
    "🎭 Remember: It's about learning, not just scoring!",
    "🔥 You're doing great! Keep up the momentum!"
  ];

  useEffect(() => {
    const handleKeyPress = (e) => {
      const newSequence = [...konamiSequence, e.code];
      
      // Keep only last 10 keys
      if (newSequence.length > 10) {
        newSequence.shift();
      }
      
      setKonamiSequence(newSequence);

      // Check if Konami code is entered
      if (JSON.stringify(newSequence) === JSON.stringify(KONAMI_CODE)) {
        toggleDarkMode();
        setShowDarkModeUnlock(true);
        setTimeout(() => setShowDarkModeUnlock(false), 3000);
        setKonamiSequence([]);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [konamiSequence]);

  // Random mascot appearance
  useEffect(() => {
    const showMascotRandomly = () => {
      const randomTime = Math.random() * 60000 + 30000; // Between 30s and 90s
      
      setTimeout(() => {
        const randomTip = mascotTips[Math.floor(Math.random() * mascotTips.length)];
        setMascotTip(randomTip);
        setShowMascot(true);
        
        setTimeout(() => {
          setShowMascot(false);
        }, 5000);
        
        showMascotRandomly();
      }, randomTime);
    };

    showMascotRandomly();
  }, []);

  const toggleDarkMode = () => {
    document.body.classList.toggle('light-mode');
    const isDark = !document.body.classList.contains('light-mode');
    localStorage.setItem('darkMode', isDark);
  };

  // Load dark mode preference
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') !== 'false';
    if (!isDark) {
      document.body.classList.add('light-mode');
    }
  }, []);

  return (
    <>
      {/* Dark Mode Unlock Notification */}
      <AnimatePresence>
        {showDarkModeUnlock && (
          <motion.div
            className="easter-egg-notification"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
          >
            <div className="notification-content">
              <span className="notification-icon">🎉</span>
              <div>
                <h3>Secret Unlocked!</h3>
                <p>Dark Mode has been toggled! Use ↑↑↓↓←→←→BA to toggle again</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Random Quiz Mascot */}
      <AnimatePresence>
        {showMascot && (
          <motion.div
            className="quiz-mascot"
            initial={{ x: -200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -200, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            <motion.div
              className="mascot-character"
              animate={{
                rotate: [0, 10, -10, 10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
            >
              🦉
            </motion.div>
            <div className="mascot-bubble">
              <p>{mascotTip}</p>
              <button
                className="close-mascot"
                onClick={() => setShowMascot(false)}
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Dark Mode Toggle Button */}
      <motion.button
        className="dark-mode-toggle"
        onClick={toggleDarkMode}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Toggle Dark/Light Mode"
      >
        {document.body.classList.contains('light-mode') ? '🌙' : '☀️'}
      </motion.button>
    </>
  );
};

export default EasterEggs;
