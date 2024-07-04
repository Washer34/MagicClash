import { useState } from 'react'

import CardDetails from '../../components/CardDetails/CardDetails';
import './Cards.css'
import noImage from "/assets/no-image.png?url";

const Cards = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cards, setCards] = useState([]);
  const [totalCards, setTotalCards] = useState(0);
  const [selectedCard, setSelectedCard] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(searchTerm)}`)
      .then(response => response.json())
      .then(data => {
        setTotalCards(data.total_cards)
        setCards(data.data);
      })
      .catch(error => {
        console.error('Erreur lors de la recherche:', error);
      });
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  const handleCloseModal = () => {
    setSelectedCard(null);
  };


  return (
    <div className='search-card-container'>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher une carte"
        />
        <button type="submit">Rechercher</button>
      </form>
      {totalCards > 1 && (
        <p>{totalCards} résultats correspondent à la recherche.</p>
      )}
      <div className="cards-grid">
        {cards.map(card => (
          <div className="list-card" key={card.id} onClick={() => handleCardClick(card)}>
            <h3>{card.name}</h3>
            {card.card_faces && card.card_faces[0].image_uris ? (
              <img src={card.card_faces[0].image_uris.png} alt={card.card_faces[0].name} />
            ) : card.image_uris && card.image_uris.png ? (
              <img src={card.image_uris.png} alt={card.name} />
            ) : (
              <img src={noImage} alt="Image indisponible" />
            )}
          </div>
        ))}
      </div>
      {selectedCard && (
        <CardDetails card={selectedCard} onClose={handleCloseModal} />
      )}
    </div>
  );
}
export default Cards