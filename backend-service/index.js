const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load ABIs
const GameConsoleABI = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../packages/nextjs/contracts/GameConsole.json'), 'utf8')
).abi;

const PlayGroundABI = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../packages/nextjs/contracts/PlayGround.json'), 'utf8')
).abi;

// Configuration
const RPC_URL = 'http://127.0.0.1:8545'; // Anvil local node
const OWNER_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // First Anvil account
const GAME_CONSOLE_ADDRESS = '0x700b6A60ce7EaaEA56F065753d8dcB9653dbAD35'; // Update after deployment

// Setup provider and wallet
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);

console.log('Backend Service Started');
console.log('Owner Address:', wallet.address);
console.log('Monitoring games...\n');

// Track active games
const activeGames = new Map();

// Setup GameConsole contract
const gameConsole = new ethers.Contract(GAME_CONSOLE_ADDRESS, GameConsoleABI, wallet);

// Listen for MatchFound events to track new games
gameConsole.on('MatchFound', (player1, player2, gameAddress, event) => {
    console.log(`New game created at: ${gameAddress}`);
    console.log(`Players: ${player1} vs ${player2}\n`);

    activeGames.set(gameAddress, {
        player1,
        player2,
        address: gameAddress,
        createdAt: Date.now(),
    });
});

// Monitor games and call calculateResult when time expires
async function monitorGames() {
    const now = Math.floor(Date.now() / 1000);

    for (const [gameAddress, gameInfo] of activeGames.entries()) {
        try {
            const playGround = new ethers.Contract(gameAddress, PlayGroundABI, wallet);

            // Check game state
            const gameState = await playGround.gameState();
            if (gameState !== 0n) {
                // Game is over, remove from active games
                console.log(`Game ${gameAddress} is over, removing from monitoring\n`);
                activeGames.delete(gameAddress);
                continue;
            }

            // Get timing info
            const moveSelectionStartTime = await playGround.moveSelectionStartTime();
            const moveSelectionDuration = await playGround.moveSelectionDuration();
            const endTime = Number(moveSelectionStartTime) + Number(moveSelectionDuration);

            // Check if time has expired
            if (now >= endTime) {
                // Check if players have moved
                const player1Moved = await playGround.player1Moved();
                const player2Moved = await playGround.player2Moved();

                console.log(`Time expired for game ${gameAddress}`);
                console.log(`Player1 moved: ${player1Moved}, Player2 moved: ${player2Moved}`);
                console.log(`Calling calculateResult from owner account...`);

                try {
                    const tx = await playGround.calculateResult();
                    console.log(`Transaction sent: ${tx.hash}`);

                    const receipt = await tx.wait();
                    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
                    console.log(`Gas used: ${receipt.gasUsed.toString()}\n`);
                } catch (error) {
                    console.error(`Error calling calculateResult:`, error.message, '\n');
                }
            }
        } catch (error) {
            console.error(`Error monitoring game ${gameAddress}:`, error.message, '\n');
        }
    }
}

// Check every 5 seconds
setInterval(monitorGames, 5000);

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down backend service...');
    process.exit(0);
});
