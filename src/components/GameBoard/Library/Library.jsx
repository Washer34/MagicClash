import "./Library.css";
import cardBack from "/assets/card-back.webp";

const Library = ({ count, onLibraryClick }) => (
  <div className="library">
    <div className="library-cards">
      <div
        className="library-card"
        onClick={() => {
          onLibraryClick();
        }}
      >
        <img src={cardBack} alt="Library" />
        <span className="card-count">{count}</span>
      </div>
    </div>
  </div>
);

export default Library;
