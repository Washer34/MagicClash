import React, { useState } from "react";
import "./LibraryMenu.css";

const LibraryMenu = ({
  onClose,
  onDrawCards,
  onLookAtLibrary,
  onLookAtTopCards,
}) => {
  const [inputVisible, setInputVisible] = useState({
    draw: false,
    lookTop: false,
  });
  const [inputValue, setInputValue] = useState("1");
  const [action, setAction] = useState(null);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleAction = (chosenAction) => {
    setAction(chosenAction);
    if (chosenAction === "draw") {
      setInputVisible({ draw: true, lookTop: false });
    } else if (chosenAction === "lookTop") {
      setInputVisible({ draw: false, lookTop: true });
    } else {
      setInputVisible({ draw: false, lookTop: false });
      onLookAtLibrary();
      onClose();
    }
  };

  const handleSubmit = () => {
    if (action === "draw") {
      onDrawCards(Number(inputValue));
    } else if (action === "lookTop") {
      onLookAtTopCards(Number(inputValue));
    }
    onClose();
  };

  return (
    <div className="library-menu">
      <div className="menu-item" onClick={() => handleAction("draw")}>
        <button>Piocher X cartes</button>
        {inputVisible.draw && (
          <div className="input-section">
            <label>
              Piocher{" "}
              <input
                type="number"
                value={inputValue}
                onChange={handleInputChange}
              />{" "}
              cartes
            </label>
            <button onClick={handleSubmit}>Valider</button>
          </div>
        )}
      </div>
      <div className="menu-item" onClick={() => handleAction("lookLibrary")}>
        <button>Regarder la bibliothèque</button>
      </div>
      <div className="menu-item" onClick={() => handleAction("lookTop")}>
        <button>Regarder X cartes du dessus</button>
        {inputVisible.lookTop && (
          <div className="input-section">
            <label>
              Regarder{" "}
              <input
                type="number"
                value={inputValue}
                onChange={handleInputChange}
              />{" "}
              cartes
            </label>
            <button onClick={handleSubmit}>Valider</button>
          </div>
        )}
      </div>
      <div className="menu-item" onClick={onClose}>
        <button>Fermer</button>
      </div>
    </div>
  );
};

export default LibraryMenu;
