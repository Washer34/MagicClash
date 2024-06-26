import "./CardsModal.css";

const CardsModal = ({ title, cards, onClose, onCardClick }) => {
  const handleBackgroundClick = (e) => {
    if (e.target.className === "cards-modal") {
      onClose();
    }
  };

  return (
    <div className="cards-modal" onClick={handleBackgroundClick}>
      <div className="cards-modal-content">
        <h2>{title}</h2>
        <div className="cards-container">
          {cards.map((card, index) => (
            <img
              key={index}
              src={card.imageUrl}
              alt={card.name}
              className="cards-modal-card"
              onClick={() => onCardClick(card)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardsModal;
