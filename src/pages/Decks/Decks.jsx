import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from "react-redux";
import './Decks.css';

const Decks = () => {
  const user = useSelector((state) => state.user);
  const [decks, setDecks] = useState([]);
  const [newDeckName, setNewDeckName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (user.token) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/decks`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          });
          if (!response.ok) {
            throw new Error('Réponse non valide');
          }

          const data = await response.json();
          setDecks(data);
        } catch (error) {
          console.error('Erreur lors de la récupération des decks :', error);
        }
      }
    };

    fetchData();
  }, [user.token]);

  const createNewDeck = (e) => {
    e.preventDefault();
    fetch(`${import.meta.env.VITE_API_URL}/api/decks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({ name: newDeckName, cards: [] }),
    })
      .then((response) => response.json())
      .then((data) => {
        setDecks([...decks, data]);
        setNewDeckName('');
      })
      .catch((error) => {
        console.error('Erreur lors de la création du deck :', error);
      });
  };

  return (
    <div className="decks-container">
      <h2>Mes Decks</h2>
      <div className="create-deck">
        <form onSubmit={createNewDeck}>
          <input
            type="text"
            placeholder="Nom du deck"
            value={newDeckName}
            onChange={(e) => setNewDeckName(e.target.value)}
          />
          <button type='submit'>Créer un deck</button>
        </form>
      </div>
      {decks.length > 0 ? (
        <div className="deck-list">
          {decks.map((deck) => (
            <div key={deck._id} className="deck-item">
              <h3>
                <Link to={`/decks/${deck._id}`}>{deck.name}</Link>
              </h3>
              {/* Affichez les cartes du deck ici si nécessaire */}
            </div>
          ))}
        </div>
      ) : (
        <div className="deck-list">
          <h3>Vous n&apos;avez pas de deck.</h3>
        </div>
      )}
    </div>
  );
};

export default Decks;
