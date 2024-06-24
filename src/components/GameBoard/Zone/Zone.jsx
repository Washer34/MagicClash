import { Rnd } from "react-rnd";
import "./Zone.css";

const Zone = ({ title, cards, onCardClick, onCardMove }) => {
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

  const cardClass = getClassForZone(title);

  console.log("Rendering Zone - title:", title, "cards:", cards);

  return (
    <div className="zone">
      <h3>{title}</h3>
      <div
        className="zone-cards"
        style={{ position: "relative", width: "100%", height: "100%" }}
      >
        {cards.map((card, index) => (
          <Rnd
            key={`${title}-${card.scryfallId}-${index}`}
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
                console.log("Card moved:", card.scryfallId, "to position:", {
                  x: d.x,
                  y: d.y,
                });
                onCardMove(card.scryfallId, { x: d.x, y: d.y });
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
            style={{ zIndex: index }}
            onMouseEnter={(e) => (e.currentTarget.style.zIndex = 1000)}
            onMouseLeave={(e) => (e.currentTarget.style.zIndex = index)}
            disableDragging={!onCardMove}
          >
            <img
              src={card.imageUrl}
              alt={card.name}
              className={`card ${cardClass}`}
              onClick={() => onCardClick(card)}
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
