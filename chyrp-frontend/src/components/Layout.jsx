// src/components/Layout.jsx

import { Link, useNavigate } from 'react-router-dom';
import './Layout.css'; // We'll create this file next for styling

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    // Navigate and reload to ensure the navbar updates
    navigate('/login');
    window.location.reload(); 
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="container">
          <Link to="/" className="logo">My Awesome Site</Link>
          <nav className="main-nav">
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            {token ? (
              <>
                <Link to="/create-post">Create Post</Link>
                <button onClick={handleLogout} className="nav-button">Logout</button>
              </>
            ) : (
              <Link to="/login">Login</Link>
            )}
          </nav>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          {children}
        </div>
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>&copy; 2025 My Awesome Site. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;