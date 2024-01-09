import { Link } from 'react-router-dom';

import './Navbar.css'

const Navbar = () => {
  return (
    <nav className="navbar bg-gray-800 text-white p-4 w-full">
      <div className="container mx-auto flex justify-between">
        <div className="text-lg font-semibold">
          <Link to="/">Magic Clash</Link>
        </div>
        <div className="flex gap-4">
          <Link to="/">Accueil</Link>
          <Link to="/cards">Cartes</Link>
          <Link to="/">Se Connecter</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
