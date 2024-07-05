import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useSocket } from "../../SocketContext";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import cardBack from "/assets/card-back.webp";
import Zone from "./Zone/Zone";
import Hand from "./Hand/Hand";
import InfosPanel from "./InfosPanel/InfosPanel";
import Library from "./Library/Library";
import LibraryMenu from "./Library/LibraryMenu/LibraryMenu";
import LibraryCards from "./Library/LibraryCards/LibraryCards";
import ContextMenu from "./ContextMenu/ContextMenu";
import Exile from "./Exile/Exile";
import Graveyard from "./Graveyard/Graveyard";
import PlayerStatus from "../PlayerStatus/PlayerStatus";
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
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState(null);
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

  const handleIngameUpdate = (updatedGame) => {
    const updatedCurrentPlayer = updatedGame.players.find(
      (player) => player.username === user.username
    );
    const updatedOpponentPlayers = updatedGame.players.filter(
      (player) => player.username !== user.username
    );

    setCurrentPlayer(updatedCurrentPlayer);
    setOpponentPlayers(updatedOpponentPlayers);
      setHand(updatedCurrentPlayer.hand);

    if (modalContent) {
      updateModalContent(
        modalContent,
        updatedCurrentPlayer,
        updatedOpponentPlayers
      );
    }
  };

  socket.on("ingame update", handleIngameUpdate);

  return () => {
    document
      .querySelector(".app-container")
      .classList.remove("game-board-active");
    socket.off("ingame update", handleIngameUpdate);
    socket.off("library cards");
  };
}, [inGameDetails, user.username, socket, modalContent]);

  useEffect(() => {
    socket.on("library cards", (cards) => {
      setLibraryCards(cards);
      setLibraryModalVisible(true);
    });

    return () => {
      socket.off("library cards");
    };
  }, [socket, libraryModalVisible]);

  useEffect(() => {
    if (modalContent) {
      const handleModalUpdate = (updatedGame) => {
        const updatedCurrentPlayer = updatedGame.players.find(
          (player) => player.username === user.username
        );
        const updatedOpponentPlayers = updatedGame.players.filter(
          (player) => player.username !== user.username
        );

        updateModalContent(
          modalContent,
          updatedCurrentPlayer,
          updatedOpponentPlayers
        );
      };

      socket.on("ingame update", handleModalUpdate);

      return () => {
        socket.off("ingame update", handleModalUpdate);
      };
    }
  }, [modalContent, socket]);

  const updateModalContent = (
    modalContent,
    updatedCurrentPlayer,
    updatedOpponentPlayers
  ) => {
    if (modalContent.type === "graveyard") {
      if (modalContent.owner.username === user.username) {
        setModalContent((prevContent) => ({
          ...prevContent,
          cards: updatedCurrentPlayer.graveyard,
        }));
      } else {
        const updatedOpponent = updatedOpponentPlayers.find(
          (player) => player.username === modalContent.owner.username
        );
        setModalContent((prevContent) => ({
          ...prevContent,
          cards: updatedOpponent.graveyard,
        }));
      }
    } else if (modalContent.type === "exile") {
      if (modalContent.owner.username === user.username) {
        setModalContent((prevContent) => ({
          ...prevContent,
          cards: updatedCurrentPlayer.exile,
        }));
      } else {
        const updatedOpponent = updatedOpponentPlayers.find(
          (player) => player.username === modalContent.owner.username
        );
        setModalContent((prevContent) => ({
          ...prevContent,
          cards: updatedOpponent.exile,
        }));
      }
    }
  };

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
    const cardUuid = contextMenu.card.uuid;
    if (
      action === "toGraveyard" ||
      action === "toExile" ||
      action === "toHand"
    ) {
      setLibraryCards((prevCards) =>
        prevCards.filter((card) => card.uuid !== cardUuid)
      );

      const socketEvent =
        action === "toGraveyard"
          ? "move to graveyard"
          : action === "toExile"
          ? "move to exile"
          : "move to hand";

      socket.emit(socketEvent, {
        gameId,
        userId: user.userId,
        cardId: cardUuid,
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

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  const transformPositionForOpponent = (position) => {
    return { x: position.x, y: 100 - position.y };
  };

  const handleCardMove = (cardUuid, position) => {
    if (currentPlayer.battlefield.some((card) => card.uuid === cardUuid)) {
      updateCardPosition(cardUuid, position);
      socket.emit("move card", {
        gameId,
        userId: user.userId,
        cardId: cardUuid,
        position: position,
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
    socket.emit("draw x cards", { gameId, userId: user.userId, number });
  };

  const lookAtLibrary = () => {
    socket.emit("look at library", {
      gameId,
      userId: user.userId,
      number: null,
    });
    setLibraryModalVisible(true);
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

  const openGraveyardModal = (owner) => {
    const graveyard =
      owner.username === user.username
        ? currentPlayer.graveyard
        : opponentPlayers.find((player) => player.username === owner.username)
            .graveyard;
    setModalContent({ type: "graveyard", owner, cards: graveyard });
    setModalVisible(true);
  };

  const openExileModal = (owner) => {
    const exile =
      owner.username === user.username
        ? currentPlayer.exile
        : opponentPlayers.find((player) => player.username === owner.username)
            .exile;
    setModalContent({ type: "exile", owner, cards: exile });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalContent(null);
  };

  if (!currentPlayer) {
    return <div>Chargement...</div>;
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="game-board">
        <div className="board-panel">
          <div className="opponent-zone">
            <div className="opponent-library">
              {opponentPlayers.map((opponent) => (
                <div key={opponent.username} className="opponent-graveyard">
                  <Library count={opponent.library} />
                  <div className="opponent-exil">
                    <button onClick={() => openExileModal(opponent)}>
                      Exil
                    </button>
                    <button onClick={() => openGraveyardModal(opponent)}>
                      Cimetière
                    </button>
                  </div>
                </div>
              ))}
              {opponentPlayers.map((opponent) => (
                <>
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
                  <PlayerStatus player={opponent} gameId={gameId} />
                </>
              ))}
            </div>
            <div className="battlefield opponent-battlefield">
              {opponentPlayers.map((opponent) => (
                <Zone
                  title={"Opponent-Battlefield"}
                  key={opponent.username}
                  cards={opponent.battlefield.map((card) => ({
                    ...card,
                    position: transformPositionForOpponent(card.position),
                    tap: card.tap,
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
                    title={"Player-Battlefield"}
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
                  count={currentPlayer.library}
                  onLibraryClick={handleLibraryClick}
                />
                <div className="player-exil">
                  <button onClick={() => openGraveyardModal(currentPlayer)}>
                    Cimetière
                  </button>
                  <button onClick={() => openExileModal(currentPlayer)}>
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
                onCardRightClick={handleRightClick}
              />
              <PlayerStatus player={currentPlayer} gameId={gameId} />
            </div>
          </div>
        </div>
        <InfosPanel selectedCard={selectedCard} gameId={gameId} />
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
            onCardRightClick={handleRightClick}
          />
        )}
        {modalVisible && modalContent && modalContent.type === "graveyard" && (
          <Graveyard
            cards={modalContent.cards}
            onClose={closeModal}
            onCardClick={handleCardClick}
            onCardRightClick={handleRightClick}
          />
        )}
        {modalVisible && modalContent && modalContent.type === "exile" && (
          <Exile
            cards={modalContent.cards}
            onClose={closeModal}
            onCardClick={handleCardClick}
            onCardRightClick={handleRightClick}
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
