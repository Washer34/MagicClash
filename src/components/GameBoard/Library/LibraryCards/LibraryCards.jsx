import './LibraryCards.css'

const LibraryCards = ({ cards, onClose, onCardClick }) => {
  const handleBackgroundClick = (e) => {
    if (e.target.className === "library-modal") {
      onClose();
    }
  };

  return (
    <div className="library-modal" onClick={handleBackgroundClick}>
      <div className="library-modal-content">
        <div className="cards-container">
          {cards.map((card, index) => (
            <img
              key={index}
              src={card.imageUrl}
              alt={card.name}
              className="library-card"
              onClick={() => onCardClick(card)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LibraryCards