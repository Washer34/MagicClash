const InfosPanel = ({ selectedCard }) => {
  return (
    <div className="infos-panel">
      <div className="selected-card">
        <img src={selectedCard.imageUrl} alt={selectedCard.name} />
        <p>{selectedCard.name}</p>
      </div>
      <div className="log">
        <h3>Logs de la partie</h3>
      </div>
    </div>
  );
};
export default InfosPanel;
