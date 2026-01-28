import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const { theme, setTheme, availableThemes } = useTheme();
  const navigate = useNavigate();

  // Redirect to library if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/library', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);

    if (result.success) {
      navigate('/library');
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Theme Selector */}
      <div className="theme-selector-login">
        <button
          onClick={() => setShowThemeMenu(!showThemeMenu)}
          className="btn-theme-login"
        >
          {availableThemes[theme].icon}
        </button>
        {showThemeMenu && (
          <div className="theme-menu-login">
            {Object.entries(availableThemes).map(([key, themeData]) => (
              <button
                key={key}
                onClick={() => {
                  setTheme(key);
                  setShowThemeMenu(false);
                }}
                className={theme === key ? 'active' : ''}
              >
                {themeData.icon} {themeData.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="login-box">
        <h1>Markdown Book Library</h1>
        <p>Please login to access your books</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-hint">
          <p>Demo accounts:</p>
          <ul>
            <li>user1 / pass1</li>
            <li>alice / alice123</li>
            <li>bob / password123</li>
          </ul>
        </div>
      </div>

      <style>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: var(--background-color, #f5f5f5);
          position: relative;
        }

        /* Theme Selector for Login */
        .theme-selector-login {
          position: absolute;
          top: 1rem;
          right: 1rem;
          z-index: 100;
        }

        .btn-theme-login {
          width: 48px;
          height: 48px;
          padding: 0.5rem;
          background: var(--surface-color, white);
          border: 1px solid var(--border-color, #ddd);
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .btn-theme-login:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .theme-menu-login {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.5rem;
          background: var(--surface-color, white);
          border: 1px solid var(--border-color, #ddd);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          min-width: 180px;
          overflow: hidden;
        }

        .theme-menu-login button {
          display: block;
          width: 100%;
          padding: 0.75rem 1rem;
          background: transparent;
          border: none;
          text-align: left;
          cursor: pointer;
          color: var(--text-color, #333);
          transition: background 0.2s;
          font-size: 0.95rem;
        }

        .theme-menu-login button:hover {
          background: var(--button-hover, #f0f0f0);
        }

        .theme-menu-login button.active {
          background: var(--primary-color, #007bff);
          color: white;
        }

        .login-box {
          background: var(--surface-color, white);
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
        }

        .login-box h1 {
          margin: 0 0 0.5rem 0;
          color: var(--text-color, #333);
          font-size: 1.5rem;
        }

        .login-box > p {
          margin: 0 0 1.5rem 0;
          color: var(--text-secondary, #666);
          font-size: 0.9rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--text-color, #333);
          font-weight: 500;
        }

        .form-group input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border-color, #ddd);
          border-radius: 4px;
          font-size: 1rem;
          box-sizing: border-box;
          background: var(--input-background, white);
          color: var(--text-color, #333);
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--primary-color, #007bff);
        }

        .error-message {
          background: #fee;
          color: #c33;
          padding: 0.75rem;
          border-radius: 4px;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .btn-primary {
          width: 100%;
          padding: 0.75rem;
          background: var(--primary-color, #007bff);
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
          background: var(--primary-hover, #0056b3);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-hint {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-color, #ddd);
          font-size: 0.85rem;
          color: var(--text-secondary, #666);
        }

        .login-hint p {
          margin: 0 0 0.5rem 0;
        }

        .login-hint ul {
          margin: 0;
          padding-left: 1.5rem;
        }

        .login-hint li {
          margin-bottom: 0.25rem;
        }

        /* Dark mode */
        [data-theme="dark"] .login-container {
          --background-color: #1a1a1a;
          --surface-color: #2d2d2d;
          --text-color: #e0e0e0;
          --text-secondary: #a0a0a0;
          --border-color: #444;
          --input-background: #333;
          --button-hover: #3a3a3a;
          --primary-color: #0d6efd;
          --primary-hover: #0a58ca;
        }

        /* Sepia mode */
        [data-theme="sepia"] .login-container {
          --background-color: #f4ecd8;
          --surface-color: #f9f4e8;
          --text-color: #5c4b37;
          --text-secondary: #8b7355;
          --border-color: #d3c4a8;
          --input-background: #f9f4e8;
          --button-hover: #e8dcc4;
          --primary-color: #9b6e3a;
          --primary-hover: #7d5730;
        }

        /* Catppuccin Pink mode (Rosewater) */
        [data-theme="catppuccin"] .login-container {
          --background-color: #dc8a78; /* Rosewater */
          --surface-color: #f5e9e6;
          --text-color: #2d2a2e;
          --text-secondary: #5c4f4d;
          --border-color: #e0b8b0;
          --input-background: #faf3f1;
          --button-hover: #edd5d0;
          --primary-color: #8839ef; /* Mauve */
          --primary-hover: #7c3aed;
        }

        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          .login-container {
            padding: 1rem;
          }

          .login-box {
            padding: 1.5rem;
            max-width: 100%;
          }

          .login-box h1 {
            font-size: 1.3rem;
          }

          .theme-selector-login {
            top: 0.75rem;
            right: 0.75rem;
          }

          .btn-theme-login {
            width: 42px;
            height: 42px;
            font-size: 1.3rem;
          }
        }

        @media (max-width: 480px) {
          .login-container {
            padding: 0.5rem;
          }

          .login-box {
            padding: 1.25rem;
          }

          .login-box h1 {
            font-size: 1.2rem;
          }

          .login-box > p {
            font-size: 0.85rem;
          }

          .theme-selector-login {
            top: 0.5rem;
            right: 0.5rem;
          }

          .btn-theme-login {
            width: 38px;
            height: 38px;
            font-size: 1.2rem;
          }

          .login-hint {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
}

export default LoginPage;
