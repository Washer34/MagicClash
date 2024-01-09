import { useState } from 'react'

import CardDetails from '../../components/CardDetails/CardDetails';
import './Cards.css'

const Cards = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(searchTerm)}`)
      .then(response => response.json())
      .then(data => {
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
    <div className='card-container'>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher une carte"
        />
        <button type="submit">Rechercher</button>
      </form>
      <div className="cards-grid">
        {cards.map(card => (
          <div className="card" key={card.id} onClick={() => handleCardClick(card)}>
            <h3>{card.name}</h3>
            {card.image_uris.png && (
              <img src={card.image_uris.png} alt={card.name} />
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