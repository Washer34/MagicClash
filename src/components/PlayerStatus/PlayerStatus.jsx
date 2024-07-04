import player1 from "/assets/player1.png";
import { useSocket } from "../../SocketContext";
import "./PlayerStatus.css";

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const PlayerStatus = ({ player, gameId }) => {
  const { socket } = useSocket();

  const handleLifeChange = (change) => {
    socket.emit("change life", { gameId, username: player.username, change });
  };

  return (
    <div className="player-status-card">
      <div className="player-status-picture">
        <img src={player1} alt={`${player.username}'s profile`} />
      </div>
      <div className="player-status-username">
        {capitalizeFirstLetter(player.username)}
      </div>
      <div className="player-status-healthbar">
        <button
          className="player-status-minus"
          onClick={() => handleLifeChange(-1)}
        >
          -
        </button>
        <div className="player-status-life">{player.life}</div>
        <button
          className="player-status-plus"
          onClick={() => handleLifeChange(1)}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default PlayerStatus;
