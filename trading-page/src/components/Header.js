// Header.js
import React from 'react';

const Header = () => {
  return (
    <header>
      <div className="top-bar">
        <button className="side-btn"></button> 
        <div className="profile-icon">
          <img src="images/login.png" alt="Profiel" /> 
        </div>
        <button className="side-btn"></button>  
      </div>
    </header>
  );
};

export default Header;
