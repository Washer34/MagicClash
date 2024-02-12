import { Link, useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { userAtom } from "../../atoms/userAtom";

import "./Navbar.css";

const Navbar = () => {
  const [user, setUser] = useAtom(userAtom);
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser({ isLoggedIn: false, username: null, token: null });
    localStorage.removeItem("userInfos");
    navigate("/");
  };

  return (
    <nav className="navbar text-white p-4">
      <div className="container mx-auto flex justify-between">
        <div className="text-lg font-semibold">
          <Link to="/">Magic Clash</Link>
        </div>
        <div className="flex gap-4">
          <Link to="/">Accueil</Link>
          <Link to="/cards">Cartes</Link>
          {user.isLoggedIn ? (
            <>
              <Link to="/decks">Mes Decks</Link>
              <Link to="/games">Jouer</Link>
              <a className="disconnect" onClick={handleLogout}>
                Se Déconnecter
              </a>
            </>
          ) : (
            <>
              <Link to="/signin">Se Connecter</Link>
              <Link to="/signup">S&apos;inscrire</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
