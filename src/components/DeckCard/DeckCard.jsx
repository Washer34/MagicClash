import React from "react";
import "./DeckCard.css";

const DeckCard = ({ deck, onClick, isSelected }) => {
  return (
    <div
      className={`deck-card ${isSelected ? "selected" : ""}`}
      onClick={() => onClick(deck)}
    >
      <h3>{deck.name}</h3>
    </div>
  );
};

export default DeckCard;
