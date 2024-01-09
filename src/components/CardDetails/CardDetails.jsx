import { useEffect } from 'react';

import './CardDetails.css';
import noImage from '../../assets/no-image.png'

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

  const renderOracleText = (oracleText) => {
    if (!oracleText) return null;
  
    // Remplacez d'abord les symboles de mana par des images ou des spans
    const manaCostRegex = /\{(\d+|[WUBRGT])\}/g;
    let textWithManaSymbols = oracleText.replace(manaCostRegex, (match, manaValue) => {
      if (isNaN(manaValue)) {
        // Si c'est un mana coloré, utilisez une image
        const imagePath = `src/assets/${manaValue}-mana.png`;
        return `<img class='inline-mana' src='${imagePath}' alt='${manaValue} mana' />`;
      } else {
        // Si c'est un mana incolore, utilisez une balise span
        return `<span class='inline-uncolored-mana'>${manaValue}</span>`;
      }
    });
  
    // Ensuite, divisez le texte par les retours à la ligne et mappez-les à des éléments JSX
    return textWithManaSymbols.split('\n').map((line, index, array) => (
      <div className='card-capacity' key={index}>
        <span dangerouslySetInnerHTML={{ __html: line }} />
        {index < array.length - 1 && <br />}
      </div>
    ));
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>x</button>
        {card.card_faces ? (
          <div className='card-faces'>
            <div className='first-card'>
              <img src={card.card_faces[0].image_uris.png} alt={card.card_faces[0].name} />
              <div className='card-detail ml-4'>
                <h3 className='modal-title py-4'>{card.card_faces[0].name} {renderManaCost(card.card_faces[0].mana_cost)}</h3>
                <p className='card-description'>{card.card_faces[0].oracle_text}</p>
              </div>
            </div>
            <div className='second-card'>
              <img src={card.card_faces[1].image_uris.png} alt={card.card_faces[1].name} />
              <div className='card-detail ml-4'>
                <h3 className='modal-title py-4'>{card.card_faces[1].name} {renderManaCost(card.card_faces[1].mana_cost)}</h3>
                <p className='card-description'>{card.card_faces[1].oracle_text}</p>
              </div>
            </div>
          </div>
        ) : card.image_uris && card.image_uris.png ? (
          <>
            <img src={card.image_uris.png} alt={card.name} />
            <div className='card-detail ml-4'>
              <h3 className='modal-title py-4'>{card.name} {renderManaCost(card.mana_cost)}</h3>
              <p className='card-description'>{renderOracleText(card.oracle_text)}</p>
            </div>
          </>
        ) : (
          <>
            <img src={noImage} alt="Image indisponible" />
            <div className='card-detail ml-4'>
              <h3 className='modal-title py-4'>{card.name} {renderManaCost(card.mana_cost)}</h3>
              <p className='card-description'>{renderOracleText(card.oracle_text)}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CardDetails