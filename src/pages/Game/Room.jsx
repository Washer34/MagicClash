import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { userAtom } from "../../atoms/userAtom";
import { useSocket } from "../../SocketContext";

const Room = () => {
  const { id } = useParams();
  const [roomDetails, setRoomDetails] = useState(null);
  const [isCreator, setIsCreator] = useState(false);
  const [user] = useAtom(userAtom);
  const navigate = useNavigate();
  const [decks, setDecks] = useState([]);
  const [selectedDeckId, setSelectedDeckId] = useState("");
  const [hasJoined, setHasJoined] = useState(false);

  const socket = useSocket();

  useEffect(() => {
    if (socket == null) return;

    const gameCreatedListener = (newGame) => {
      setRoomDetails((prevDetails) => ({ ...prevDetails, ...newGame }));
    };

    const checkCreator = (isCreatorStatus) => {
      setIsCreator(isCreatorStatus);
    };

    const updateRoomDetails = (updatedRoomDetails) => {
      setRoomDetails(updatedRoomDetails);
      const isUserCreator = updatedRoomDetails.creator === user.userId;
      setIsCreator(isUserCreator);
    };

    const playGame = () => {
      navigate(`/play/${id}`);
    };

    const testplayer = () => {
      console.log("test")
    }

    socket.on("playerJoined", gameCreatedListener);
    socket.on("playerLeft", gameCreatedListener);
    socket.on("isCreator", checkCreator);
    socket.on("updateRoom", updateRoomDetails);
    socket.on("gameReadyResponse", playGame);
    socket.on("playerReady", testplayer)

    const savedRoomDetails = sessionStorage.getItem("roomDetails");
    if (savedRoomDetails) {
      setRoomDetails(JSON.parse(savedRoomDetails));
    }

    if (user.userId && id) {
      fetchRoomInfos();
      fetchDecks();
    }

    if (decks.length > 0) {
      handleDeckSelection();
    }

    setHasJoined(true);
    return () => {
      if (hasJoined) {
        socket.off("playerJoined", gameCreatedListener);
        socket.off("playerLeft", gameCreatedListener);
        socket.off("isCreator", checkCreator);
        socket.off("updateRoom", updateRoomDetails);
        socket.off("gameReadyResponse", playGame);
      }
    };
  }, [id, user.userId, socket, hasJoined]);

  const startGame = () => {
    socket.emit("gameReady", { roomId: id });
  };

  const leaveRoom = async () => {
    navigate("/games");
    sessionStorage.removeItem("roomDetails");
  };

  const handleDeckSelection = (e) => {
    if (e) {
      setSelectedDeckId(e.target.value);
      socket.emit("deckSelected", {
        roomId: id,
        deckId: e.target.value,
        userId: user.userId,
      });
    }
  };

  const fetchRoomInfos = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/games/${id}`,
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
      setRoomDetails(data);

      sessionStorage.setItem("roomDetails", JSON.stringify(data));

      if (data.isCreator) {
        setIsCreator(true);
      }
    } catch (error) {
      console.error("Erreur lors de la connection à la partie:", error);
    }
  };

  const fetchDecks = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/decks`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des decks");
      }
      const data = await response.json();
      setDecks(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des decks:", error);
    }
  };

  const players = [roomDetails?.player1, roomDetails?.player2].filter(Boolean);

  return (
    <div className="page-content">
      <h1>Room: {roomDetails?.name}</h1>
      <h2>Joueurs:</h2>
      <ul>
        {players.map((player) => (
          <li key={player._id}>{player.username}</li>
        ))}
      </ul>
      <select value={selectedDeckId} onChange={handleDeckSelection}>
        {selectedDeckId === "" && (
          <option value="">Sélectionner un deck</option>
        )}
        {decks.map((deck) => (
          <option key={deck._id} value={deck._id}>
            {deck.name}
          </option>
        ))}
      </select>
      {isCreator && players.length === 2 && (
        <button className="start-btn" onClick={startGame}>
          Lancer
        </button>
      )}
      <button className="leave-btn" onClick={leaveRoom}>
        Quitter
      </button>
    </div>
  );
};

export default Room;
