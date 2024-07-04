import { useState, useEffect } from "react";
import { useSocket } from "../../../SocketContext";
import "./InfosPanel.css";

const InfosPanel = ({ selectedCard, gameId, username }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const { socket } = useSocket();

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

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = `${username}: ${newMessage}`;
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
          {messages.map((msg, index) => (
            <p key={index}>{msg}</p>
          ))}
        </div>
        <div className="chat-input">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default InfosPanel;
