import React, { useState } from 'react';
import '../styles/AccountPage.css';

const AccountPage = () => {
  const [user, setUser] = useState({
    username: 'Player123',
    email: 'player@example.com',
    joinDate: '2024-01-01',
    totalCards: 42,
    trades: 15
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...user });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement update logic here
    setUser(formData);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="account-page">
      <div className="account-header">
        <div className="avatar">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <h1>{user.username}</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Cards</span>
          <span className="stat-value">{user.totalCards}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Trades Made</span>
          <span className="stat-value">{user.trades}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Member Since</span>
          <span className="stat-value">{new Date(user.joinDate).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="account-section">
        <div className="section-header">
          <h2>Account Details</h2>
          <button 
            className="edit-btn"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="edit-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="save-btn">
              Save Changes
            </button>
          </form>
        ) : (
          <div className="account-info">
            <div className="info-row">
              <span className="info-label">Username</span>
              <span className="info-value">{user.username}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email</span>
              <span className="info-value">{user.email}</span>
            </div>
          </div>
        )}
      </div>

      <div className="account-section">
        <h2>Settings</h2>
        <div className="settings-list">
          <div className="setting-item">
            <span>Email Notifications</span>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <span>Trade Requests</span>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <span>Sound Effects</span>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage; 