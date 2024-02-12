import { useState, useEffect } from "react";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { useAtom } from "jotai";

import { userAtom } from "../../atoms/userAtom";

const socket = io("http://localhost:3000");

const Lobby = () => {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user] = useAtom(userAtom);
  const [roomName, setRoomName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const fetchGames = () => {
      fetch(`${import.meta.env.VITE_API_URL}/api/games`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setParties(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Erreur lors du chargement des parties:", error);
          setLoading(false);
        });
    };
    if (user.token) {
      fetchGames();
    }

    socket.on("gameCreated", (newGame) => {
      setParties((prevParties) => {
        // Vérifier si la partie est déjà présente
        if (prevParties.some((party) => party._id === newGame._id)) {
          return prevParties; // Si déjà présente, ne rien changer
        }
        return [...prevParties, newGame]; // Sinon, ajouter la nouvelle partie
      });
    });

    socket.on("gameDeleted", ({ gameId }) => {
      setParties((currentParties) => currentParties.filter(party => party._id !== gameId));
    });

    return () => {
      socket.off("gameCreated");
      socket.off("gameDeleted");
    };

  }, []);

  const handleJoinParty = async (partyId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/games/${partyId}/join`,
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
        throw new Error("Erreur lors de la connection à la partie");
      }

      await response.json(); // Si vous avez besoin de traiter la réponse JSON

      navigate(`/room/${partyId}`); // Redirige vers la page de la room après la jointure
    } catch (error) {
      console.error("Erreur lors de la jointure de la partie:", error);
      // Ici, vous pouvez gérer l'affichage des erreurs dans l'interface utilisateur
      // Par exemple, en mettant à jour l'état d'une variable pour afficher un message d'erreur à l'utilisateur
    }
  };

  const handleCreateParty = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/games`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ name: roomName }),
        }
      );
      const newGame = await response.json();

      if (!response.ok) {
        throw new Error("Erreur lors de la création de la partie");
      }

      navigate(`/room/${newGame._id}`);
    } catch (error) {
      console.error("Erreur lors de la création de la partie", error);
    }
  };

  return (
    <div>
      <h1>Lobby</h1>
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div>
          <form onSubmit={handleCreateParty}>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Nom de la partie"
              required
            />
            <button type="submit">Créer une Partie</button>
          </form>
          {parties.map((party) => (
            <div key={party._id}>
              <p>Partie {party.name}</p>
              <p>
                Nombre de joueurs:{" "}
                {party.player1 ? 1 : 0 + party.player2 ? 1 : 0}
              </p>
              <p>Status: {party.status}</p>
              <button onClick={() => handleJoinParty(party._id)}>
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
