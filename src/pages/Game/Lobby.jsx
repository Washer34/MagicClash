import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';

import { userAtom } from '../../atoms/userAtom';

const socket = io('http://localhost:3000');

const Lobby = () => {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user] = useAtom(userAtom);
  const [roomName, setRoomName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {

    setLoading(true);
    const fetchGames = () => {
      fetch(`${import.meta.env.VITE_API_URL}/api/games`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })
        .then(response => response.json())
        .then(data => {
          setParties(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Erreur lors du chargement des parties:', error);
          setLoading(false);
        });
    }

    fetchGames();

    socket.on('gameCreated', (newGame) => {
      setParties(prevParties => {
        // Vérifier si la partie est déjà présente
        if (prevParties.some(party => party._id === newGame._id)) {
          return prevParties; // Si déjà présente, ne rien changer
        }
        return [...prevParties, newGame]; // Sinon, ajouter la nouvelle partie
      });
    });
    return () => {
      socket.off('gameCreated');
    };
  }, []);

  const handleJoinParty = (partyId) => {
    fetch(`${import.meta.env.VITE_API_URL}/api/games/${partyId}/join`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user.token}`,
    },
    body: JSON.stringify({ userId: user._id })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Erreur lors de la connection à la partie');
    }
    return response.json();
    })
    .then(() => {
    navigate(`/room/${partyId}`); // Redirige vers la page de la room après la jointure
    })
    .catch(error => {
    console.error('Erreur lors de la jointure de la partie:', error);
    // Gérer l'affichage des erreurs dans l'interface utilisateur
    });
    navigate(`/room/${partyId}`);
    };

  const handleCreateParty = () => {
    fetch(`${import.meta.env.VITE_API_URL}/api/games`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({ name: roomName }),
    })
      .then(response => response.json())
      .then(newGame => {
        navigate(`/room/${newGame._id}`); // Redirige vers la page de la room créée
      })
      .catch(error => {
        console.error('Erreur lors de la création de la partie:', error);
        // Gérer l'affichage des erreurs dans l'interface utilisateur
      });
  };

  return (
    <div>
      <h1>Lobby</h1>
      {loading ? <p>Chargement...</p> : (
        <div>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Nom de la partie"
          />
          <button onClick={handleCreateParty}>Créer une Partie</button>
          {parties.map(party => (
            <div key={party._id}>
              <p>Partie {party.name} - {party._id}</p>
              <p>Nombre de joueurs: {party.players.length}</p>
              <p>Status: {party.status}</p>
              <button onClick={() => handleJoinParty(party._id)}>Rejoindre</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Lobby;