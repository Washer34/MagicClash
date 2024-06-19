import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useSocket } from "../../SocketContext";
import "./GameDetails.css";
import DeckCard from "../../components/DeckCard/DeckCard";
import GameBoard from "../../components/GameBoard/GameBoard";

const GameDetails = () => {
  const { gameId } = useParams();
  const user = useSelector((state) => state.user);
  const [gameDetails, setGameDetails] = useState(null);
  const [inGameDetails, setInGameDetails] = useState(null);
  const [userDecks, setUserDecks] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const { socket, isSocketConnected } = useSocket();
  const [error, setError] = useState("");
  const [isInProgress, setIsInProgress] = useState(false);

  useEffect(() => {
    if (!socket || !isSocketConnected) return;

    const handleGameDetails = (details) => {
      console.log("gamedetails: ", details);
      setGameDetails(details);
      if (details.status === "in-progress" || details.status === "started") {
        setIsInProgress(true);
      }
    };

    const handleInGameUpdate = (details) => {
      console.log("In-game update received", details);
      setInGameDetails(details);
    };

    const handleUserDecks = (decks) => {
      setUserDecks(decks);
    };

    const handleGameStarted = () => {
      setIsInProgress(true);
    };

    socket.emit("get game details", gameId);
    socket.emit("get user decks", user.userId);
    socket.on("game details", handleGameDetails);
    socket.on("user decks", handleUserDecks);
    socket.on("game started", handleGameStarted);
    socket.on("ingame update", handleInGameUpdate);

    return () => {
      socket.off("game details", handleGameDetails);
      socket.off("user decks", handleUserDecks);
      socket.off("game started", handleGameStarted);
      socket.off("ingame update", handleInGameUpdate);
    };
  }, [socket, isSocketConnected, gameId, user.userId]);

  const handleDeckSelection = (deck) => {
    setSelectedDeck(deck);
    socket.emit("set deck", { gameId, userId: user.userId, deckId: deck._id });
  };

  const startGame = () => {
    socket.emit("start game", gameId);
  };

  const toggleReady = () => {
    socket.emit("toggle ready", { gameId, userId: user.userId });
  };

  if (!gameDetails) {
    return <div>Loading...</div>;
  }

  if (isInProgress && inGameDetails) {
    return <GameBoard gameId={gameId} inGameDetails={inGameDetails} />;
  }

  return (
    <div className="game-details">
      <h1>Game: {gameDetails.name}</h1>
      <h2>Host: {gameDetails.host}</h2>
      <h3>Status: {gameDetails.status}</h3>
      {error && <p className="error">{error}</p>}
      <div className="players-list">
        <h4>Players:</h4>
        <ul>
          {gameDetails.players.map((player) => (
            <li key={player.username}>
              {player.username}
              <span
                className={`ready-status ${
                  player.isReady ? "ready" : "not-ready"
                }`}
              >
                {player.isReady ? "Ready" : "Not Ready"}
              </span>
              {player.username === user.username && (
                <button className="toggle-ready" onClick={toggleReady}>
                  {player.isReady ? "Not Ready" : "Ready"}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="deck-selection">
        <h4>Select your deck:</h4>
        <div className="deck-cards">
          {userDecks.map((deck) => (
            <DeckCard
              key={deck._id}
              deck={deck}
              onClick={handleDeckSelection}
              isSelected={selectedDeck && selectedDeck._id === deck._id}
            />
          ))}
        </div>
      </div>
      {gameDetails.host === user.username &&
        gameDetails.players.every(
          (player) => player.isReady && player.deck
        ) && <button onClick={startGame}>Start Game</button>}
    </div>
  );
};

export default GameDetails;
