import React from 'react';
import Dock from './components/Dock'; // Dock-component importeren
import { VscHome, VscArchive, VscAccount, VscSettingsGear } from 'react-icons/vsc'; // React icons voor de Dock
import './App.css'; // Dit importeert je CSS-bestand

function App() {
  const items = [
    { icon: <VscHome size={30} />, label: '', onClick: () => alert('Home!') },
    { icon: <VscArchive size={30} />, label: '', onClick: () => alert('Archive!') },
    { icon: <VscAccount size={30} />, label: '', onClick: () => alert('Profile!') },
    { icon: <VscSettingsGear size={30} />, label: '', onClick: () => alert('Settings!') },
  ];

  return (

    
    <div>
      {/* Header met top-bar en profiel icoon */}
      <header>
        <div className="top-bar">
          <button className="side-btn"></button> 
          <div className="profile-icon">
            <img src="images/login.png" alt="Profiel" /> 
          </div>
          <button className="side-btn"></button>  
        </div>
      </header>

      {/* Main content met boxes */}
      <main className="content">
        <div className="large-box"></div>
        <div className="small-boxes">
          <div className="small-box"></div>  
          <div className="small-box"></div>  
        </div>
      </main>

      {/* Dock component hier onderaan */}
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
