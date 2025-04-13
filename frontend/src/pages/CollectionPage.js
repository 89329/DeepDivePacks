import React, { useState } from 'react';
import '../styles/CollectionPage.css';

const CollectionPage = () => {
  const [filter, setFilter] = useState('all');
  
  // Dummy data - replace with actual API call
  const cards = [
    { id: 1, name: 'Card 1', rarity: 'common' },
    { id: 2, name: 'Card 2', rarity: 'rare' },
    { id: 3, name: 'Card 3', rarity: 'holographic' },
    // Add more cards here
  ];

  const filteredCards = filter === 'all' 
    ? cards 
    : cards.filter(card => card.rarity === filter);

  return (
    <div className="collection-page">
      <h1>My Collection</h1>
      
      <div className="filter-controls">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`filter-btn ${filter === 'common' ? 'active' : ''}`}
          onClick={() => setFilter('common')}
        >
          Common
        </button>
        <button 
          className={`filter-btn ${filter === 'rare' ? 'active' : ''}`}
          onClick={() => setFilter('rare')}
        >
          Rare
        </button>
        <button 
          className={`filter-btn ${filter === 'holographic' ? 'active' : ''}`}
          onClick={() => setFilter('holographic')}
        >
          Holographic
        </button>
      </div>

      <div className="cards-grid">
        {filteredCards.map(card => (
          <div 
            key={card.id} 
            className={`collection-card ${card.rarity}`}
          >
            <div className="card-content">
              <h3>{card.name}</h3>
              <span className="rarity-badge">{card.rarity}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollectionPage; 