import { useEffect, useState } from 'react'
import './App.css'
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from './WebSocketProvider.jsx';

function StartingMenu({setIsHost, setLobbyID, setUsername}) {
    const nav = useNavigate();
    const { wsRef, connectWebSocket, disconnectWebSocket, message } = useWebSocket();
    const [menuData, setMenuData] = useState({
        username: '',
        lobbyID: '',
        lobbyCode: '',
        alertMessage: 'Enter Option to get started'
    });

    useEffect(() => {
        if (wsRef.current != null) {
            disconnectWebSocket();
        }
    }, []);
    const handleChange = (event) => {
        const { name, value } = event.target;
        if (name === 'lobbyCode') {
            setLobbyID(value);
        }
        if (name === 'username') {
            setUsername(value);
        }
        setMenuData((prevData) => {
            return {
                ...prevData,
                [name]: value
            };
        });
    };

    const handleCreateLobby = () => {
        if (menuData.username === '') {
            setMenuData((prevData) => {
                return {
                    ...prevData,
                    alertMessage: 'Please enter a Username'
                };
            });
            return;
        }
        else if (menuData.lobbyCode.length !== 4) {
            setMenuData((prevData) => {
                return {
                    ...prevData,
                    alertMessage: 'Please enter valid lobby code (4 characters)'
                };
            });
            return;
        }
        else {
            // Create a new lobby
            setIsHost(true);
            nav('/category');
        }

    };

    const handleJoinLobby = () => {
        if (menuData.username === '') {
            setMenuData((prevData) => {
                return {
                    ...prevData,
                    alertMessage: 'Please enter a Username'
                };
            });
            return;
        }
        else if (menuData.lobbyID.length !== 4) {
            setMenuData((prevData) => {
                return {
                    ...prevData,
                    alertMessage: 'Please enter valid lobby ID (4 characters)'
                };
            });
            return;
        }
        else {
            // Join a lobby
            nav('/game');
        }
    };

    return (
        <>
        <h1 className="title">Draw First</h1>
        <h2 className="title">a group drawing game</h2>
        <div className="menu">
            <input 
                type="text" 
                name="username"
                placeholder="Username" 
                value={menuData.username}
                onChange={handleChange}
                maxLength="16"
            />
            <div className="menu-options">
                <div className="menu-option">
                    <input 
                        type="text" 
                        name="lobbyCode"
                        value={menuData.lobbyCode} 
                        onChange={handleChange} 
                        placeholder="Lobby Code (4)" 
                        maxLength="4"
                    />
                    <button onClick={handleCreateLobby}>Create Lobby</button>
                </div>
                <div className="menu-option">
                    <input 
                        type="text" 
                        name="lobbyID"
                        value={menuData.lobbyID} 
                        onChange={handleChange} 
                        placeholder="Lobby ID (4)" 
                        maxLength="4" 
                    />
                    <button onClick={handleJoinLobby}>Join Lobby</button>
                </div>
            </div>

            <div className="alert-message">{menuData.alertMessage}</div>
            
        </div>
        
        </>
    )
}

export default StartingMenu