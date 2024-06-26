import "./ContextMenu.css";

const ContextMenu = ({ x, y, onAction }) => {
  return (
    <div className="context-menu" style={{ top: y, left: x }}>
      <ul>
        <li onClick={() => onAction("toGraveyard")}>Mettre au cimetière</li>
        {/* Ajoutez d'autres actions ici */}
      </ul>
    </div>
  );
};

export default ContextMenu;
