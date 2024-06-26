import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSocket } from "../../SocketContext";
import { DragDropContext, Droppable } from "react-beautiful-dnd";

import cardBack from "../../../public/assets/card-back.webp";
import Zone from "./Zone/Zone";
import Hand from "./Hand/Hand";
import InfosPanel from "./InfosPanel/InfosPanel";
import Library from "./Library/Library";
import LibraryMenu from "./Library/LibraryMenu/LibraryMenu";
import LibraryCards from "./Library/LibraryCards/LibraryCards";
import CardsModal from "./CardsModal/CardsModal";
import ContextMenu from "./ContextMenu/ContextMenu";

import "./GameBoard.css";

const GameBoard = ({ gameId, inGameDetails }) => {
  const user = useSelector((state) => state.user);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [opponentPlayers, setOpponentPlayers] = useState([]);
  const [hand, setHand] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [libraryMenuVisible, setLibraryMenuVisible] = useState(false);
  const [libraryCards, setLibraryCards] = useState([]);
  const [libraryModalVisible, setLibraryModalVisible] = useState(false);
  const [cardModalVisible, setCardModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalCards, setModalCards] = useState([]);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    card: null,
  });
  const { socket } = useSocket();

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
    setHand(currentPlayer.hand);

    document.querySelector(".app-container").classList.add("game-board-active");

    socket.on("ingame update", (updatedGame) => {
      console.log("in game update received : ", updatedGame);
      const updatedCurrentPlayer = updatedGame.players.find(
        (player) => player.username === user.username
      );
      const updatedOpponentPlayers = updatedGame.players.filter(
        (player) => player.username !== user.username
      );

      setCurrentPlayer(updatedCurrentPlayer);
      setOpponentPlayers(updatedOpponentPlayers);
      setHand(updatedCurrentPlayer.hand);
    });

    socket.on("library cards", (cards) => {
      setLibraryCards(cards);
      setLibraryModalVisible(true);
    });

    return () => {
      document
        .querySelector(".app-container")
        .classList.remove("game-board-active");
      socket.off("ingame update");
      socket.off("library cards");
    };
  }, [inGameDetails, user.username, socket]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenu.visible && !event.target.closest(".context-menu")) {
        setContextMenu({ visible: false, x: 0, y: 0, card: null });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [contextMenu]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    if (result.destination.droppableId === "player-battlefield") {
      const movedCard = hand[result.source.index];
      setHand((prevHand) =>
        prevHand.filter((_, idx) => idx !== result.source.index)
      );
      socket.emit("play card", {
        gameId,
        userId: user.userId,
        card: movedCard,
      });
    } else {
      const newHand = Array.from(hand);
      const [movedCard] = newHand.splice(result.source.index, 1);
      newHand.splice(result.destination.index, 0, movedCard);
      setHand(newHand);
    }
  };

  const handleRightClick = (e, card) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      card: card,
    });
  };

  const handleContextMenuAction = (action) => {
    if (action === "toGraveyard") {
      socket.emit("move to graveyard", {
        gameId,
        userId: user.userId,
        cardId: contextMenu.card.uuid,
      });
    }
    setContextMenu({ visible: false, x: 0, y: 0, card: null });
  };

  const updateCardPosition = (cardUuid, position) => {
    setCurrentPlayer((prevPlayer) => ({
      ...prevPlayer,
      battlefield: prevPlayer.battlefield.map((card) =>
        card.uuid === cardUuid ? { ...card, position } : card
      ),
    }));
  };

  const transformPositionForOpponent = (position) => {
    console.log("transforme: ", position);
    return { x: position.x, y: position.y - 1000 };
  };

  if (!currentPlayer) {
    return <div>Chargement...</div>;
  }

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  const handleCardMove = (cardUuid, position) => {
    if (currentPlayer.battlefield.some((card) => card.uuid === cardUuid)) {
      updateCardPosition(cardUuid, position);
      socket.emit("move card", {
        gameId,
        userId: user.userId,
        cardId: cardUuid,
        position,
      });
    }
  };

  const handleLibraryClick = () => {
    setLibraryMenuVisible(true);
  };

  const closeLibraryMenu = () => {
    setLibraryMenuVisible(false);
  };

  const drawCards = (number) => {
    console.log(`Piocher ${number} cartes`);
    socket.emit("draw x cards", { gameId, userId: user.userId, number });
  };

  const lookAtLibrary = () => {
    socket.emit("look at library", {
      gameId,
      userId: user.userId,
      number: null,
    });
  };

  const lookAtTopCards = (number) => {
    socket.emit("look at library", { gameId, userId: user.userId, number });
  };

  const closeLibraryModal = () => {
    setLibraryModalVisible(false);
  };

  const handleCardDoubleClick = (card) => {
    const updatedCard = { ...card, tap: !card.tap };
    setCurrentPlayer((prevPlayer) => ({
      ...prevPlayer,
      battlefield: prevPlayer.battlefield.map((c) =>
        c.uuid === card.uuid ? updatedCard : c
      ),
    }));
    socket.emit("tap card", {
      gameId,
      userId: user.userId,
      cardId: card.uuid,
      tap: !card.tap,
    });
  };

  const openCardModal = (title, cards) => {
    setModalTitle(title);
    setModalCards(cards);
    setCardModalVisible(true);
  };

  const closeCardModal = () => {
    setCardModalVisible(false);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="game-board">
        <div className="board-panel">
          <div className="opponent-zone">
            <div className="opponent-library">
              {opponentPlayers.map((opponent) => (
                <div key={opponent.username} className="opponent-player">
                  <Library
                    title="Bibliothèque Adversaire"
                    count={opponent.library}
                  />
                  <div className="opponent-graveyard">
                    <div className="opponent-exil">
                      <button
                        onClick={() =>
                          openCardModal("Exil Adversaire", opponent.exile)
                        }
                      >
                        Exil
                      </button>

                      <button
                        onClick={() =>
                          openCardModal(
                            "Cimetière Adversaire",
                            opponent.graveyard
                          )
                        }
                      >
                        Cimetière
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {opponentPlayers.map((opponent) => (
                <Hand
                  key={opponent.username}
                  cards={Array(opponent.hand).fill({
                    uuid: "",
                    imageUrl: cardBack,
                  })}
                  droppableId={`opponent-hand-${opponent.username}`}
                  isOpponent={true}
                  onCardClick={handleCardClick}
                />
              ))}
            </div>
            <div className="battlefield opponent-battlefield">
              {opponentPlayers.map((opponent) => (
                <Zone
                  key={opponent.username}
                  cards={opponent.battlefield.map((card) => ({
                    ...card,
                    position: transformPositionForOpponent(card.position),
                  }))}
                  onCardClick={handleCardClick}
                  onCardMove={null}
                />
              ))}
            </div>
          </div>
          <div className="player-zone">
            <Droppable droppableId="player-battlefield">
              {(provided) => (
                <div
                  className="battlefield player-battlefield"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{ flexGrow: 1, position: "relative" }}
                >
                  <Zone
                    cards={currentPlayer.battlefield}
                    onCardClick={handleCardClick}
                    onCardMove={handleCardMove}
                    onCardDoubleClick={handleCardDoubleClick}
                    onCardRightClick={handleRightClick}
                  />
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            <div className="player-library">
              <div className="player-graveyard">
                <Library
                  title="Bibliothèque Joueur"
                  count={currentPlayer.library}
                  onLibraryClick={handleLibraryClick}
                />
                <div className="player-exil">
                  <button
                    onClick={() =>
                      openCardModal("Cimetière Joueur", currentPlayer.graveyard)
                    }
                  >
                    Cimetière
                  </button>

                  <button
                    onClick={() =>
                      openCardModal("Exil Joueur", currentPlayer.exile)
                    }
                  >
                    Exil
                  </button>
                </div>
              </div>
              <Hand
                cards={hand}
                droppableId="player-hand"
                isOpponent={false}
                onCardClick={handleCardClick}
                onDragEnd={handleDragEnd}
              />
            </div>
          </div>
        </div>
        <InfosPanel selectedCard={selectedCard} />
        {libraryMenuVisible && (
          <LibraryMenu
            onClose={closeLibraryMenu}
            onDrawCards={drawCards}
            onLookAtLibrary={lookAtLibrary}
            onLookAtTopCards={lookAtTopCards}
          />
        )}
        {libraryModalVisible && (
          <LibraryCards
            cards={libraryCards}
            onClose={closeLibraryModal}
            onCardClick={handleCardClick}
          />
        )}
        {cardModalVisible && (
          <CardsModal
            title={modalTitle}
            cards={modalCards}
            onClose={closeCardModal}
            onCardClick={handleCardClick}
          />
        )}
        {contextMenu.visible && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onAction={handleContextMenuAction}
          />
        )}
      </div>
    </DragDropContext>
  );
};

export default GameBoard;
