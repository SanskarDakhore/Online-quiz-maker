import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const GoogleAuthButton = ({
  role = 'student',
  buttonText = 'continue_with', // 'signin_with' | 'signup_with' | 'continue_with'
  onSuccess,
  onError,
  disabled = false
}) => {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { loginWithGoogle } = useAuth();

  const isConfigured = Boolean(
    GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes('your_google_client_id_here')
  );

  useEffect(() => {
    if (!isConfigured) return;

    let checkInterval = null;

    const initializeGoogleButton = () => {
      if (window.google?.accounts?.id && containerRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
            cancel_on_tap_outside: true,
            auto_select: false
          });

          containerRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(containerRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: buttonText,
            shape: 'pill',
            logo_alignment: 'left',
            width: 320
          });

          if (checkInterval) clearInterval(checkInterval);
        } catch (err) {
          console.error('Failed to initialize Google Sign-In:', err);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initializeGoogleButton();
    } else {
      checkInterval = setInterval(initializeGoogleButton, 300);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [role, buttonText, isConfigured]);

  const handleGoogleResponse = async (response) => {
    if (!response?.credential) {
      const err = 'Failed to get credentials from Google';
      setErrorMsg(err);
      if (onError) onError(new Error(err));
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const data = await loginWithGoogle(response.credential, role);
      if (onSuccess) {
        onSuccess(data);
      }
    } catch (err) {
      console.error('Google OAuth error:', err);
      const message = err.message || 'Failed to authenticate with Google';
      setErrorMsg(message);
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isConfigured) {
    return (
      <div className="google-auth-placeholder text-center my-2 p-2 rounded bg-dark-subtle border border-secondary-subtle">
        <div className="d-flex align-items-center justify-content-center gap-2 text-muted small">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.66-5.17 3.66-9.09z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.76-2.11-6.71-4.96H1.26v3.1A11.996 11.996 0 0012 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.29 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.6H1.26A11.996 11.996 0 000 12c0 1.92.45 3.74 1.26 5.4l4.03-3.11z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.36 2.65 1.26 6.6l4.03 3.11c.95-2.85 3.59-4.96 6.71-4.96z"
            />
          </svg>
          <span>Google Sign-In ready (configure <code>VITE_GOOGLE_CLIENT_ID</code>)</span>
        </div>
      </div>
    );
  }

  return (
    <div className="google-auth-container w-100 d-flex flex-column align-items-center my-3">
      {errorMsg && (
        <div className="alert alert-danger py-2 px-3 small w-100 mb-2" role="alert">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="d-flex align-items-center justify-content-center gap-2 py-2 text-muted">
          <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
          <span className="small">Authenticating with Google...</span>
        </div>
      ) : (
        <div
          ref={containerRef}
          className={`google-btn-wrapper ${disabled ? 'opacity-50 pe-none' : ''}`}
          style={{ minHeight: 44, display: 'flex', justifyContent: 'center' }}
        />
      )}
    </div>
  );
};

export default GoogleAuthButton;
