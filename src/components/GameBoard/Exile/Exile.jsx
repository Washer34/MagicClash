import "./Exile.css";

const Exile = ({ cards, onCardClick, onCardRightClick, onClose }) => {
  const handleBackgroundClick = (e) => {
    if (e.target.className === "exile-modal") {
      onClose();
    }
  };

  return (
    <div className="exile-modal" onClick={handleBackgroundClick}>
      <div className="exile-modal-content">
        <h2>Exil</h2>
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

export default Exile;