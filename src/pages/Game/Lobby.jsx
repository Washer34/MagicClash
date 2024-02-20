import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAtom } from "jotai";

import { userAtom } from "../../atoms/userAtom";
import { useSocket } from "../../SocketContext";

const Lobby = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user] = useAtom(userAtom);
  const [roomName, setRoomName] = useState("");
  const navigate = useNavigate();
  const {socket, isSocketConnected} = useSocket();

  useEffect(() => {
    if (!socket || !isSocketConnected) return;
    setLoading(true);

    socket.emit("requestGames");

    socket.on("updateGamesList", (games) => {
      setRooms(games);
      setLoading(false);
    });

    socket.on("gamesListUpdated", () => {
      socket.emit("requestGames");
    })

    socket.on("createdGame", (game) => {
      navigate(`/room/${game.gameId}`);
    })

    return () => {
      socket.off("updateGamesList");
      socket.off("createdGame");
      socket.off("gamesListUpdated");
    };
  }, [socket, isSocketConnected]);

  const handleCreateRoom = (e) => {
    e.preventDefault();

    if (!roomName.trim()) return;

    socket.emit("createGame", { name: roomName, creator: user.userId });
  };

  const handleJoinRoom = (gameId) => {
    socket.emit("joinGame", { roomId: gameId, userId: user.userId });

    navigate(`/room/${gameId}`);
  };

  return (
    <div>
      <h1>Lobby</h1>
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div>
          <form onSubmit={handleCreateRoom}>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Nom de la partie"
              required
            />
            <button type="submit">Créer une Partie</button>
          </form>
          {rooms.map((room) => (
            <div
              key={room._id}
              style={{ color: room.status === "inProgress" ? "red" : "green" }}
            >
              <p>Partie {room.name}</p>
              <p>Nombre de joueurs: {room.players.length} </p>
              <p>
                Statut:{" "}
                {room.status === "inProgress" ? "En cours" : "En attente"}
              </p>
              {room.status === "waiting" && (
                <button onClick={() => handleJoinRoom(room._id)}>
                  Rejoindre
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Lobby;
