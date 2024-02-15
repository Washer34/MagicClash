import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAtom } from "jotai";
import { userAtom } from "../../atoms/userAtom";
import { useSocket } from "../../SocketContext";

import './Room.css'

const Room = () => {
  const [user] = useAtom(userAtom);
  const [loading, setLoading] = useState(true);
  const [decks, setDecks] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState("");
  const [gameDetails, setGameDetails] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [myHand, setMyHand] = useState([]);
  const navigate = useNavigate();
  const { roomId } = useParams();
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    setLoading(true);

    const handleGameDetails = (details) => {
      setGameDetails(details);
      console.log(details);
    };

    const handleRoomClosed = () => {
      navigate("/games");
      console.log("l'hôte a quitté");
    };

    const handleGameStarted = () => {
      setGameStarted(true);
    };

    const handleHandDealt = ({ hand }) => {
      setMyHand(hand);
      console.log(hand);
    };

    socket.on("gameUpdated", handleGameDetails);
    socket.on("roomClosed", handleRoomClosed);
    socket.on("gameStarted", handleGameStarted);
    socket.on("handDealt", handleHandDealt);

    fetchData();

    return () => {
      socket.off("gameUpdated", handleGameDetails);
      socket.off("roomClosed", handleRoomClosed);
      socket.off("gameStarted", handleGameStarted);
      socket.off("handDealt", handleHandDealt);
    };
  }, [user.token, socket, roomId]); // Dépendance pour recharger les decks si le token change

  const fetchData = async () => {
    if (user.token) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/decks`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Réponse non valide");
        }

        const data = await response.json();
        setDecks(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des decks :", error);
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/games/${roomId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Réponse non valide");
        }

        const data = await response.json();
        console.log("infos room:", data);
        setGameDetails(data);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des infos de la partie :",
          error
        );
      }
    }
  };

  const handleSelectDeck = (e) => {
    setSelectedDeck(e.target.value);
    socket.emit("selectDeck", {
      deck: e.target.value,
      roomId,
      playerId: user.userId,
    });
  };

  const handleLeaveGame = () => {
    socket.emit("leaveGame", { roomId, playerId: user.userId });
    navigate("/games");
  };

  const handleStartGame = () => {
    socket.emit("startGame", { roomId });
  };

  return (
    <>
      {!gameStarted ? (
        <div>
          {gameDetails && (
            <>
              <h1>Room: {gameDetails.name}</h1>
              <div>Joueurs:</div>
              {gameDetails.players.map((player, index) => (
                <div key={index}>{player.user.username}</div> // Assurez-vous que `username` est la propriété correcte
              ))}
            </>
          )}
          <select value={selectedDeck} onChange={handleSelectDeck}>
            <option value="">Sélectionner un deck</option>
            {decks.map((deck) => (
              <option key={deck._id} value={deck._id}>
                {deck.name}
              </option>
            ))}
          </select>
          <button onClick={handleLeaveGame}>Quitter</button>
          {user.userId === gameDetails?.creator && (
            <button onClick={handleStartGame}>Lancer</button>
          )}
        </div>
      ) : (
          <>
          {myHand.map((card, index) => (
            <div className="test" key={index}>
              <p>{card.name}</p>
              <img src={card.imageUrl} alt={card.name} />
            </div>
          ))}
        </>
      )}
    </>
  );
};

export default Room;
