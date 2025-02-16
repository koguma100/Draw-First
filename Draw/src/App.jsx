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
  const [username, setUsername] = useState('');

  const CategoryRoute = ({ isHost, setIsHost, component: Component, setCategory }) => {
    if (!isHost) {
      // Redirect them to the startMenu if not valid host
      return <Navigate to="/" replace />;
    }
  
    return <Component setIsHost={setIsHost} setUsername={setUsername} setCategory={setCategory}/>; 
  };

  const GameRoute = ({ isHost, category, lobbyID, username, component: Component }) => {
    if (isHost && category != '') {
      // host creates a new lobby
      return <Component isHost={isHost} category={category} lobbyID={lobbyID} username={username}/>;
    }
    else {
      // check Looby ID for avaiable lobby
      return <Component isHost={isHost} category={category} lobbyID={lobbyID} username={username}/>
    }

    return <Navigate to="/" replace />; // else return to startMenu
  };

  return (
    <>
    <WebSocketProvider> 
      <Router>
        <Routes>
          <Route path="/" element={<StartingMenu setIsHost={setIsHost} setLobbyID={setLobbyID} setUsername={setUsername} />} />
          <Route 
            path="/category" 
            element={<CategoryRoute isHost={isHost} setIsHost={setIsHost} component={ChooseCategory} setCategory={setCategory}/>} 
          />
          <Route path="/game" element={<GameRoute isHost={isHost} category={category} lobbyID={lobbyID} username={username} component={Game} />} />
        </Routes>
      </Router>
    </WebSocketProvider>   
    </>
  )
}

export default App
