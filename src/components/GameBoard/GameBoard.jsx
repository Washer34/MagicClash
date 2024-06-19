import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "./GameBoard.css";

const GameBoard = ({ gameId, inGameDetails }) => {
  const user = useSelector((state) => state.user);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [opponentPlayers, setOpponentPlayers] = useState([]);

  useEffect(() => {
    if (!inGameDetails) return;

    const currentPlayer = inGameDetails.players.find(
      (player) => player.username === user.username
    );
    const opponentPlayers = inGameDetails.players.filter(
      (player) => player.username !== user.username
    );

    setCurrentPlayer(currentPlayer);
    setOpponentPlayers(opponentPlayers);
  }, [inGameDetails, user.username]);

  if (!currentPlayer) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="game-board">
      <h1>Board de la partie: {inGameDetails.name}</h1>
      <div className="current-player">
        <h2>Vos informations:</h2>
        <p>Points de vie: {currentPlayer.life}</p>
        <p>Bibliothèque: {currentPlayer.library}</p>
        <p>Main:</p>
        <div className="hand-cards">
          {currentPlayer.hand.map((card) => (
            <img key={card.scryfallId} src={card.imageUrl} alt={card.name} />
          ))}
        </div>
        <p>Champ de bataille:</p>
        <div className="battlefield-cards">
          {currentPlayer.battlefield.map((card) => (
            <img key={card.scryfallId} src={card.imageUrl} alt={card.name} />
          ))}
        </div>
        <p>Cimetière:</p>
        <div className="graveyard-cards">
          {currentPlayer.graveyard.map((card) => (
            <img key={card.scryfallId} src={card.imageUrl} alt={card.name} />
          ))}
        </div>
        <p>Exil:</p>
        <div className="exile-cards">
          {currentPlayer.exile.map((card) => (
            <img key={card.scryfallId} src={card.imageUrl} alt={card.name} />
          ))}
        </div>
      </div>
      {opponentPlayers.map((opponent) => (
        <div key={opponent.username} className="opponent-player">
          <h2>Informations de {opponent.username}: </h2>
          <p>Points de vie: {opponent.life}</p>
          <p>Bibliothèque: {opponent.library}</p>
          <p>Main: {opponent.hand}</p>
          <p>Champ de bataille:</p>
          <div className="battlefield-cards">
            {opponent.battlefield.map((card) => (
              <img key={card.scryfallId} src={card.imageUrl} alt={card.name} />
            ))}
          </div>
          <p>Cimetière:</p>
          <div className="graveyard-cards">
            {opponent.graveyard.map((card) => (
              <img key={card.scryfallId} src={card.imageUrl} alt={card.name} />
            ))}
          </div>
          <p>Exil:</p>
          <div className="exile-cards">
            {opponent.exile.map((card) => (
              <img key={card.scryfallId} src={card.imageUrl} alt={card.name} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GameBoard;
