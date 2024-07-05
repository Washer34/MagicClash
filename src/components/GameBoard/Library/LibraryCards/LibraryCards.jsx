import { useState, useEffect } from "react";
import "./LibraryCards.css";

const LibraryCards = ({ cards, onClose, onCardClick, onCardRightClick }) => {
  const [displayedCards, setDisplayedCards] = useState(cards);

  useEffect(() => {
    setDisplayedCards(cards);
  }, [cards]);

  const handleBackgroundClick = (e) => {
    if (e.target.className === "library-modal") {
      onClose();
    }
  };

  return (
    <div className="library-modal" onClick={handleBackgroundClick}>
      <div className="library-modal-content">
        <div className="cards-container">
          {displayedCards.map((card, index) => (
            <img
              key={index}
              src={card.imageUrl}
              alt={card.name}
              className="library-card"
              onClick={() => onCardClick(card)}
              onContextMenu={(e) => onCardRightClick(e, card)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LibraryCards;
