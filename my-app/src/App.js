// App.js

import React from 'react';
import Dock from './components/Dock'; // If Dock is in the components folder
import { VscHome, VscArchive, VscAccount, VscSettingsGear } from 'react-icons/vsc';  // Assuming you use react-icons

function App() {
  const items = [
    { icon: <VscHome size={18} />, label: 'Home', onClick: () => alert('Home!') },
    { icon: <VscArchive size={18} />, label: 'Archive', onClick: () => alert('Archive!') },
    { icon: <VscAccount size={18} />, label: 'Profile', onClick: () => alert('Profile!') },
    { icon: <VscSettingsGear size={18} />, label: 'Settings', onClick: () => alert('Settings!') },
  ];

  return (
    <div>
      <header>
        <div className="top-bar">
          <button className="side-btn"></button> 
          <div className="profile-icon">
            <img src="images/login.png" alt="Profiel" /> 
          </div>
          <button className="side-btn"></button>  
        </div>
      </header>

      <main className="content">
        <div className="large-box"></div>
        <div className="small-boxes">
          <div className="small-box"></div>  
          <div className="small-box"></div>  
        </div>
      </main>

      {/* Dock Component Below */}
      <Dock 
        items={items}
        panelHeight={68}
        baseItemSize={50}
        magnification={70}
      />
    </div>
  );
}

export default App;
