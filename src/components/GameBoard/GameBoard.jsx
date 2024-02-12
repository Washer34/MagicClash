import { useState, useEffect, useRef } from "react";
import { useAtom } from "jotai";
import io from "socket.io-client";

import { userAtom } from "../../atoms/userAtom";
import "./GameBoard.css";

const GameBoard = ({ roomId, socket }) => {
  const [user] = useAtom(userAtom);
  const [player1Hand, setPlayer1Hand] = useState([]);
  const [player2Hand, setPlayer2Hand] = useState([]);

  useEffect(() => {
    console.log("roomId ", roomId);

    if (socket) {
      socket.on("handsDistributed", ({ player1Hand, player2Hand }) => {
        console.log("je reçois les mains");
        setPlayer1Hand(player1Hand);
        setPlayer2Hand(player2Hand);
      });

      return () => {
        socket.off("handsDistributed");
      };
    }
  }, [roomId, user.userId, socket]);

  const handleDragStart = (event, cardId) => {
    const rect = event.target.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;

    event.dataTransfer.setData("text/plain", cardId);
    event.dataTransfer.setData("offsetX", offsetX);
    event.dataTransfer.setData("offsetY", offsetY);
  };

  const handleDrop = (event) => {
    event.preventDefault();

    const cardId = event.dataTransfer.getData("text/plain");
    const offsetX = parseInt(event.dataTransfer.getData("offsetX"), 10);
    const offsetY = parseInt(event.dataTransfer.getData("offsetY"), 10);

    const gameBoardRect = document
      .querySelector(".game-board")
      .getBoundingClientRect();

    const newPosition = {
      x: event.clientX - gameBoardRect.left - offsetX,
      y: event.clientY - gameBoardRect.top - offsetY,
    };

    const cardElement = document.getElementById(cardId);
    if (cardElement) {
      cardElement.style.position = 'absolute';
      cardElement.style.left = `${newPosition.x}px`;
      cardElement.style.top = `${newPosition.y}px`;
    }
    socket.emit("moveCard", { cardId, newPosition });
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div className="game-board" onDragOver={handleDragOver} onDrop={handleDrop}>
      <h2>Main du Joueur1</h2>
      <div className="hand">
        {player1Hand.map((card) => (
          <img
            id={card.id}
            key={card.id}
            src={card.imageUrl}
            alt={card.name}
            draggable="true"
            onDragStart={(e) => handleDragStart(e, card.id)}
            className="card-image"
          />
        ))}
      </div>

      <h2>Main du Joueur2</h2>
      <div className="hand">
        {player2Hand.map((card) => (
          <img
            id={card.id}
            key={card.id}
            src={card.imageUrl}
            alt={card.name}
            draggable="true"
            onDragStart={(e) => handleDragStart(e, card.id)}
            className="card-image"
          />
        ))}
      </div>
    </div>
  );
};
export default GameBoard;
