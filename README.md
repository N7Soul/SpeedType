# SpeedType - Multiplayer Typing Game

A web-based multiplayer racing game where players type words to move their cars around a racetrack. Up to 8 players can compete in real-time!

## Features

- 🏁 **Multiplayer Racing**: Support for up to 8 players
- ⌨️ **Typing-Based Movement**: Type words correctly to advance your car
- 🎮 **Real-time Competition**: See other players' progress in real-time
- 🏆 **Results Screen**: View final rankings and times
- 🎨 **Colorful Cars**: Each player gets a unique colored car

## How to Play

### Single Player (Demo Mode)
Simply open `index.html` in your web browser to play in demo mode.

### Multiplayer Mode

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Server**:
   ```bash
   npm start
   ```

3. **Open the Game**:
   - Navigate to `http://localhost:3000` in your browser
   - Open multiple browser tabs/windows to simulate multiple players

4. **Create or Join a Room**:
   - **Host**: Enter your name and click "Create Room"
   - **Join**: Enter your name, input the room code, and click "Join Room"

5. **Start Racing**:
   - The host clicks "Start Race" when ready
   - Type the displayed words as quickly and accurately as possible
   - First to complete all words wins!

## Game Controls

- Type the words displayed on screen
- Press Enter to submit (automatic on correct word)
- Watch your progress bar and position update in real-time

## Technical Details

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js with WebSocket (ws library)
- **Canvas**: HTML5 Canvas for racetrack rendering
- **Real-time Communication**: WebSocket for multiplayer synchronization

## File Structure

```
├── index.html       # Main HTML file
├── style.css        # Styling
├── game.js          # Client-side game logic
├── server.js        # WebSocket server
├── package.json     # Node.js dependencies
└── README.md        # This file
```

## Customization

You can customize the game by modifying these variables in `game.js`:

- `CONFIG.maxPlayers`: Maximum number of players (default: 8)
- `CONFIG.raceLength`: Number of words to type (default: 100)
- `CONFIG.countdownSeconds`: Countdown before race starts (default: 3)
- `WORDS`: Array of words used in the game
- `CAR_COLORS`: Colors for player cars

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

Requires a modern browser with WebSocket and Canvas support.

## Future Enhancements

- Persistent leaderboards
- Custom word lists
- Different difficulty levels
- Power-ups and obstacles
- Mobile responsive design
- Tournament mode

Enjoy racing! 🏎️💨
