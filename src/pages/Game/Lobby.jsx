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
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;
    setLoading(true);

    if (user.token) {
      fetchGames();
    }

    const handleGameCreated = (game) => {
      setRooms((prevRooms) => [...prevRooms, game]);
      console.log("gamecreated", game);
    };

    const handleGameDeleted = ({ roomId }) => {
      setRooms((prevRooms) => prevRooms.filter((room) => room._id !== roomId));
    };

    socket.on("gameCreated", handleGameCreated);
    socket.on("gameDeleted", handleGameDeleted);

    const handleGameCreatedForCreator = ({ gameId }) => {
      console.log("reçu");
      navigate(`/room/${gameId}`);
    };
    socket.on("gameCreatedForCreator", handleGameCreatedForCreator);

    return () => {
      socket.off("gameCreated", handleGameCreated);
      socket.off("gameDeleted", handleGameDeleted);
      socket.off("gameCreatedForCreator", handleGameCreatedForCreator);
    };
  }, [user.token, socket]);

  const fetchGames = () => {
    fetch(`${import.meta.env.VITE_API_URL}/api/games`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setRooms(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des parties:", error);
        setLoading(false);
      });
  };

  const handleCreateRoom = (e) => {
    e.preventDefault();

    if (!roomName.trim()) return;
    console.log(roomName);

    socket.emit("createGame", { name: roomName, creator: user.userId });
  };

  const handleJoinRoom = (gameId) => {
    socket.emit("joinGame", { gameId, playerId: user.userId });

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
            <div key={room._id}>
              <p>Partie {room.name}</p>
              <p>Nombre de joueurs: {room.players.length} </p>
              <p>Status: {room.status}</p>
              <button onClick={() => handleJoinRoom(room._id)}>
                Rejoindre
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Lobby;
