import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { userAtom } from "./atoms/userAtom";
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
import Lobby from "./pages/Game/Lobby";
import Room from "./pages/Game/Room";

function App() {
  const [user, setUser] = useAtom(userAtom);
  const [socket, setSocket] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

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

  useEffect(() => {
    if (user.userId && !socket) {
      const newSocket = io("http://localhost:3000");

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
  }, [user.userId]);

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
              <Route path="/games" element={<Lobby />} />
              <Route path="/room/:roomId" element={<Room />} />
            </Routes>

            <ToastContainer />
          </div>
        </Router>
      </div>
    </SocketProvider>
  );
}

export default App;
