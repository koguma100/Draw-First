import {useState, useEffect, useRef, useContext, createContext} from 'react';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};

export const WebSocketProvider = ({ children }) => {
  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState('');

  const connectWebSocket = () => {

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return;
    }
    const socket = new WebSocket('ws://localhost:5001');

    socket.onopen = () => {
      console.log('WebSocket connection established');
      setConnected(true);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessage(data);
      console.log('WebSocket message received:', data);
    };

    socket.onerror = (error) => {
      console.log('WebSocket error', error);
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
      setConnected(false);
    };

    wsRef.current = socket;
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      setConnected(false);
    }
  };

  // Cleanup when the component unmounts
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ wsRef: wsRef, connectWebSocket, disconnectWebSocket, connected, message }}>
      {children}
    </WebSocketContext.Provider>
  );
};