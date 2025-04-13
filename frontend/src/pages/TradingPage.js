import React, { useState, useEffect } from 'react';
import '../styles/TradingPage.css';

const TradingPage = () => {
  const [selectedCards, setSelectedCards] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('available');
  const [availableTrades, setAvailableTrades] = useState([]);
  const [myCards, setMyCards] = useState([]);
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    fetchAvailableTrades();
    fetchMyCards();
  }, []);

  const fetchAvailableTrades = async () => {
    try {
      const response = await fetch(`http://localhost:8000/endpoints/get_trades.php`);
      const data = await response.json();
      if (data.success) {
        setAvailableTrades(data.trades);
      }
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  };

  const fetchMyCards = async () => {
    try {
      const response = await fetch(`http://localhost:8000/endpoints/user_collection.php?user_id=${userId}`);
      const data = await response.json();
      setMyCards(data);
    } catch (error) {
      console.error('Error fetching cards:', error);
    }
  };

  const handleCreateTrade = async () => {
    if (selectedCards.length !== 2) {
      alert('Please select two cards to trade');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/endpoints/create_trade.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          offering_card_id: selectedCards[0].id,
          wanting_card_id: selectedCards[1].id
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Trade created successfully!');
        setSelectedCards([]);
        setActiveTab('available');
        fetchAvailableTrades();
      } else {
        alert('Failed to create trade: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating trade:', error);
      alert('Failed to create trade. Please try again.');
    }
  };

  const handleAcceptTrade = async (tradeId) => {
    try {
      const response = await fetch('http://localhost:8000/endpoints/accept_trade.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          trade_id: tradeId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Trade completed successfully!');
        fetchAvailableTrades();
        fetchMyCards();
      } else {
        alert('Failed to accept trade: ' + data.error);
      }
    } catch (error) {
      console.error('Error accepting trade:', error);
      alert('Failed to accept trade. Please try again.');
    }
  };

  const filteredTrades = searchQuery
    ? availableTrades.filter(trade => 
        trade.offering.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trade.wanting.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trade.user.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : availableTrades;

  return (
    <div className="trading-page">
      <h1>Trading Center</h1>

      <div className="trade-tabs">
        <button 
          className={`tab-btn ${activeTab === 'available' ? 'active' : ''}`}
          onClick={() => setActiveTab('available')}
        >
          Available Trades
        </button>
        <button 
          className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Create Trade
        </button>
      </div>

      {activeTab === 'available' && (
        <div className="available-trades">
          <input
            type="text"
            placeholder="Search trades..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          
          <div className="trades-list">
            {filteredTrades.map(trade => (
              <div key={trade.id} className="trade-card">
                <div className="trade-info">
                  <div className="trade-user">{trade.user}</div>
                  <div className="trade-cards">
                    <div className={`card-preview ${trade.offering.rarity}`}>
                      <span>Offering:</span>
                      <h3>{trade.offering.name}</h3>
                      {trade.offering.image && (
                        <img 
                          src={`http://localhost:8000/public/${trade.offering.image}`} 
                          alt={trade.offering.name}
                          className="card-image"
                        />
                      )}
                    </div>
                    <div className="trade-arrow">↔</div>
                    <div className={`card-preview ${trade.wanting.rarity}`}>
                      <span>Wanting:</span>
                      <h3>{trade.wanting.name}</h3>
                      {trade.wanting.image && (
                        <img 
                          src={`http://localhost:8000/public/${trade.wanting.image}`} 
                          alt={trade.wanting.name}
                          className="card-image"
                        />
                      )}
                    </div>
                  </div>
                </div>
                <button 
                  className="accept-btn"
                  onClick={() => handleAcceptTrade(trade.id)}
                >
                  Accept Trade
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <div className="create-trade">
          <h2>Select Cards to Trade</h2>
          <div className="my-cards-grid">
            {myCards.map(card => (
              <div 
                key={card.id}
                className={`card-preview ${card.rarity} ${
                  selectedCards.includes(card) ? 'selected' : ''
                }`}
                onClick={() => {
                  if (selectedCards.includes(card)) {
                    setSelectedCards(selectedCards.filter(c => c.id !== card.id));
                  } else if (selectedCards.length < 2) {
                    setSelectedCards([...selectedCards, card]);
                  }
                }}
              >
                <h3>{card.name}</h3>
                {card.image && (
                  <img 
                    src={`http://localhost:8000/public/${card.image}`} 
                    alt={card.name}
                    className="card-image"
                  />
                )}
                <span className="rarity-badge">{card.rarity}</span>
              </div>
            ))}
          </div>
          
          {selectedCards.length === 2 && (
            <div className="trade-preview">
              <h3>Trade Preview</h3>
              <div className="selected-cards">
                <div className={`card-preview ${selectedCards[0].rarity}`}>
                  <span>Offering:</span>
                  <h3>{selectedCards[0].name}</h3>
                  {selectedCards[0].image && (
                    <img 
                      src={`http://localhost:8000/public/${selectedCards[0].image}`} 
                      alt={selectedCards[0].name}
                      className="card-image"
                    />
                  )}
                </div>
                <div className="trade-arrow">↔</div>
                <div className={`card-preview ${selectedCards[1].rarity}`}>
                  <span>Wanting:</span>
                  <h3>{selectedCards[1].name}</h3>
                  {selectedCards[1].image && (
                    <img 
                      src={`http://localhost:8000/public/${selectedCards[1].image}`} 
                      alt={selectedCards[1].name}
                      className="card-image"
                    />
                  )}
                </div>
              </div>
              <button 
                className="create-trade-btn"
                onClick={handleCreateTrade}
              >
                Create Trade
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TradingPage; 