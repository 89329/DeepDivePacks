import React, { useState } from 'react';
import '../styles/HomePage.css';

const HomePage = () => {
  const [isOpening, setIsOpening] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [revealedCards, setRevealedCards] = useState([]);
  const userId = localStorage.getItem('user_id');

  const handleOpenPack = async () => {
    setIsOpening(true);
    try {
      const response = await fetch('http://localhost:8000/endpoints/open_pack.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          collection_id: 1 // Using Series 1 collection
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Start the reveal animation
        setTimeout(() => {
          setRevealedCards(data.cards);
          setShowCards(true);
          setIsOpening(false);
        }, 2000);
      } else {
        alert('Failed to open pack: ' + data.error);
        setIsOpening(false);
      }
    } catch (error) {
      console.error('Error opening pack:', error);
      alert('Failed to open pack. Please try again.');
      setIsOpening(false);
    }
  };

  return (
    <div className="home-page">
      <h1>Available Collections</h1>
      
      <div className="collection-container">
        <div className="collection-card">
          <div className="collection-image">
            {/* Placeholder for collection image */}
            <div className="placeholder-image"></div>
          </div>
          <div className="collection-info">
            <h2>Series 1</h2>
            <p>Discover rare and unique cards in our first collection!</p>
            <button 
              className={`open-pack-btn ${isOpening ? 'opening' : ''}`}
              onClick={handleOpenPack}
              disabled={isOpening}
            >
              {isOpening ? 'Opening...' : 'Open Pack'}
            </button>
          </div>
        </div>
      </div>

      {showCards && (
        <div className="revealed-cards">
          <div className="card-reveal-container">
            <h3>You got:</h3>
            <div className="cards-grid">
              {revealedCards.map((card, index) => (
                <div 
                  key={card.id} 
                  className={`card-preview ${card.rarity}`}
                  style={{ animationDelay: `${index * 0.2}s` }}
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
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage; 