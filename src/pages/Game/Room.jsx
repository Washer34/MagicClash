import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { userAtom } from "../../atoms/userAtom";
import io from "socket.io-client";
import GameBoard from "../../components/GameBoard/GameBoard";

const Room = () => {
  const { id } = useParams();
  const [roomDetails, setRoomDetails] = useState(null);
  const [isCreator, setIsCreator] = useState(false);
  const [user] = useAtom(userAtom);
  const navigate = useNavigate();
  const socket = useRef(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [decks, setDecks] = useState([]);
  const [selectedDeckId, setSelectedDeckId] = useState("");

  useEffect(() => {
    socket.current = io("http://localhost:3000");

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
        console.log(data);
        setRoomDetails(data);

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

    if (id) {
      socket.current.emit("joinRoom", { roomId: id });
    }

    socket.current.on("playerJoined", (updatedRoomDetails) => {
      console.log(`quelqu'un a rejoint: `, updatedRoomDetails);
      setRoomDetails(updatedRoomDetails);
    });

    socket.current.on("playerLeft", (updatedRoomDetails) => {
      setRoomDetails(updatedRoomDetails);
    });

    socket.current.on("gameStarted", () => {
      console.log("Le jeu commence!");
      setIsGameStarted(true);
      socket.current.emit("gameReady", { roomId: id, userId: user.userId });
    });

    if (user.token && id) {
      fetchRoomInfos();
      fetchDecks();
    }

    if (decks.length > 0) {
      handleDeckSelection();
    }

    return () => {
      socket.current.emit("leaveRoom", id);
      socket.current.off("playerJoined");
      socket.current.off("playerLeft");
      socket.current.off("gameStarted");
      socket.current.disconnect();
      console.log("j'ai delete")
    };
  }, [id]);

  const startGame = () => {
    socket.current.emit("startGame", { roomId: id });
  };

  const leaveRoom = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/games/${id}/leave`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ userId: user._id }),
        }
      );

      if (!response.ok) {
        // Si la réponse n'est pas ok, lance une erreur pour passer au bloc catch
        throw new Error("Erreur lors de la sortie de la room");
      }

      const data = await response.json();
      if (data.message === "Partie supprimée") {
        navigate("/games");
      } else {
        console.log("Vous avez quitté la room", data);
        navigate("/games");
      }
    } catch (error) {
      console.error("Erreur lors de la sortie de la room:", error);
      // Ici, vous pouvez gérer l'erreur, par exemple, en affichant un message à l'utilisateur
    }
  };

  const handleDeckSelection = (e) => {
    if (e) {
      setSelectedDeckId(e.target.value);
      socket.current.emit("deckSelected", {
        roomId: id,
        deckId: e.target.value,
        userId: user.userId,
      });
    }
  }

  const players = [roomDetails?.player1, roomDetails?.player2].filter(Boolean);

  return (
    <div className="page-content">
      {isGameStarted ? (
        <GameBoard roomId={id} socket={socket.current} />
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

export default Room;
