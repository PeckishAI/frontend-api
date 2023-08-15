// LoginModal.tsx
import React, { useState } from 'react';

interface LoginModalProps {
  software: {
    name: string;
    display_name: string;
    auth_type: string;
    oauth_url: string;
  };
  onLogin: (username: string, password: string) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ software, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);

    // Simulate server authentication delay for 1 minute
    setTimeout(async () => {
      try {
        setIsLoading(false);
        onLogin(username, password);
      } catch (error) {
        console.error('Login failed:', error);
      }
    }, 20000); // 20 seconds
  };

  return (
    <div className="login-modal">
      <h2>Login to {software.display_name}</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin} disabled={isLoading}>
        {isLoading ? 'Downloading...' : 'Login'}
      </button>
      {isLoading && <div className="loading-spinner"></div>}
    </div>
  );
};

export default LoginModal;
