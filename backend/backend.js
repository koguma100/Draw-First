const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();

// File where room data will be stored
const roomsFilePath = path.join(__dirname, 'rooms.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Function to read the current room data from the file
const readRoomsFromFile = () => {
  if (fs.existsSync(roomsFilePath)) {
    const fileData = fs.readFileSync(roomsFilePath, 'utf8');
    return JSON.parse(fileData);
  }
  return { validcodes: [], roomSize: [] }; // Default if the file doesn't exist
};

// Function to save the room data to the file
const saveRoomsToFile = (roomsData) => {
  fs.writeFileSync(roomsFilePath, JSON.stringify(roomsData, null, 3), 'utf8');
};

app.get('/', (req, res) => {
  res.send('Hello, welcome to the backend!');
});

// API Route to create a game
app.post('/create-game', async (req, res) => {
  const { code, user } = req.body;

  if (!code) {
    return res.status(400).send({ error: 'Code is required' });
  }

  try {
    const roomsData = readRoomsFromFile();
    
    if (roomsData.validcodes.length >= 4) {
      return res.status(500).send({ message: 0 });
    }

    if (roomsData.validcodes.includes(code)) {
      return res.status(500).send({ error: 'Sorry, that key is already in use' });
    }

    // Add the code to validcodes
    roomsData.validcodes.push(code);

    // Save host and room key
    roomsData.roomSize.push({ code, host: user,players: [] });

    saveRoomsToFile(roomsData);

    res.status(201).send({ message: 1 });
  } catch (err) {
    console.error('Error saving code:', err);
    res.status(500).send({ error: 'Failed to save code' });
  }
});

// API Route to join a game
app.post('/join-game', async (req, res) => {
  const { code, user } = req.body;

  if (!code || !user) {
    return res.status(400).send({ error: 'Code and username are required' });
  }

  try {
    const roomsData = readRoomsFromFile();
    
    if (!roomsData.validcodes.includes(code)) {
      return res.status(400).send({ error: 'Room not found' });
    }

    // Check if the room is already in the roomSize array
    const room = roomsData.roomSize.find((room) => room.code === code);

    if (room && room.players.length >= 7) {
      return res.status(400).send({ error: 'Room is full' });
    }

    if (room.players.includes(user)) {
        return res.status(400).send({ error: 'User already in the room' });
    }
    // Player add to room
    room.players.push(user);
    

    // Save the updated data to the file
    saveRoomsToFile(roomsData);

    res.status(200).send({ message: 'Joined the game successfully' });
  } catch (err) {
    console.error('Error joining game:', err);
    res.status(500).send({ error: 'Failed to join the game' });
  }
});

// API Route to delete user from game
app.post('/quit-game', async (req, res) => {
    const { code, user } = req.body;
  
    if (!code || !user) {
      return res.status(400).send({ error: 'Code and username are required' });
    }
  
    try {
        const roomsData = readRoomsFromFile();

        // Check if the room exists
        const room = roomsData.roomSize.find((room) => room.code === code);

        if (!room) {
            return res.status(400).send({ error: 'Room not found' });
        }

        if(room.host== user){
            const roomIndex = roomsData.roomSize.indexOf(room);
            roomsData.roomSize.splice(roomIndex, 1); // Delete the empty room
            roomsData.validcodes.splice(roomsData.validcodes.indexOf(code),1);
        }
        else {
            // Check if the user is in the room
            const userIndex = room.players.indexOf(user);

            if (userIndex === -1) {
                return res.status(400).send({ error: 'User not in the room' });
            }

            // Remove the user from the room
            room.players.splice(userIndex, 1);
        }

        // Save the updated data back to the JSON file
        saveRoomsToFile(roomsData);

        res.status(200).send({ message: 'User successfully removed from the game' });
    } catch (err) {
      console.error('Error quitting the game:', err);
      res.status(500).send({ error: 'Failed to quit the game' });
    }
  });
  

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
