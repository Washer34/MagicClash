import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "./store/slices/userSlice";
import { SocketProvider } from "./SocketContext";
import io from "socket.io-client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import HomePage from "./pages/HomePage/HomePage";
import Cards from "./pages/Cards/Cards";
import Signin from "./pages/AuthPage/Signin";
import Signup from "./pages/AuthPage/Signup";
import Decks from "./pages/Decks/Decks";
import DeckDetail from "./pages/Decks/DeckDetail";
import Lobby from "./pages/Lobby/Lobby";
import GameDetails from "./pages/GameDetails/GameDetails";

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [socket, setSocket] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  useEffect(() => {
    const userInfosString = sessionStorage.getItem("userInfos");
    const userInfos = userInfosString ? JSON.parse(userInfosString) : null;
    if (userInfos) {
      dispatch(setUser(userInfos));
    }
  }, [dispatch]);

  useEffect(() => {
    if (user.userId && !socket) {
      const newSocket = io(import.meta.env.VITE_API_URL);

      newSocket.on("connect", () => {
        console.log("Connected to server");
        newSocket.emit("register", user.userId);
        setIsSocketConnected(true);
      });

      newSocket.on("disconnect", () => {
        console.log("Disconnected from server");
        setIsSocketConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  return (
    <SocketProvider socket={socket} isSocketConnected={isSocketConnected}>
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
              <Route path="/lobby" element={<Lobby />} />
              <Route path="/game/:gameId" element={<GameDetails />} />
            </Routes>

            <ToastContainer />
          </div>
        </Router>
      </div>
    </SocketProvider>
  );
}

export default App;
