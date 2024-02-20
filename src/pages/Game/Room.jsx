import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAtom } from "jotai";
import { userAtom } from "../../atoms/userAtom";
import { useSocket } from "../../SocketContext";
import { toast } from 'react-toastify'

import "./Room.css";

const Room = () => {
  const [user] = useAtom(userAtom);
  const [loading, setLoading] = useState(true);
  const [decks, setDecks] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState("");
  const [gameDetails, setGameDetails] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [myHand, setMyHand] = useState([]);
  const [allPlayersReady, setAllPlayersReady] = useState(false);
  const navigate = useNavigate();
  const { roomId } = useParams();
  const {socket, isSocketConnected} = useSocket();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isSocketConnected || !socket) return;

    setLoading(true);

    if (socket && roomId) {
      socket.emit("requestGameDetails", { roomId });
      console.log("je demande les détails: ", roomId);
    }

    socket.on("gameDetails", ({ updatedGame }) => {
      console.log("gameDetails", updatedGame);
      setGameDetails(updatedGame);
      setLoading(false);
    });

    socket.on("gameUpdated", ({ updatedGame, allPlayersReady }) => {
      console.log("gameUpdated", updatedGame);
      setGameDetails(updatedGame);
      setAllPlayersReady(allPlayersReady);
      console.log("allPlayersReady", allPlayersReady);
      setLoading(false);
    });

    socket.on("playerReadyUpdate", ({ userId, isReady }) => {
      setGameDetails((currentDetails) => {
        const updatedPlayers = currentDetails.players.map((player) => {
          if (player.user._id === userId) {
            return { ...player, isReady };
          }
          return player;
        });
        return { ...currentDetails, players: updatedPlayers };
      });
    });

    socket.on("gameDeleted", ({ message }) => {
      toast.warn(message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      navigate("/games");
    });

    fetchData();

    return () => {
      socket.off("gameDetails");
      socket.off("gameUpdated");
      socket.off("playerReadyUpdate");
      socket.off("gameDeleted");
    };
  }, [user.token, socket, roomId, isSocketConnected]); // Dépendance pour recharger les decks si le token change

  const fetchData = async () => {
    if (user.token) {
      try {
        // Requête pour récupérer les decks de l'utilisateur
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
          throw new Error("Réponse non valide de l'API pour les decks");
        }

        const data = await response.json();
        setDecks(data); // Mettre à jour l'état local avec les decks récupérés
      } catch (error) {
        console.error("Erreur lors de la récupération des decks :", error);
      }

      // Vous pourriez également vouloir récupérer d'autres informations ici,
      // comme les détails de la partie actuelle si cela n'a pas déjà été fait.
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

  const handleisReady = (e) => {
    setIsReady(e.target.checked);
    socket.emit("playerReady", {
      roomId,
      userId: user.userId,
      isReady: e.target.checked,
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
                <div key={index}>
                  {player.user.username}{" "}
                  {gameDetails.playersReady.includes(player.user._id)
                    ? "OK"
                    : ""}
                </div> // Assurez-vous que `username` est la propriété correcte
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
          <label>
            <input type="checkbox" checked={isReady} onChange={handleisReady} />
            Je suis prêt
          </label>
          <button onClick={handleLeaveGame}>Quitter</button>
          {allPlayersReady && gameDetails.creator._id === user.userId && (
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
