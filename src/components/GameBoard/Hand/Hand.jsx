import { Droppable, Draggable } from "react-beautiful-dnd";
import { useState } from "react";
import "./Hand.css";
import cardBack from "../../../../public/assets/card-back.webp";

const Hand = ({ cards, droppableId, isOpponent, onCardClick }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const calculateCardStyle = (index, totalCards) => {
    const overlap = totalCards > 8 ? Math.min(60 / totalCards, 10) : 0;
    const rotation = totalCards > 8 ? (index - (totalCards - 1) / 2) * 3 : 0;
    return {
      marginLeft: `${-overlap}px`,
      transform: `rotate(${rotation}deg)`,
      zIndex: index,
      ...(hoveredIndex === index && {
        transform: `rotate(${rotation}deg) scale(1.1) translateY(-10px)`,
        zIndex: 1000,
      }),
    };
  };

  return (
    <Droppable
      droppableId={droppableId}
      direction="horizontal"
      isDropDisabled={isOpponent}
    >
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={isOpponent ? "opponent-hand" : "player-hand"}
        >
          {cards.map((card, index) =>
            isOpponent ? (
              <img
                key={`opponent-card-${index}`}
                src={cardBack}
                alt="Unknown Card"
                className="card hand-card"
              />
            ) : (
              <Draggable
                key={`player-card-${card.uuid}-${index}`}
                draggableId={`player-card-${card.uuid}-${index}`}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="card-container"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <div style={calculateCardStyle(index, cards.length)}>
                      <img
                        src={card.imageUrl}
                        alt={card.name}
                        className="card hand-card"
                        onClick={() => onCardClick(card)}
                      />
                    </div>
                  </div>
                )}
              </Draggable>
            )
          )}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default Hand;
