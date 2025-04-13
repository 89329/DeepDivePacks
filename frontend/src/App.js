import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import CollectionPage from './pages/CollectionPage';
import TradingPage from './pages/TradingPage';
import AccountPage from './pages/AccountPage';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <div className="app-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/collection" element={<CollectionPage />} />
            <Route path="/trading" element={<TradingPage />} />
            <Route path="/account" element={<AccountPage />} />
          </Routes>
        </div>
        <Navigation />
      </div>
    </Router>
  );
}

export default App;
