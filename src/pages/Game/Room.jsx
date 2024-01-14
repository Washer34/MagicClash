
import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom } from '../../atoms/userAtom';

const Room = () => {
  const { id } = useParams();
  const [roomDetails, setRoomDetails] = useState(null);
  const [user] = useAtom(userAtom);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchRoomInfos = async () => {
      if (user.token) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/games/${id}`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          });
          if (!response.ok) {
            throw new Error('Réponse non valide');
          }
          const data = await response.json();
          setRoomDetails(data);
        } catch (error) {
          console.error('Erreur lors de la connection à la partie:', error);
        }
      }
    };
    fetchRoomInfos();

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = ''; // Nécessaire pour certains navigateurs
      console.log('Tentative de quitter la room');
      leaveRoom(); // Fonction pour gérer la sortie de la room
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      leaveRoom();
    };
  }, [id, user, location]);

  const leaveRoom = () => {
    fetch(`${import.meta.env.VITE_API_URL}/api/games/${id}/leave`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({ userId: user._id })
    })
      .then(response => response.json())
      .then(data => {
        if (data.message === 'Room supprimée car elle est vide') {
          navigate('/games');
        } else {
          console.log('Vous avez quitté la room', data);
        }
      })
      .catch(error => {
        console.error('Erreur lors de la sortie de la room:', error);
      });
  };

  return (
    <div>
      <h1>Room: {roomDetails?.name}</h1>
      <h2>Joueurs:</h2>
      <ul>
        {roomDetails?.players.map(player => (
          <li key={player._id}>{player.username}</li> // Affichage des pseudos des joueurs
        ))}
      </ul>
      {/* Autres détails et logique de la room */}
    </div>
  );
};

export default Room;