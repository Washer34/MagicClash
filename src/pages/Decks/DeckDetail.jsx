import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Camera } from "lucide-react"; 

import "./Decks.css";
import noImage from "/assets/no-image.png?url";

const DeckDetail = () => {
  const user = useSelector((state) => state.user);
  const { id } = useParams();
  const [deck, setDeck] = useState(null);
  const [deckCards, setDeckCards] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [file, setFile] = useState(null);
  const [modifiedCards, setModifiedCards] = useState(new Map());
  const [hoveredCard, setHoveredCard] = useState({
    imageUrl: null,
    top: 0,
    left: 0,
  });

  useEffect(() => {
    const fetchDeckDetail = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/decks/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        if (!response.ok) {
          let errorMsg = `erreur ${response.status} (${response.statusText})`;
          try {
            const errorData = await response.json();
            errorMsg += ": " + (errorData.message || JSON.stringify(errorData));
          } catch (error) {
            errorMsg += ` - la réponse n'est pas un JSON valide: ${response.statusText}`;
          }
          throw new Error(errorMsg);
        }

        const data = await response.json();
        setDeck(data);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des détails du deck :",
          error.message
        );
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
    const url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(
      searchTerm
    )}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      setSearchResults(data.data);
    } catch (error) {
      console.error("Erreur lors de la recherche des cartes :", error);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        const cardLines = text
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);

        const deckCardsFromImport = await Promise.all(
          cardLines.map(async (line) => {
            const [quantity, ...nameParts] = line.split(" ");
            const name = nameParts.join(" ");
            const quantityInt = parseInt(quantity, 10);

            const response = await fetch(
              `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(
                name
              )}`
            );
            const cardData = await response.json();

            const imageUrl =
              cardData.card_faces && cardData.card_faces[0].image_uris
                ? cardData.card_faces[0].image_uris.png
                : cardData.image_uris
                ? cardData.image_uris.png
                : noImage;

            const cards = Array(quantityInt).fill({
              name: cardData.name,
              scryfallId: cardData.id,
              imageUrl: imageUrl,
              quantity: 1, // Set initial quantity to 1
            });

            return cards;
          })
        );

        setDeckCards([...deckCards, ...deckCardsFromImport.flat()]);
      };
      reader.readAsText(file);
    }
  };

  const addCardToDeck = (card) => {
    const existingCardIndex = deckCards.findIndex(
      (c) => c.scryfallId === card.id
    );
    if (existingCardIndex !== -1) {
      const newDeckCards = [...deckCards];
      newDeckCards[existingCardIndex].quantity += 1;
      setDeckCards(newDeckCards);
    } else {
      setDeckCards([
        ...deckCards,
        {
          name: card.name,
          imageUrl:
            card.image_uris?.png ||
            card.card_faces?.[0].image_uris?.png ||
            noImage,
          scryfallId: card.id,
          quantity: 1,
        },
      ]);
    }
  };

  const saveDeck = () => {
    let cardsToSend = [...deck.cards];

    modifiedCards.forEach((value, key) => {
      for (let i = 0; i < value.quantity; i++) {
        cardsToSend.push({ ...value, scryfallId: key });
      }
    });

    deckCards.forEach((card) => {
      if (!modifiedCards.has(card.scryfallId)) {
        for (let i = 0; i < (card.quantity || 1); i++) {
          cardsToSend.push({
            name: card.name,
            imageUrl: card.imageUrl,
            scryfallId: card.scryfallId,
          });
        }
      }
    });

    fetch(`${import.meta.env.VITE_API_URL}/api/decks/${deck._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({ ...deck, cards: cardsToSend }),
    })
      .then((response) => response.json())
      .then((updatedDeck) => {
        setDeck(updatedDeck);
        setDeckCards([]);
        setModifiedCards(new Map());
      })
      .catch((error) => {
        console.error("Erreur lors de l'enregistrement du deck :", error);
      });
  };

  const increaseQuantity = (cardId) => {
    setDeckCards(
      deckCards.map((c) =>
        c.scryfallId === cardId ? { ...c, quantity: c.quantity + 1 } : c
      )
    );
  };

  const decreaseQuantity = (cardId) => {
    setDeckCards(
      deckCards
        .map((c) =>
          c.scryfallId === cardId ? { ...c, quantity: c.quantity - 1 } : c
        )
        .filter((c) => c.quantity > 0)
    );
  };

  const addCardToSelected = (card) => {
    setDeck((deck) => {
      return { ...deck, cards: [...deck.cards, card] };
    });
  };

  const decreaseCardInDeck = (cardId) => {
    setDeck((deck) => {
      const newCards = [...deck.cards];
      const cardIndex = newCards.findIndex(
        (card) => card.scryfallId === cardId
      );
      if (cardIndex !== -1) {
        newCards.splice(cardIndex, 1);
      }
      return { ...deck, cards: newCards };
    });
  };

  const groupCardsByScryfallId = (cards) => {
    const groupedCards = new Map();

    cards.forEach((card) => {
      const existingCard = groupedCards.get(card.scryfallId);
      if (existingCard) {
        existingCard.quantity += 1;
      } else {
        groupedCards.set(card.scryfallId, { ...card, quantity: 1 });
      }
    });

    return Array.from(groupedCards.values());
  };

  const handleMouseEnter = (card, event) => {
    const rect = event.target.getBoundingClientRect();
    setHoveredCard({
      imageUrl: card.imageUrl,
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX + rect.width,
    });
  };

  const handleMouseLeave = () => {
    setHoveredCard({ imageUrl: null, top: 0, left: 0 });
  };

  const renderCardTable = (
    cards,
    handleDecrease,
    handleIncrease,
    showQuantity = true
  ) => (
    <table className="deck-detailed-table">
      <thead>
        <tr>
          <th>Image</th>
          <th>Nom</th>
          {showQuantity && <th>Quantité</th>}
        </tr>
      </thead>
      <tbody>
        {cards.map((card, index) => (
          <tr key={`${card.scryfallId}_${index}`}>
            <td
              onMouseEnter={(e) => handleMouseEnter(card, e)}
              onMouseLeave={handleMouseLeave}
            >
              <Camera className="camera-icon" />
            </td>
            <td>{card.name}</td>
            {showQuantity && (
              <td>
                <button
                  className="quantity-button"
                  onClick={() => handleDecrease(card.scryfallId)}
                >
                  -
                </button>
                <span className="quantity">{card.quantity}</span>
                <button
                  className="quantity-button"
                  onClick={() => handleIncrease(card.scryfallId)}
                >
                  +
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="deck-container">
      <h2 className="deck-title">
        {deck.name} ({deck.cards.length} cartes)
      </h2>

      <div className="import-section">
        <h3>Importer des cartes depuis un fichier texte</h3>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleFileUpload}>Importer</button>
      </div>

      <div className="deck-detail-container">
        <div className="deck-list-panel">
          <h3>Deck</h3>
          {renderCardTable(
            groupCardsByScryfallId(deck.cards),
            decreaseCardInDeck,
            addCardToSelected
          )}
          {hoveredCard.imageUrl && (
            <div
              className="hovered-image"
              style={{
                top: `${hoveredCard.top}px`,
                left: `${hoveredCard.left}px`,
              }}
            >
              <img src={hoveredCard.imageUrl} alt="Carte prévisualisée" />
            </div>
          )}
        </div>

        <div className="search-panel">
          <div className="search-section">
            <h3>Rechercher une carte</h3>
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Rechercher des cartes"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit">Rechercher</button>
            </form>
            <div className="search-results">
              {searchResults.map((card) => (
                <div
                  className="search-card"
                  key={card.id}
                  onClick={() => addCardToDeck(card)}
                  onMouseEnter={(e) => handleMouseEnter(card, e)}
                  onMouseLeave={handleMouseLeave}
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
          <h3>Cartes à ajouter</h3>
          <div className="selected-cards-section">
            {renderCardTable(deckCards, decreaseQuantity, increaseQuantity)}
          </div>
          <button className="selected-cards-button" onClick={saveDeck}>
            Enregistrer le deck
          </button>
        </div>
      </div>
    </div>
  );
};


export default DeckDetail;
