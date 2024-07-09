import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../store/slices/userSlice";


import "./Navbar.css";

const Navbar = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logoutUser());
    sessionStorage.removeItem("userInfos");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar text-white p-4">
      <div className="container mx-auto flex justify-between">
        <div className="text-lg font-semibold">
          <Link to="/">Magic Clash</Link>
        </div>
        <div className="flex gap-4">
          <Link to="/" className={isActive("/") ? "nav-active" : ""}>
            Accueil
          </Link>
          <Link to="/cards" className={isActive("/cards") ? "nav-active" : ""}>
            Cartes
          </Link>
          {user.isLoggedIn ? (
            <>
              <Link
                to="/decks"
                className={isActive("/decks") ? "nav-active" : ""}
              >
                Mes Decks
              </Link>
              <Link
                to="/lobby"
                className={isActive("/lobby") ? "nav-active" : ""}
              >
                Jouer
              </Link>
              <a className="disconnect" onClick={handleLogout}>
                Se Déconnecter
              </a>
            </>
          ) : (
            <>
              <Link
                to="/signin"
                className={isActive("/signin") ? "nav-active" : ""}
              >
                Se Connecter
              </Link>
              <Link
                to="/signup"
                className={isActive("/signup") ? "nav-active" : ""}
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
