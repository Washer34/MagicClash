import { Rnd } from "react-rnd";
import { useState } from "react";
import "./Zone.css";

const Zone = ({ title, cards, onCardClick, onCardMove, onCardDoubleClick }) => {
  const getClassForZone = (title) => {
    switch (title) {
      case "Bibliothèque Joueur":
      case "Bibliothèque Adversaire":
        return "library-card";
      case "Exil":
        return "exile-card";
      case "Cimetière":
        return "graveyard-card";
      default:
        return "";
    }
  };

  const [hoveredIndex, setHoveredIndex] = useState(null);

  const cardClass = getClassForZone(title);


  return (
    <div className="zone">
      <h3>{title}</h3>
      <div className="zone-cards">
        {cards.map((card, index) => (
          <Rnd
            key={`${title}-${card.uuid}-${index}`}
            position={{
              x: card.position?.x || 0,
              y: card.position?.y || 0,
            }}
            size={{
              width: 100,
              height: 140,
            }}
            bounds="parent"
            onDragStop={(e, d) => {
              if (onCardMove) {
                console.log("Card moved:", card.uuid, "to position:", {
                  x: d.x,
                  y: d.y,
                });
                onCardMove(card.uuid, { x: d.x, y: d.y });
              }
            }}
            dragHandleClassName="card"
            enableResizing={{
              top: false,
              right: false,
              bottom: false,
              left: false,
              topRight: false,
              bottomRight: false,
              bottomLeft: false,
              topLeft: false,
            }}
            style={{ zIndex: index === hoveredIndex ? 1000 : index }}
            onMouseEnter={() => setHoveredIndex(index)}
            disableDragging={!onCardMove}
          >
            <img
              src={card.imageUrl}
              alt={card.name}
              className={`card ${cardClass} ${card.tap ? "tapped" : ""}`}
              onClick={() => onCardClick(card)}
              onDoubleClick={() => onCardDoubleClick(card)}
              style={{ width: "100%", height: "100%" }}
              draggable={false}
            />
          </Rnd>
        ))}
      </div>
    </div>
  );
};

export default Zone;
