// App.js
import React from 'react';
import Header from './components/Header.js';
import TradeCard from './components/TradeCard.js';
import TradeActions from './components/TradeActions.js';  // voorbeeld voor onderste helft
import Dock from './components/Dock.js'; 
import './App.css';

function App() {
  return (
    <div>
      <Header />
      <main className="content">
        <TradeCard />
        <div className="bottom-content">
          <TradeActions />
        </div>
      </main>
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
