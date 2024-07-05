import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useSocket } from "../../../SocketContext";
import { SendHorizontal } from "lucide-react";
import "./InfosPanel.css";

const InfosPanel = ({ selectedCard, gameId }) => {
  const user = useSelector((state) => state.user);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const { socket } = useSocket();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const handleChatMessage = (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    socket.on("chat message", handleChatMessage);

    return () => {
      socket.off("chat message", handleChatMessage);
    };
  }, [socket]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).match(/[a-z]/i)
      ? string.charAt(0).toUpperCase() + string.slice(1)
      : string;
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const capitalizedUsername = capitalizeFirstLetter(user.username);
      const message = {
        username: capitalizedUsername,
        text: newMessage,
      };
      socket.emit("chat message", { gameId, message });
      setNewMessage("");
    }
  };

  return (
    <div className="infos-panel">
      {selectedCard && (
        <div className="selected-card">
          <img src={selectedCard.imageUrl} alt={selectedCard.name} />
          <p>{selectedCard.name}</p>
        </div>
      )}
      <div className="log">
        <h3>Logs de la partie</h3>
        <div className="messages">
          {messages.map((msg, index) => {
            const { username, text } = msg;
            const isUserMessage =
              username === capitalizeFirstLetter(user.username);
            return (
              <p key={index} className="message">
                <span
                  className={
                    isUserMessage ? "user-username" : "opponent-username"
                  }
                >
                  {username}
                </span>
                : {text}
              </p>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        <form className="chat-input" onSubmit={sendMessage}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit">
            <SendHorizontal size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default InfosPanel;
