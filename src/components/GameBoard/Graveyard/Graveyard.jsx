import "./Graveyard.css";

const Graveyard = ({ cards, onCardClick, onCardRightClick, onClose }) => {
  const handleBackgroundClick = (e) => {
    if (e.target.className === "graveyard-modal") {
      onClose();
    }
  };

  return (
    <div className="graveyard-modal" onClick={handleBackgroundClick}>
      <div className="graveyard-modal-content">
        <h2>Cimetière</h2>
        <div className="cards-container">
          {cards.map((card, index) => (
            <img
              key={index}
              src={card.imageUrl}
              alt={card.name}
              className="cards-modal-card"
              onClick={() => onCardClick(card)}
              onContextMenu={(e) => onCardRightClick(e, card)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Graveyard;
