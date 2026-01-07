# ⚔️ Action Game - Blockchain Battle Arena

**A fully on-chain PvP fighting game built on Ethereum with real-time blockchain interaction, smart contract-based matchmaking, and automated round calculation using event-driven architecture.**

## 🎮 Overview

This is a fully on-chain fighting game where players:
- Deposit 0.001 ETH to enter matchmaking
- Battle for 5 rounds with 30-second move selection per round
- Use strategic positioning (up/down) and attacks (basic/medium/special)
- Winner takes 0.0015 ETH, owner receives 0.0005 ETH platform fee

⚙️ Built using NextJS, Foundry, Wagmi, Viem, and Typescript (Scaffold-ETH 2).

## ✨ Features

- ✅ **Decentralized Matchmaking**: Players find opponents via smart contract
- ⚔️ **5-Round Combat**: Strategic battles with health management (starts at 10)
- 🎯 **Attack Varieties**: Basic (1💥), Medium (2💥), Special (3💥) with limited uses
- 🔄 **Auto Round Calculation**: Backend service triggers results from owner's account
- ⏱️ **Real-time Updates**: Game state refreshes every 3 seconds
- 🎨 **Side-by-side UI**: Clean interface showing both players' stats
- 🛡️ **Attack Exhaustion**: Automatic conversion to "stay" when attacks depleted
- 💰 **Prize Pool**: 0.0015 ETH to winner, 0.0005 ETH platform fee

## 🏗️ Architecture

### Smart Contracts (Solidity)
- **GameConsole.sol**: Matchmaking system, emits `MatchFound` events
- **PlayGround.sol**: Individual game logic with 5 rounds, damage calculation, prize distribution

### Frontend (Next.js + TypeScript)
- Real-time battle interface with timer (10s waiting + 30s move selection)
- Move selection UI with 6 options
- Auto-refresh player stats and game state

### Backend Service (Node.js)
- Monitors active games via events
- Calls `calculateResult()` when time expires from owner's account

## 🛠️ Tech Stack

- **Blockchain**: Ethereum (Anvil local testnet)
- **Contracts**: Solidity ^0.8.0, Foundry
- **Frontend**: Next.js 15, React, TypeScript, TailwindCSS, DaisyUI
- **Web3**: wagmi v2, viem
- **Backend**: Node.js, ethers.js v6

## 📦 Requirements & Installation

Before you begin, you need to install the following tools:

- [Node (>= v20.18.3)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## 🚀 Quickstart

### 1. Clone and install

```bash
git clone https://github.com/AdarshM-07/blockchain-battle-arena
cd blockchain-battle-arena
yarn install
```

### 2. Run a local blockchain

```bash
yarn chain
```

This starts an Anvil local Ethereum network on `http://127.0.0.1:8545`.

### 3. Deploy contracts (in a new terminal)

```bash
yarn deploy
```

This deploys GameConsole and PlayGround contracts. Note the GameConsole address from the output.

### 4. Setup and start backend service (in a new terminal)

```bash
cd backend-service
npm install
```

Edit `backend-service/index.js` and update:
- `GAME_CONSOLE_ADDRESS`: Use the address from step 3
- `OWNER_PRIVATE_KEY`: Default is first Anvil account (already set)

```bash
npm start
```

### 5. Start the frontend (in a new terminal)

```bash
yarn start
# or
npm start
```

Visit your app on: `http://localhost:3000`

## 🎯 How to Play

### Step 1: Find a Match
1. Connect your wallet (use Anvil test accounts)
2. Click "Find Match" and deposit 0.001 ETH
3. Wait for another player to join

### Step 2: Battle
- **Waiting Phase** (10s): Prepare your strategy
- **Move Selection** (30s): Choose 5 moves:
  - **No Move**: Stay in position
  - **Move Up/Down**: Change lanes
  - **Basic Attack**: 1 damage (3 available)
  - **Medium Attack**: 2 damage (2 available)
  - **Special Attack**: 3 damage (1 available)
- Submit your moves before time runs out

### Step 3: Round Results
- Backend automatically calculates when time expires
- Damage is dealt based on positioning and timing
- Game refreshes with updated health and attack counts

### Step 4: Victory
- Game ends after 5 rounds or when a player reaches 0 health
- Winner receives 0.0015 ETH
- Owner receives 0.0005 ETH platform fee

## 📁 Project Structure

```
blockchain-battle-arena/
├── packages/
│   ├── foundry/              # Smart contracts
│   │   ├── contracts/
│   │   │   ├── GameConsole.sol
│   │   │   └── PlayGround.sol
│   │   └── script/
│   │       └── Deploy.s.sol
│   └── nextjs/               # Frontend
│       ├── app/
│       │   ├── page.tsx      # Home page (matchmaking)
│       │   └── game/[address]/page.tsx  # Game page
│       └── contracts/        # Contract ABIs
└── backend-service/          # Automated calculation
    ├── index.js
    └── package.json
```

## 🎮 Game Mechanics

### Attack System
- **Basic Attack (3)**: 1 damage
- **Medium Attack (2)**: 2 damage
- **Special Attack (1)**: 3 damage
- Attacks auto-convert to "stay" when exhausted

### Damage Calculation
- Attacks hit if in same lane as opponent's next position
- Simultaneous attacks reduce each other's damage
- Defensive positioning can block incoming damage

### Timer System
- **10 seconds**: Waiting phase (new round prep)
- **30 seconds**: Move selection phase
- **Auto-calculation**: Backend triggers at time expiry

## 🐛 Troubleshooting

**Backend not working**
- Check `GAME_CONSOLE_ADDRESS` matches deployed address
- Verify blockchain is running: `yarn chain`

**Timer shows "Time's Up" during waiting**
- Refresh the page
- Check console for errors

**Can't submit moves**
- Ensure timer shows positive seconds (not waiting phase)
- Verify you're connected as a player

## 🔧 Development

**Run contract tests:**
```bash
cd packages/foundry
forge test
```

**Redeploy contracts:**
```bash
yarn deploy
```

**Clean build cache:**
```bash
rm -rf packages/nextjs/.next
```

## 📝 Smart Contract Details

### GameConsole
- `findMatch()`: Enter matchmaking with 0.001 ETH
- `cancelMatch()`: Get refund if no opponent found
- `clearMatchAddress()`: Remove game mapping after completion

### PlayGround
- `PerformMoves()`: Submit 5 moves for current round
- `calculateResult()`: Process round (called by owner/backend)
- Emits `RoundCalculated` event on completion

## 🚀 Future Enhancements

- [ ] Multiple concurrent games
- [ ] Leaderboard system
- [ ] Ranked matchmaking
- [ ] NFT rewards
- [ ] Replay system
- [ ] Mobile optimization

## 📞 Support

For issues or questions, please open an issue on GitHub.

