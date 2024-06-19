import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useSocket } from "../../SocketContext";
import "./Lobby.css";

const Lobby = () => {
  const user = useSelector((state) => state.user);
  const [games, setGames] = useState([]);
  const [newGameName, setNewGameName] = useState("");
  const navigate = useNavigate();
  const { socket, isSocketConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isSocketConnected) return;

    const handleGamesList = (games) => {
      console.log(games);
      setGames(games);
    };

    const handleGameCreated = (game) => {
      console.log(game);
      navigate(`/game/${game.gameId}`);
    };

    socket.emit("get games list");
    socket.on("games list", handleGamesList);
    socket.on("game created", handleGameCreated);

    return () => {
      socket.off("games list", handleGamesList);
      socket.off("game created", handleGameCreated);
    };
  }, [socket, isSocketConnected, navigate]);

  const joinGame = (gameId) => {
    socket.emit("join game", gameId, user.userId);
    navigate(`/game/${gameId}`);
  };

  const createGame = () => {
    if (newGameName.trim() !== "") {
      socket.emit("create game", newGameName, user.userId);
    } else {
      alert("Veuillez entrer un nom de partie.");
    }
  };

  return (
    <div className="lobby">
      <h1>Lobby</h1>
      <div className="create-game">
        <input
          type="text"
          value={newGameName}
          onChange={(e) => setNewGameName(e.target.value)}
          placeholder="Nom de la partie"
        />
        <button onClick={createGame}>Créer une partie</button>
      </div>
      <div className="games-list">
        {games.map((game) => (
          <div key={game.gameId} className="game-card">
            <h2>{game.name}</h2>
            <p>Joueurs: {game.players.length}</p>
            <p>Status: {game.status}</p>
            <button onClick={() => joinGame(game.gameId)}>Rejoindre</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Lobby;
