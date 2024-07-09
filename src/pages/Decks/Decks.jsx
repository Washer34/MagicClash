import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from "react-redux";
import './Decks.css';

const Decks = () => {
  const user = useSelector((state) => state.user);
  const [decks, setDecks] = useState([]);
  const [newDeckName, setNewDeckName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (user.token) {
        try {
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
            throw new Error("Réponse non valide");
          }

          const data = await response.json();
          console.log(data);
          setDecks(data);
        } catch (error) {
          console.error("Erreur lors de la récupération des decks :", error);
        }
      }
    };

    fetchData();
  }, [user.token]);

  const createNewDeck = (e) => {
    e.preventDefault();
    fetch(`${import.meta.env.VITE_API_URL}/api/decks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({ name: newDeckName, cards: [] }),
    })
      .then((response) => response.json())
      .then((data) => {
        setDecks([...decks, data]);
        setNewDeckName("");
      })
      .catch((error) => {
        console.error("Erreur lors de la création du deck :", error);
      });
  };

  return (
    <div className="decks-container">
      <h2>Mes Decks</h2>
      {decks.length > 0 ? (
        <div className="deck-list">
          {decks.map((deck) => (
            <Link
              to={`/decks/${deck._id}`}
              key={deck._id}
              className="deck-link"
            >
              <div className="deck-item">
                <h3>{deck.name}</h3>
                <p className="deck-card-count">{deck.cards.length} cartes</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="deck-list">
          <h3>Vous n'avez pas de deck.</h3>
        </div>
      )}
      <div className="create-deck">
        <form onSubmit={createNewDeck}>
          <input
            type="text"
            placeholder="Nom du deck..."
            value={newDeckName}
            onChange={(e) => setNewDeckName(e.target.value)}
          />
          <button type="submit">Créer un deck</button>
        </form>
      </div>
    </div>
  );
};

export default Decks;
