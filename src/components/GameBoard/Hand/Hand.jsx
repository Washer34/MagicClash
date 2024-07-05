import { Droppable, Draggable } from "react-beautiful-dnd";
import { useState } from "react";
import "./Hand.css";
import cardBack from "/assets/card-back.webp";

const Hand = ({
  cards,
  droppableId,
  isOpponent,
  onCardClick,
  onCardRightClick,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const calculateCardStyle = (index, totalCards, isOpponent) => {
    const overlap = totalCards > 8 ? Math.min(60 / totalCards, 10) : 0;
    const baseRotation = (index - (totalCards - 1) / 2) * 3;
    const rotation = isOpponent ? -baseRotation : baseRotation;

    return {
      marginLeft: `${-overlap}px`,
      transform: `rotate(${rotation}deg)`,
      zIndex: index,
      ...(hoveredIndex === index && {
        transform: `rotate(${rotation}deg) scale(1.1) translateY(${
          isOpponent ? "10px" : "-10px"
        })`,
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
          {cards &&
            cards.map((card, index) =>
              isOpponent ? (
                <div
                  key={`opponent-card-${index}`}
                  className="card-container"
                  style={calculateCardStyle(index, cards.length, isOpponent)}
                >
                  <img
                    src={cardBack}
                    alt="Unknown Card"
                    className="card hand-card"
                  />
                </div>
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
                      <div
                        style={calculateCardStyle(
                          index,
                          cards.length,
                          isOpponent
                        )}
                      >
                        <img
                          src={card.imageUrl}
                          alt={card.name}
                          className="card hand-card"
                          onClick={() => onCardClick(card)}
                          onContextMenu={(e) => onCardRightClick(e, card)}
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
