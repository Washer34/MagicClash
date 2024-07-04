import "./ContextMenu.css";

const ContextMenu = ({ x, y, onAction }) => {
  return (
    <div className="context-menu" style={{ top: y, left: x }}>
      <ul>
        <li onClick={() => onAction("toGraveyard")}>Mettre au cimetière</li>
        <li onClick={() => onAction("toExile")}>Exiler</li>
      </ul>
    </div>
  );
};

export default ContextMenu;
