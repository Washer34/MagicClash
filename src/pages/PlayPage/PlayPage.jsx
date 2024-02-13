import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { useSocket } from "../../SocketContext";

import { userAtom } from "../../atoms/userAtom";
import "./PlayPage.css";

const PlayPage = () => {
  const { id = roomId } = useParams();
  const navigate = useNavigate();
  const [user] = useAtom(userAtom);
  const [playerHand, setPlayerHand] = useState([]);
  const [opponentHandSize, setOpponentHandSize] = useState(0);

  const socket = useSocket();

  const handsReceived = ({ hand }) => {
    console.log(hand)
  }

  useEffect(() => {
    if (socket == null) return;

    socket.emit("playerReady", { roomId, userId: user.userId });

    socket.on("handsDistributed", handsReceived );

  }, [user.userId, id]);

  // Gestion du Drag & Drop
  const handleDragStart = (e, cardId) => {
    e.dataTransfer.setData("cardId", cardId);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("cardId");
    // Traitement de la carte déplacée, par exemple, envoyer un événement au serveur
    console.log(`Carte déplacée: ${cardId}`);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="play-page">
      <div
        className="game-board"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="player-hand">
          {playerHand.map((card) => (
            <img
              key={card.id}
              src={card.imageUrl}
              alt={card.name}
              draggable="true"
              onDragStart={(e) => handleDragStart(e, card.id)}
              className="card"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlayPage;
