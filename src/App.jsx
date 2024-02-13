import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAtom } from "jotai";
import { userAtom } from "./atoms/userAtom";

import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import HomePage from "./pages/HomePage/HomePage";
import Cards from "./pages/Cards/Cards";
import Signin from "./pages/AuthPage/Signin";
import Signup from "./pages/AuthPage/Signup";
import Decks from "./pages/Decks/Decks";
import DeckDetail from "./pages/Decks/DeckDetail";
import Lobby from "./pages/Game/Lobby";
import Room from "./pages/Game/Room";
import PlayPage from "./pages/PlayPage/PlayPage";

function App() {
  const [, setUser] = useAtom(userAtom);

  useEffect(() => {
    const userInfosString = sessionStorage.getItem("userInfos");
    const userInfos = userInfosString ? JSON.parse(userInfosString) : null;
    if (userInfos) {
      setUser((prev) => {
        if (
          prev.username !== userInfos.username ||
          prev.token !== userInfos.token ||
          prev.userId !== userInfos.userId
        ) {
          return {
            isLoggedIn: true,
            username: userInfos.username,
            token: userInfos.token,
            userId: userInfos.userId,
          };
        }
        return prev;
      });
    }
  }, [setUser]);

  return (
    <div className="app-container">
      <Router>
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/cards" element={<Cards />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/decks" element={<Decks />} />
            <Route path="/decks/:id" element={<DeckDetail />} />
            <Route path="/games" element={<Lobby />} />
            <Route path="/room/:id" element={<Room />} />
            <Route path="/play/:id" element={<PlayPage />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
