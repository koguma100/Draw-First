import {useState, useEffect, useContext, createContext} from 'react';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};

export const WebSocketProvider = ({ children }) => {
  const [ws, setWs] = useState(null);
  const [connected, setConnected] = useState(false);

  const connectWebSocket = () => {
    const socket = new WebSocket('ws://localhost:5000');

    socket.onopen = () => {
      console.log('WebSocket connection established');
      setConnected(true);
    };

    socket.onerror = (error) => {
      console.log('WebSocket error', error);
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
      setConnected(false);
    };

    setWs(socket);
  };

  const disconnectWebSocket = () => {
    if (ws) {
      ws.close();
      setConnected(false);
    }
  };

  // Cleanup when the component unmounts
  useEffect(() => {
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [ws]);

  return (
    <WebSocketContext.Provider value={{ ws, connectWebSocket, disconnectWebSocket, connected }}>
      {children}
    </WebSocketContext.Provider>
  );
};