// TradeActions.js
import React from 'react';

const TradeActions = () => {
  const handleTrade = () => {
    // Voeg je ruil logica toe
    alert('Handel gestart!');
  };

  return (
    <div className="trade-actions">
      <div className="action-header">
        <h3>Acties</h3>
      </div>
      <div className="actions">
        <button className="trade-btn" onClick={handleTrade}>
          Start Ruil
        </button>
        <button className="cancel-btn" onClick={() => alert('Actie geannuleerd')}>
          Annuleren
        </button>
      </div>
    </div>
  );
};

export default TradeActions;
