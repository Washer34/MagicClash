import { useEffect } from 'react';

import './CardDetails.css';
import { formatManaCost } from '../../helpers/ManaCost/formatManaCost';

const CardDetails = ({ card, onClose }) => {
  const handleOutsideClick = (e) => {
    if (e.target.classList.contains('modal')) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleOutsideClick);

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  const renderManaCost = (manaCost) => {
    if (!manaCost) return null;

    const manaSymbols = manaCost.match(/\{(\d+|[WUBRG])\}/g);

    if (!manaSymbols) return null;

    return manaSymbols.map((symbol, index) => {
      const manaValue = symbol.slice(1, -1);
      if (isNaN(manaValue)) {
        const imagePath = `src/assets/${manaValue}-mana.png`;
        return <img className='colored-mana' key={index} src={imagePath} alt={`${manaValue} mana`} />;
      } else {
        return <span className="uncolored-mana" key={index}>{manaValue}</span>;
      }
    });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>x</button>
        <img src={card.image_uris.png} alt={card.name} />
        <div className='card-detail ml-4'>
          <h3 className='modal-title py-4'>{card.name} {renderManaCost(card.mana_cost)}</h3>
          <p className='card-description'>{card.oracle_text}</p>

        </div>
      </div>
    </div>
  );
}

export default CardDetails