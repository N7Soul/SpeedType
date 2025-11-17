// Simple WebSocket server for multiplayer functionality
// Run with: node server.js

const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// Create HTTP server to serve files
const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('404 Not Found');
            } else {
                res.writeHead(500);
                res.end('500 Internal Server Error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Game rooms storage
const rooms = new Map();

function generateRoomCode() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}

function broadcastToRoom(roomCode, message, excludeClient = null) {
    const room = rooms.get(roomCode);
    if (!room) return;

    room.players.forEach(player => {
        if (player.ws !== excludeClient && player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(JSON.stringify(message));
        }
    });
}

wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            console.log('Received:', message.type);

            switch (message.type) {
                case 'createRoom':
                    const roomCode = generateRoomCode();
                    rooms.set(roomCode, {
                        code: roomCode,
                        host: message.playerId,
                        players: [{
                            id: message.playerId,
                            name: message.playerName,
                            ws: ws,
                            isHost: true,
                            progress: 0,
                            finished: false,
                            finishTime: null
                        }],
                        gameStarted: false
                    });

                    ws.send(JSON.stringify({
                        type: 'roomCreated',
                        roomCode: roomCode,
                        playerId: message.playerId
                    }));
                    break;

                case 'joinRoom':
                    const room = rooms.get(message.roomCode);
                    if (!room) {
                        ws.send(JSON.stringify({
                            type: 'error',
                            message: 'Room not found'
                        }));
                        break;
                    }

                    if (room.players.length >= 8) {
                        ws.send(JSON.stringify({
                            type: 'error',
                            message: 'Room is full'
                        }));
                        break;
                    }

                    room.players.push({
                        id: message.playerId,
                        name: message.playerName,
                        ws: ws,
                        isHost: false,
                        progress: 0,
                        finished: false,
                        finishTime: null
                    });

                    ws.send(JSON.stringify({
                        type: 'roomJoined',
                        roomCode: message.roomCode,
                        players: room.players.map(p => ({
                            id: p.id,
                            name: p.name,
                            isHost: p.isHost
                        }))
                    }));

                    broadcastToRoom(message.roomCode, {
                        type: 'playerJoined',
                        player: {
                            id: message.playerId,
                            name: message.playerName,
                            isHost: false
                        }
                    }, ws);
                    break;

                case 'startGame':
                    const gameRoom = rooms.get(message.roomCode);
                    if (gameRoom && gameRoom.host === message.playerId) {
                        gameRoom.gameStarted = true;
                        gameRoom.wordLength = message.wordLength || 'random';
                        broadcastToRoom(message.roomCode, {
                            type: 'gameStarted',
                            wordLength: gameRoom.wordLength
                        });
                    }
                    break;

                case 'updateProgress':
                    const progressRoom = rooms.get(message.roomCode);
                    if (progressRoom) {
                        const player = progressRoom.players.find(p => p.id === message.playerId);
                        if (player) {
                            player.progress = message.progress;
                            player.finished = message.finished;
                            player.finishTime = message.finishTime;

                            broadcastToRoom(message.roomCode, {
                                type: 'playerProgress',
                                playerId: message.playerId,
                                progress: message.progress,
                                finished: message.finished,
                                finishTime: message.finishTime
                            });
                        }
                    }
                    break;

                case 'leaveRoom':
                    const leaveRoom = rooms.get(message.roomCode);
                    if (leaveRoom) {
                        leaveRoom.players = leaveRoom.players.filter(p => p.id !== message.playerId);
                        
                        if (leaveRoom.players.length === 0) {
                            rooms.delete(message.roomCode);
                        } else {
                            broadcastToRoom(message.roomCode, {
                                type: 'playerLeft',
                                playerId: message.playerId
                            });
                        }
                    }
                    break;
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        // Clean up rooms
        rooms.forEach((room, roomCode) => {
            room.players = room.players.filter(p => p.ws !== ws);
            if (room.players.length === 0) {
                rooms.delete(roomCode);
            }
        });
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log('WebSocket server is ready for connections');
});
