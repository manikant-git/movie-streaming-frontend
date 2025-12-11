import React from 'react';

const Header = ({ onLogout }) => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <h1>🎬 CineStream</h1>
        </div>
        <nav className="nav-menu">
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/trending">Trending</a></li>
            <li><a href="/favorites">My Favorites</a></li>
          </ul>
        </nav>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>
    </header>
  );
};

export default Header;
