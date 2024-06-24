import { Droppable, Draggable } from "react-beautiful-dnd";
import "./Hand.css";
import cardBack from "../../../../public/assets/card-back.webp";

const Hand = ({ cards, droppableId, isOpponent, onCardClick }) => (
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
              key={`player-card-${card.scryfallId}-${index}`}
              draggableId={`player-card-${card.scryfallId}-${index}`}
              index={index}
            >
              {(provided) => (
                <img
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  src={card.imageUrl}
                  alt={card.name}
                  className="card hand-card"
                  onClick={() => onCardClick(card)}
                />
              )}
            </Draggable>
          )
        )}
        {provided.placeholder}
      </div>
    )}
  </Droppable>
);

export default Hand;
