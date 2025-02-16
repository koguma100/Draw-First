import { useState, useEffect, useRef, use } from 'react';
import { useNavigate } from 'react-router-dom';
import useWebSocket from 'react-use-websocket';
import './App.css';
import './Game.css';

function Game({isHost, category, lobbyID, username}) {
    // Establish WebSocket connection when component mounts
    const WS_URL = 'ws://localhost:5001';
  
    const navigate = useNavigate();

    const canvasRef = useRef(null);
    const isDrawingRef = useRef(false);
    // Using state to update lineSize and trigger re-renders
    const [lineSize, setLineSize] = useState(10); // Default value set to 10
    const lineSizeRef = useRef(10);
    const color = useRef('black');

    const [gameStarted, setGameStarted] = useState(false);
    const [topMessage, setTopMessage] = useState('Lobby ID:' + lobbyID + '  Waiting for host to start the game');
    const [guesses, setGuesses] = useState([]);
    const [guess, setGuess] = useState('');
    const [messageType, setMessageType] = useState('');
    const [players, setPlayers] = useState({});

    // Establish WebSocket connection with the constructed URL
    const { sendJsonMessage, lastJsonMessage } = useWebSocket(WS_URL, {
        queryParams: { username: username, isHost: isHost, type: messageType } 
    });

    // get messages from the server
    useEffect(() => {
        if (lastJsonMessage === null) return;

        if (lastJsonMessage.type === 'updateUsers') {
            setPlayers(lastJsonMessage.users);
            console.log('Players updated');
        }
        console.log('Message received: ' + JSON.stringify(lastJsonMessage));
    }, [lastJsonMessage]);

    useEffect(() => {
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        // Set up drawing parameters
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'black';
    
        const startDrawing = (event) => {
            const canv = canvasRef.current;
            const ct = canv.getContext('2d');
            isDrawingRef.current = true;
            const rect = canv.getBoundingClientRect(); // Get canvas position relative to the viewport
            const x = event.clientX - rect.left; // Adjust for canvas offset
            const y = event.clientY - rect.top;  
            ct.beginPath();  // Start a new path when we start drawing
            ct.moveTo(x, y);  // Move the context to the starting point

           // send message to websocket
        };
    
        const stopDrawing = () => {
          const canv = canvasRef.current;
          const ct = canv.getContext('2d');
          isDrawingRef.current = false;
          ct.openPath();
        };
    
        const draw = (event) => {
            if (isDrawingRef.current == false) return;
        
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left; // Adjust for canvas offset
            const y = event.clientY - rect.top;  // Adjust for canvas offset
            ctx.strokeStyle = color.current;
            ctx.lineWidth = parseInt(lineSizeRef.current, 10);
            ctx.lineTo(x, y);
            ctx.stroke();

            // Send drawing data (coordinates) to WebSocket
            
        };
        
        // Set the canvas size dynamically
        const resizeCanvas = () => {
            const canvasWidth = canvas.clientWidth;
            const canvasHeight = canvas.clientHeight;
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
        };
    
        resizeCanvas();  // Call on mount

        window.addEventListener('resize', resizeCanvas); // Listen to window resize
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mousemove', draw);
    
        return () => {
          window.removeEventListener('resize', resizeCanvas);
          canvas.removeEventListener('mousedown', startDrawing);
          canvas.removeEventListener('mouseup', stopDrawing);
          canvas.removeEventListener('mousemove', draw);
        };
      }, []);
    
    const makeGuess = () => {
        if (guess === '') return;
        if (!gameStarted) return;

        sendJsonMessage({type: 'guess', guess: guess, user: username});
        console.log(username + ' sent guess: ' + guess);    
        setGuess('');
    }

    const handleChange = (event) => {
        const value = parseInt(event.target.value, 10); // Convert the value to an integer
        setLineSize(value); // Update state which will trigger re-render
        lineSizeRef.current = value; // Optionally update the ref
      };

    const startGame = () => {
        if (isHost)
        {
            setTopMessage('Category: ' + category + '   Lobby ID: ' + lobbyID + '   Host: ' + username);    
        }
        else {
            setTopMessage('Make Some Guesses!');
        }
        setGameStarted(true);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height); 
    }

    const quitgame = async () => {
        // Send POST request to backend to save the code
        try {
            const response = await fetch('http://localhost:5000/quit-game', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Tell the server we are sending JSON
                },
                body: JSON.stringify({ code: lobbyID, user: username }), // Send the code as JSON in the body
            });

            const result = await response.json();

            // Check the response from the backend
            if (response.ok) {
                console.log('Code saved successfully:', result.message);
                navigate('/'); // Navigate to the category page
            } else {
                console.error('Error saving code:', result.error);
                return;
            }
        } catch (error) {
            console.error('Error sending data:', error);
        }
    };

    const exitLobby = () => {
        quitgame();

        // Send a message to the server to exit lobby
    }

    return (
        <div className="game-screen">
                <h1 className='title'>{topMessage}</h1>
                <div className="canvas-log-wrapper">
                    <div className="drawing-features">
                        <canvas ref={canvasRef}></canvas>
                        <div className="tools">
                            <div className="dropdown-container">
                                <label htmlFor="scaleDropdown" className="title">Line Width: </label>
                                <select onChange={handleChange} value={lineSize} id="scaleDropdown" className="title">
                                    <option value="2">2px</option>
                                    <option value="5">5px</option>
                                    <option value="10">10px</option>
                                    <option value="20">20px</option>
                                    <option value="50">50px</option>
                                </select>
                            </div>
                            <div className="colors">
                                <div className="color" style={{backgroundColor: 'black'}} onClick={() => color.current='black'}></div>
                                <div className="color" style={{backgroundColor: 'brown'}} onClick={() => color.current='brown'}></div>
                                <div className="color" style={{backgroundColor: 'purple'}} onClick={() => color.current='purple'}></div>
                                <div className="color" style={{backgroundColor: 'blue'}} onClick={() => color.current='blue'}></div>
                                <div className="color" style={{backgroundColor: 'green'}} onClick={() => color.current='green'}></div>
                                <div className="color" style={{backgroundColor: 'yellow'}} onClick={() => color.current='yellow'}></div>
                                <div className="color" style={{backgroundColor: 'orange'}} onClick={() => color.current='orange'}></div>
                                <div className="color" style={{backgroundColor: 'red'}} onClick={() => color.current='red'}></div>
                                <div className="color" style={{backgroundColor: 'pink'}} onClick={() => color.current='pink'}></div>
                                <div className="color" style={{backgroundColor: 'white'}} onClick={() => color.current='white'}></div>
                            </div>
                        </div>
                        
                    </div>
                <div className="guess-log">
                    <div className="guess-input">
                        <input 
                            type="text" 
                            value = {guess}
                            onChange={(event) => setGuess(event.target.value)}
                            placeholder="Enter guesses here">
                        </input>
                        <button className="guess-button" onClick={makeGuess}>Submit</button>
                    </div>
                    <div className="guesses"></div>
                    {guesses.slice().reverse().map((guesses, index) => {
                        return <p className="guesses" key={index}>{guesses[0]}: {guesses[1]}</p>
                    })}
                </div>
            </div>
            
            <div className="game-buttons">
                {(!gameStarted && isHost) && <button className="start-game-button" onClick={startGame}>Start Game</button>}
                <button className="exit-lobby-button" onClick={exitLobby}>Exit Lobby</button>
            </div>
            
            <div className="players-list">
                <div className="player-display">_______Player________________Score_______</div>
                {Object.keys(players).map(uuid => {
                    const user = players[uuid];
                    return (
                        <div key={uuid} className='player-display'>
                            <p>{user.username}</p><p>Score: {user.score}</p>
                        </div>
                    )})
                }
            </div>
        </div>
    )
}

export default Game;