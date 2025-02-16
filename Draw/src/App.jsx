import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import StartingMenu from './StartMenu.jsx';
import ChooseCategory from './ChooseCategory.jsx';
import Game from './Game.jsx';
import { WebSocketProvider } from './WebSocketProvider.jsx';

function App() {
  const [isHost, setIsHost] = useState(false);
  const [category, setCategory] = useState('');
  const [lobbyID, setLobbyID] = useState('');

  const CategoryRoute = ({ isHost, component: Component, setCategory }) => {
    if (!isHost) {
      // Redirect them to the startMenu if not valid host
      return <Navigate to="/" replace />;
    }
  
    return <Component setCategory={setCategory}/>; 
  };

  const GameRoute = ({ isHost, category, lobbyID, component: Component }) => {
    if (isHost && category != '') {
      // host creates a new lobby
      return <Component category={category} lobbyID={lobbyID}/>;
    }
    else {
      // check Looby ID for avaiable lobby

    }

    return <Navigate to="/" replace />; // else return to startMenu
  };

  return (
    <>
    <WebSocketProvider> 
      <Router>
        <Routes>
          <Route path="/" element={<StartingMenu setIsHost={setIsHost} setLobbyID={setLobbyID} />} />
          <Route 
            path="/category" 
            element={<CategoryRoute isHost={isHost} component={ChooseCategory} setCategory={setCategory}/>} 
          />
          <Route path="/game" element={<GameRoute isHost={isHost} category={category} lobbyID={lobbyID} component={Game} />} />
        </Routes>
      </Router>
    </WebSocketProvider>   
    </>
  )
}

export default App
