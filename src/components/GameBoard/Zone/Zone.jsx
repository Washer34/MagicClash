import { Rnd } from "react-rnd";
import { useState, useEffect, useRef } from "react";
import "./Zone.css";

const CARD_WIDTH = 100;
const CARD_HEIGHT = 140;

const Zone = ({
  title,
  cards,
  onCardClick,
  onCardMove,
  onCardDoubleClick,
  onCardRightClick,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [zoneRect, setZoneRect] = useState({ width: 1, height: 1 });
  const zoneRef = useRef(null);

  useEffect(() => {
    const updateRect = () => {
      if (zoneRef.current) {
        setZoneRect(zoneRef.current.getBoundingClientRect());
      }
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
  }, []);

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

  const handleDragStop = (e, d, card) => {
    if (onCardMove) {
      const percentX = ((d.x + CARD_WIDTH / 2) / zoneRect.width) * 100;
      const percentY = ((d.y + CARD_HEIGHT / 2) / zoneRect.height) * 100;

      onCardMove(card.uuid, { x: percentX, y: percentY });
    }
  };


  const cardClass = getClassForZone(title);

  return (
    <div
      className={`zone ${title.toLowerCase().replace(" ", "-")}`}
      ref={zoneRef}
    >
      <div className="zone-cards">
        {cards.map((card, index) => (
          <Rnd
            key={`${title}-${card.uuid}-${index}`}
            position={{
              x: (card.position?.x / 100) * zoneRect.width - CARD_WIDTH / 2,
              y: (card.position?.y / 100) * zoneRect.height - CARD_HEIGHT / 2,
            }}
            size={{
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
            }}
            bounds="parent"
            onDragStop={(e, d) => handleDragStop(e, d, card)}
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
              onContextMenu={(e) => onCardRightClick(e, card)}
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
