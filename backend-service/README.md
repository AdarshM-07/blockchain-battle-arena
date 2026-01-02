# Backend Service

Automated service that calls `calculateResult` from the owner's account when time expires.

## Setup

1. Install dependencies:
```bash
cd backend-service
npm install
```

2. Update `GAME_CONSOLE_ADDRESS` in `index.js` with your deployed GameConsole address

3. Start the service:
```bash
npm start
```

## How it works

- Listens for `MatchFound` events from GameConsole
- Tracks all active games
- Every 5 seconds, checks if games have reached `moveSelectionStartTime + moveSelectionDuration`
- Calls `calculateResult()` from the owner's account when time expires and both players have moved
- Removes completed games from monitoring

## Configuration

Edit `index.js` to change:
- `RPC_URL`: Your blockchain RPC endpoint
- `OWNER_PRIVATE_KEY`: Owner's private key
- `GAME_CONSOLE_ADDRESS`: Deployed GameConsole contract address
