import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from "react-redux";

import './Decks.css';
import noImage from '../../../public/assets/no-image.png'

const DeckDetail = () => {
  const user = useSelector((state) => state.user);
  const { id } = useParams();
  const [deck, setDeck] = useState(null);
  const [deckCards, setDeckCards] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [modifiedCards, setModifiedCards] = useState(new Map());

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
          let errorMsg = `erreur ${response.status} (${response.statusText})`;
          try {
            const errorData = await response.json();
            errorMsg += ': ' + (errorData.message || JSON.stringify(errorData));
          } catch (error) {
            errorMsg += ` - la réponse n'est pas un JSON valide: ${response.statusText}`
          }
          throw new Error(errorMsg);
        }

        const data = await response.json();
        setDeck(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des détails du deck :', error.message);
      }
    };

    if (id && user.token) {
      fetchDeckDetail();
    }
  }, [id, user.token]);

  if (!deck) {
    return <div>Chargement en cours...</div>;
  }

  const handleSearch = async (e) => {
    e.preventDefault();
    const url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(searchTerm)}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      setSearchResults(data.data);
    } catch (error) {
      console.error('Erreur lors de la recherche des cartes :', error);
    }
  };
  // MISE A JOUR ?

  const addCardToDeck = (card) => {
    const existingCardIndex = deckCards.findIndex(c => c.scryfallId === card.id);
    if (existingCardIndex !== -1) {
      // Copie et mise à jour de la quantité
      let newDeckCards = [...deckCards];
      newDeckCards[existingCardIndex] = {
        ...newDeckCards[existingCardIndex],
        quantity: (newDeckCards[existingCardIndex].quantity || 1) + 1
      };
      setDeckCards(newDeckCards);
    } else {
      let savedImageUrl = card.image_uris?.png || card.card_faces?.[0].image_uris?.png || noImage;
      setDeckCards([...deckCards, { name: card.name, imageUrl: savedImageUrl, scryfallId: card.id, quantity: 1 }]);
    }
  };

  const saveDeck = () => {
    // Construction du tableau final à envoyer, avec les quantités respectées
    let cardsToSend = [];

    modifiedCards.forEach((value, key) => {
      for (let i = 0; i < value.quantity; i++) {
        cardsToSend.push({ ...value, scryfallId: key });
      }
    });

    deckCards.forEach(card => {
      if (!modifiedCards.has(card.scryfallId)) {
        for (let i = 0; i < (card.quantity || 1); i++) {
          cardsToSend.push({ name: card.name, imageUrl: card.imageUrl, scryfallId: card.scryfallId });
        }
      }
    });


    fetch(`${import.meta.env.VITE_API_URL}/api/decks/${deck._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({ ...deck, cards: [...deck.cards, ...cardsToSend] }),
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

  const increaseQuantity = (cardId) => {
    setDeckCards(deckCards.map(c =>
      c.scryfallId === cardId ? { ...c, quantity: c.quantity + 1 } : c
    ));
  };

  const decreaseQuantity = (cardId) => {
    setDeckCards(deckCards
      .map(c =>
        c.scryfallId === cardId ? { ...c, quantity: c.quantity - 1 } : c
      )
      .filter(c => c.quantity > 0));
  };

  const updateCardQuantityInDeck = (cardId, change) => {
    setModifiedCards(prev => {
      const currentQuantity = prev.get(cardId)?.quantity ?? deck.cards.find(c => c.scryfallId === cardId)?.quantity ?? 0;
      const newQuantity = Math.max(0, currentQuantity + change);
      if (newQuantity > 0) {
        return new Map(prev).set(cardId, { ...prev.get(cardId), quantity: newQuantity });
      } else {
        const updated = new Map(prev);
        updated.delete(cardId);
        return updated;
      }
    });
  };

  const addCardToSelected = (card) => {
    setDeck(deck => {
      return { ...deck, cards: [...deck.cards, card] }; // Ajoute une nouvelle instance de la carte
    });
  };

  const decreaseCardInDeck = (cardId) => {
    setDeck(deck => {
      const newCards = [...deck.cards];
      const cardIndex = newCards.findIndex(card => card.scryfallId === cardId);
      if (cardIndex !== -1) {
        newCards.splice(cardIndex, 1);
      }
      return { ...deck, cards: newCards };
    });
  };

  const groupCardsByScryfallId = (cards) => {
    const groupedCards = new Map();

    cards.forEach(card => {
      const existingCard = groupedCards.get(card.scryfallId);
      if (existingCard) {
        existingCard.quantity += 1;
      } else {
        groupedCards.set(card.scryfallId, { ...card, quantity: 1 });
      }
    });

    return Array.from(groupedCards.values());
  };


  return (
    <div className="deck-container">
      <h2 className="deck-title">{deck.name}</h2>
      <div className="deck-detail-container">
        <div className="deck-list-panel">
          <div className="deck-detailed">
            <ul>
              {groupCardsByScryfallId(deck.cards).map((card, index) => (
                <li key={`${card.scryfallId}_${index}`}>
                  <img src={card.imageUrl} alt={card.name} />
                  <p>{card.name}</p>
                  <div>
                    <button onClick={() => decreaseCardInDeck(card.scryfallId)}>
                      -
                    </button>
                    <span> {card.quantity} </span>
                    <button onClick={() => addCardToSelected(card)}>+</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="search-panel">
          <div className="search-section">
            <h3>Ajouter une carte</h3>
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Rechercher des cartes"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type='submit'>Rechercher</button>
            </form>
            <div className="search-results">
              {searchResults.map((card) => (
                <div
                  className="search-card"
                  key={card.id}
                  onClick={() => addCardToDeck(card)}
                >
                  {card.card_faces && card.card_faces[0].image_uris ? (
                    <img
                      src={card.card_faces[0].image_uris.png}
                      alt={card.card_faces[0].name}
                    />
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
                <li key={`${card.scryfallId}_${card.name}_${index}`}>
                  <img src={card.imageUrl} alt={card.name} />
                  <p>{card.name}</p>
                  <div>
                    <button onClick={() => decreaseQuantity(card.scryfallId)}>
                      -
                    </button>
                    <span> {card.quantity} </span>
                    <button onClick={() => increaseQuantity(card.scryfallId)}>
                      +
                    </button>
                  </div>
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
