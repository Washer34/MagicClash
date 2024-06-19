import React, { createContext, useContext } from "react";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children, socket, isSocketConnected }) => {
  return (
    <SocketContext.Provider value={{socket, isSocketConnected}}>{children}</SocketContext.Provider>
  );
};
