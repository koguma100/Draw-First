const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const url = require('url');
const app = express();
const port = 5001;

const connections = {};
const users = {};

app.use(cors({
  origin: 'http://localhost:5173',  
  methods: ['GET', 'POST'],
}));

const broadcastUsers = () => {
  Object.keys(connections).forEach((uuid) => {
    const connection = connections[uuid];
    const message = JSON.stringify({
      type: 'updateUsers',
      users: users,
    });
    connection.send(message); 
  });
}

const handleMessage = (bytes, uuid) => {
  const message = JSON.parse(bytes.toString());
  const user = users[uuid];

  if (message.type === 'updateUsers') {
    users = message.users;
    broadcastUsers();
  }
  else if (message.type === 'guess') {
    // Broadcast the guess to all clients
    console.log(`User ${user.username} guessed: ${message.guess}`);
    Object.keys(connections).forEach((uuid) => {
      const connection = connections[uuid];
      const message = JSON.stringify({
        type: 'guess',
        guess: message.guess,
        user: user.username,
      });
      connection.send(message); 
    });
  }
};

const handleClose = (uuid) => {
  console.log(`Client ${users[uuid].username} disconnected`);
  delete connections[uuid];
  delete users[uuid];
  broadcastUsers();
};

function generateUUID() {
  // Generate a random 32-character hexadecimal string
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
  });
}

// Set up HTTP server
const server = http.createServer(app);

// Set up WebSocket server on the same HTTP server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, request) => {
    const queryParams = url.parse(request.url, true).query;
    const username = queryParams.username;
    const isHost = queryParams.isHost;
    const uuid = generateUUID();
    ws.on('message', message => {
        const decodedMessage = JSON.parse(message.toString());
        const user = users[uuid];
        if (message.type === 'startGame') {
          // Broadcast the start game to all clients
          console.log(`User ${user.username} started the game`);
          Object.keys(connections).forEach((uuid) => {
            const connection = connections[uuid];
            connection.send(JSON.stringify({
              type: 'startGame',
              word: decodedMessage.word,
            }));
          });
        }
        if (message.type === 'guess') {
          // Broadcast the guess to all clients
          console.log(`User ${user.username} guessed: ${decodedMessage.guess}`);
          Object.keys(connections).forEach((uuid) => {
            const connection = connections[uuid];
            connection.send(JSON.stringify({
              type: 'guess',
              guess: decodedMessage.guess,
              user: user.username,
            }));
          });
        }
        broadcastUsers();
        console.log(decodedMessage);
    });
    ws.on('close', () => {
        console.log('Client disconnected');
        handleClose(uuid);
    });

    connections[uuid] = ws;

    users[uuid] = {
      username,
      isHost,
      score: 0,
    };

    Object.keys(connections).forEach((uuid) => {
      const connection = connections[uuid];
      connection.send(JSON.stringify({
        type: 'join',
        user: username,
      }));
    });
    
    console.log(username + ' connected');
    broadcastUsers();
});

app.get('/api', (req, res) => {
  res.json({ message: 'Hello from Express!' });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});