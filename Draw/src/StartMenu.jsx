import { useState } from 'react'
import './App.css'
import { useNavigate } from 'react-router-dom';

function StartingMenu({setIsHost, setLobbyID}) {
    const nav = useNavigate();
    const [menuData, setMenuData] = useState({
        username: '',
        lobbyID: '',
        lobbyCode: '',
        alertMessage: 'Enter Option to get started'
    });

     // Function to handle form submission and send POST request to backend
     const creategame = async () => {
        // Send POST request to backend to save the code
        try {
            const response = await fetch('http://localhost:5000/create-game', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Tell the server we are sending JSON
                },
                body: JSON.stringify({ code: menuData.lobbyCode, user: menuData.username }), // Send the code as JSON in the body
            });

            const result = await response.json();

            // Check the response from the backend
            if (response.ok) {
                console.log('Code saved successfully:', result.message);
                setIsHost(true); // Set the user as the host
                nav('/category'); // Navigate to the category page
            } else {
                console.error('Error saving code:', result.error);
                setMenuData((prevData) => ({
                    ...prevData,
                    alertMessage: 'Error creating game. Please try again.'
                }));
                return;
            }
        } catch (error) {
            console.error('Error sending data:', error);
        }
    };

 // Function to handle form submission and send POST request to backend
    const joingame = async () => {
        // Send POST request to backend to save the code
        try {
            const response = await fetch('http://localhost:5000/join-game', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Tell the server we are sending JSON
                },
                body: JSON.stringify( {code:menuData.lobbyID,user:menuData.username} ), // Send the code as JSON in the body
            });

            const result = await response.json();

            // Check the response from the backend
            if (response.ok) {
                console.log('Code saved successfully:', result.message);
                setIsHost(true); // Set the user as the host
                nav('/category'); // Navigate to the category page
            } else {
                console.error('Error saving code:', result.error);
                setMenuData((prevData) => ({
                    ...prevData,
                    alertMessage: 'Room is full, cannot join game :('
                }));
                return;
            }

        } catch (error) {
            console.error('Error sending data:', error);
        }
    };



    const handleChange = (event) => {
        const { name, value } = event.target;
        if (name === 'lobbyCode') {
            setLobbyID(value);
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
            creategame();

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
            joingame();
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