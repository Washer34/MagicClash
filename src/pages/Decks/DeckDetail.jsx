import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom } from '../../atoms/userAtom';

import './Decks.css';
import noImage from '../../../public/assets/no-image.png'

const DeckDetail = () => {
  const [user] = useAtom(userAtom);
  const { id } = useParams();
  const [deck, setDeck] = useState(null);
  const [deckCards, setDeckCards] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const fetchDeckDetail = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/decks/${id}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Réponse non valide');
        }

        const data = await response.json();
        setDeck(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des détails du deck :', error);
      }
    };

    if (id) {
      fetchDeckDetail();
    }
  }, [id, user.token]);

  if (!deck) {
    return <div>Chargement en cours...</div>;
  }

  const handleSearch = async () => {
    const url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(searchTerm)}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      setSearchResults(data.data);
    } catch (error) {
      console.error('Erreur lors de la recherche des cartes :', error);
    }
  };

  const addCardToDeck = (card) => {
    let savedImageUrl
    if (card.image_uris) {
      savedImageUrl = card.image_uris.png
    } else if (card.card_faces[0].image_uris) {
      savedImageUrl = card.card_faces[0].image_uris.png
    } else {
      savedImageUrl = noImage
    }
    setDeckCards([...deckCards, { name: card.name, imageUrl: savedImageUrl, scryfallId: card.id }]);
  };

  const saveDeck = () => {
    fetch(`${import.meta.env.VITE_API_URL}/api/decks/${deck._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({ ...deck, cards: [...deck.cards, ...deckCards] }),
    })
      .then((response) => response.json())
      .then((updatedDeck) => {
        setDeck(updatedDeck);
        setDeckCards([]);
      })
      .catch((error) => {
        console.error("Erreur lors de l'enregistrement du deck :", error);
      });
  };

  return (
    <div className='deck-container'>
      <h2 className='deck-title'>{deck.name}</h2>
      <div className="deck-detail-container">
        <div className="deck-list-panel">
          <div className='deck-detailed'>
            <ul>
              {deck.cards.map((card) => (
                <li key={card.scryfallId}>
                  <img src={card.imageUrl} alt={card.name} />
                  <p>{card.name}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="search-panel">
          <div className="search-section">
            <h3>Ajouter une carte</h3>
            <input
              type="text"
              placeholder="Rechercher des cartes"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={handleSearch}>Rechercher</button>
            <div className='search-results'>
              {searchResults.map((card) => (
                <div className='search-card' key={card.id} onClick={() => addCardToDeck(card)}>
                  {card.card_faces && card.card_faces[0].image_uris ? (
                    <img src={card.card_faces[0].image_uris.png} alt={card.card_faces[0].name} />
                  ) : card.image_uris && card.image_uris.png ? (
                    <img src={card.image_uris.png} alt={card.name} />
                  ) : (
                    <img src={noImage} alt="Image indisponible" />
                  )}
                  <p>{card.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="selected-cards-panel">
          <div className="selected-cards-section">
            <h3>Cartes Sélectionnées</h3>
            <ul>
              {deckCards.map((card, index) => (
                <li key={index}>
                  <img src={card.imageUrl} alt={card.name} style={{ width: '50px', height: 'auto' }} />
                  <p>{card.name}</p>
                </li>
              ))}
            </ul>
          </div>
          <button onClick={saveDeck}>Enregistrer le deck</button>
        </div>
      </div>
    </div>
  );
};

export default DeckDetail;
