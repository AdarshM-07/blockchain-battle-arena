"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Address } from "@scaffold-ui/components";
import { parseEther } from "viem";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import PlayGroundABI from "~~/contracts/PlayGround.json";
import { useScaffoldWriteContract, useTargetNetwork } from "~~/hooks/scaffold-eth";

type MoveType = 0 | 1 | 2 | 3 | 4 | 5;

const MOVE_NAMES = {
  0: "No Move",
  1: "Move Up",
  2: "Move Down",
  3: "Basic Attack",
  4: "Medium Attack",
  5: "Special Attack",
};

type PlayerData = {
  playerAddress: `0x${string}`;
  name: string;
  health: bigint;
  basicAttackCount: bigint;
  mediumAttackCount: bigint;
  specialAttackCount: bigint;
};

type MovesData = {
  move1: MoveType;
  move2: MoveType;
  move3: MoveType;
  move4: MoveType;
  move5: MoveType;
};

export default function GamePage() {
  const params = useParams();
  const gameAddress = params.address as string;
  const { address: connectedAddress } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  const router = useRouter();

  const [moves, setMoves] = useState<MoveType[]>([0, 0, 0, 0, 0]);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isMounted, setIsMounted] = useState(false);

  const { writeContractAsync } = useWriteContract();
  const { writeContractAsync: writeClearMatch } = useScaffoldWriteContract({ contractName: "GameConsole" });

  // Read game data using wagmi's useReadContract with the dynamic address
  const {
    data: player1Raw,
    error: player1Error,
    isLoading: player1Loading,
    refetch: refetchPlayer1,
  } = useReadContract({
    address: gameAddress as `0x${string}`,
    abi: PlayGroundABI.abi,
    functionName: "player1",
    chainId: targetNetwork.id,
  });

  const player1Data: PlayerData | undefined = player1Raw
    ? {
        playerAddress: (player1Raw as any)[0],
        name: (player1Raw as any)[1],
        health: (player1Raw as any)[2],
        basicAttackCount: (player1Raw as any)[3],
        mediumAttackCount: (player1Raw as any)[4],
        specialAttackCount: (player1Raw as any)[5],
      }
    : undefined;

  const {
    data: player2Raw,
    error: player2Error,
    isLoading: player2Loading,
    refetch: refetchPlayer2,
  } = useReadContract({
    address: gameAddress as `0x${string}`,
    abi: PlayGroundABI.abi,
    functionName: "player2",
    chainId: targetNetwork.id,
  });

  const player2Data: PlayerData | undefined = player2Raw
    ? {
        playerAddress: (player2Raw as any)[0],
        name: (player2Raw as any)[1],
        health: (player2Raw as any)[2],
        basicAttackCount: (player2Raw as any)[3],
        mediumAttackCount: (player2Raw as any)[4],
        specialAttackCount: (player2Raw as any)[5],
      }
    : undefined;

  const { data: moveSelectionStartTime, refetch: refetchMoveSelectionStartTime } = useReadContract({
    address: gameAddress as `0x${string}`,
    abi: PlayGroundABI.abi,
    functionName: "moveSelectionStartTime",
    chainId: targetNetwork.id,
  });

  const { data: moveSelectionDuration } = useReadContract({
    address: gameAddress as `0x${string}`,
    abi: PlayGroundABI.abi,
    functionName: "moveSelectionDuration",
    chainId: targetNetwork.id,
  });

  const { data: waitDuration } = useReadContract({
    address: gameAddress as `0x${string}`,
    abi: PlayGroundABI.abi,
    functionName: "waitDuration",
    chainId: targetNetwork.id,
  });

  const { data: owner } = useReadContract({
    address: gameAddress as `0x${string}`,
    abi: PlayGroundABI.abi,
    functionName: "owner",
    chainId: targetNetwork.id,
  });

  const { data: gameCount, refetch: refetchGameCount } = useReadContract({
    address: gameAddress as `0x${string}`,
    abi: PlayGroundABI.abi,
    functionName: "gameCount",
    chainId: targetNetwork.id,
  });

  const { data: gameState, refetch: refetchGameState } = useReadContract({
    address: gameAddress as `0x${string}`,
    abi: PlayGroundABI.abi,
    functionName: "gameState",
    chainId: targetNetwork.id,
  }) as { data: number | undefined; refetch: () => void };

  const { data: p1Moves, refetch: refetchP1Moves } = useReadContract({
    address: gameAddress as `0x${string}`,
    abi: PlayGroundABI.abi,
    functionName: "P1moves",
    chainId: targetNetwork.id,
  }) as { data: MovesData | undefined; refetch: () => void };

  const { data: p2Moves, refetch: refetchP2Moves } = useReadContract({
    address: gameAddress as `0x${string}`,
    abi: PlayGroundABI.abi,
    functionName: "P2moves",
    chainId: targetNetwork.id,
  }) as { data: MovesData | undefined; refetch: () => void };

  const { data: player1Moved, refetch: refetchPlayer1Moved } = useReadContract({
    address: gameAddress as `0x${string}`,
    abi: PlayGroundABI.abi,
    functionName: "player1Moved",
    chainId: targetNetwork.id,
  }) as { data: boolean | undefined; refetch: () => void };

  const { data: player2Moved, refetch: refetchPlayer2Moved } = useReadContract({
    address: gameAddress as `0x${string}`,
    abi: PlayGroundABI.abi,
    functionName: "player2Moved",
    chainId: targetNetwork.id,
  }) as { data: boolean | undefined; refetch: () => void };

  // Refetch all game data
  const refetchAllData = async () => {
    await Promise.all([
      refetchPlayer1(),
      refetchPlayer2(),
      refetchGameCount(),
      refetchGameState(),
      refetchP1Moves(),
      refetchP2Moves(),
      refetchPlayer1Moved(),
      refetchPlayer2Moved(),
      refetchMoveSelectionStartTime(),
    ]);
  };

  // Mount effect to avoid hydration errors
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Debug logging
  useEffect(() => {
    console.log("Game Address:", gameAddress);
    console.log("Connected Address:", connectedAddress);
    console.log("Player 1 Data:", player1Data);
    console.log("Player 2 Data:", player2Data);
    console.log("Player 1 Error:", player1Error);
    console.log("Player 2 Error:", player2Error);
    console.log("Player 1 Loading:", player1Loading);
    console.log("Player 2 Loading:", player2Loading);
    console.log("Target Network:", targetNetwork);
  }, [
    gameAddress,
    connectedAddress,
    player1Data,
    player2Data,
    player1Error,
    player2Error,
    player1Loading,
    player2Loading,
    targetNetwork,
  ]);

  // Auto-refresh data every 3 seconds to catch backend updates
  useEffect(() => {
    const interval = setInterval(() => {
      refetchAllData();
      console.log("Auto-refreshing game data...");
    }, 3000); // Refresh every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Timer countdown - reset when moveSelectionStartTime changes (new round starts)
  useEffect(() => {
    if (!moveSelectionStartTime || !moveSelectionDuration) return;

    // Immediately update timer when moveSelectionStartTime changes
    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const startTime = Number(moveSelectionStartTime);
      const duration = Number(moveSelectionDuration);
      const endTime = startTime + duration;

      // Only set time remaining if game has started (after waiting phase)
      if (now >= startTime) {
        const remaining = endTime - now;
        setTimeRemaining(remaining > 0 ? remaining : 0);
      } else {
        // During waiting phase, set to full duration
        setTimeRemaining(duration);
      }
    };

    // Run immediately
    updateTimer();

    // Then run every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [moveSelectionStartTime, moveSelectionDuration]); // Removed timeRemaining from dependencies

  const handleMoveChange = (index: number, value: MoveType) => {
    const newMoves = [...moves];
    newMoves[index] = value;
    setMoves(newMoves);
  };

  const handleSubmitMoves = async () => {
    try {
      await writeContractAsync({
        address: gameAddress as `0x${string}`,
        abi: PlayGroundABI.abi,
        functionName: "PerformMoves",
        args: [moves[0], moves[1], moves[2], moves[3], moves[4]],
      });
      alert("Moves submitted successfully!");
    } catch (error) {
      console.error("Error submitting moves:", error);
      alert("Failed to submit moves");
    }
  };

  const handleGoBackHome = async () => {
    try {
      await writeClearMatch({
        functionName: "clearMatchAddress",
      });
      router.push("/");
    } catch (error) {
      console.error("Error clearing match:", error);
      alert("Failed to clear match address");
    }
  };

  const isPlayer = connectedAddress === player1Data?.playerAddress || connectedAddress === player2Data?.playerAddress;
  const now = isMounted ? Math.floor(Date.now() / 1000) : 0;
  const startTime = Number(moveSelectionStartTime || 0);
  const hasGameStarted = isMounted && now >= startTime;
  const isWaitingPhase = isMounted && now < startTime;
  const waitTimeRemaining = isWaitingPhase ? startTime - now : 0;

  const canSubmitMoves =
    isPlayer && (gameState === 0 || gameState === undefined) && hasGameStarted && timeRemaining > 0;
  const isTimeUp = isMounted && timeRemaining <= 0 && hasGameStarted && !isWaitingPhase;
  const bothPlayersMoved = player1Moved && player2Moved;
  const canCalculate = gameState === 0 && (isTimeUp || bothPlayersMoved);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-4xl font-bold">Action Game</h1>
          <button onClick={handleGoBackHome} className="btn btn-outline btn-sm">
            ← Go Back Home
          </button>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Game Contract:</p>
          <Address address={gameAddress} />
        </div>
      </div>

      {/* Game Status */}
      <div className="card bg-base-200 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title justify-center">Game Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Rounds Remaining</p>
              <p className="text-2xl font-bold">{gameCount?.toString() || "0"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Time Remaining</p>
              <p className="text-2xl font-bold">
                {!isMounted
                  ? "Loading..."
                  : isWaitingPhase
                    ? `Waiting: ${waitTimeRemaining}s`
                    : hasGameStarted
                      ? timeRemaining > 0
                        ? `${timeRemaining}s`
                        : isTimeUp
                          ? "Time's Up!"
                          : `${timeRemaining}s`
                      : "Ready"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Game State</p>
              <p className="text-2xl font-bold">
                {gameState === undefined ? "Loading..." : gameState === 0 ? "Active" : "Over"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Players Info - Side by Side */}
      <div className="card bg-base-200 shadow-xl mb-6">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Side - Me */}
            <div className="bg-primary text-primary-content rounded-lg p-6">
              <h3 className="text-2xl font-bold mb-2">You</h3>
              <p className="text-sm mb-1">
                {connectedAddress === player1Data?.playerAddress ? player1Data?.name : player2Data?.name}
              </p>
              <div className="text-xs opacity-70 mb-4">
                <Address address={connectedAddress} />
              </div>

              <div className="space-y-3">
                <div className="bg-primary-focus rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Health</span>
                    <span className="text-2xl font-bold">
                      {connectedAddress === player1Data?.playerAddress
                        ? player1Data?.health?.toString() || "0"
                        : player2Data?.health?.toString() || "0"}
                    </span>
                  </div>
                </div>
                <div className="bg-primary-focus rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Basic Attacks</span>
                    <span className="text-xl font-bold">
                      {connectedAddress === player1Data?.playerAddress
                        ? player1Data?.basicAttackCount?.toString() || "0"
                        : player2Data?.basicAttackCount?.toString() || "0"}
                    </span>
                  </div>
                </div>
                <div className="bg-primary-focus rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Medium Attacks</span>
                    <span className="text-xl font-bold">
                      {connectedAddress === player1Data?.playerAddress
                        ? player1Data?.mediumAttackCount?.toString() || "0"
                        : player2Data?.mediumAttackCount?.toString() || "0"}
                    </span>
                  </div>
                </div>
                <div className="bg-primary-focus rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Special Attacks</span>
                    <span className="text-xl font-bold">
                      {connectedAddress === player1Data?.playerAddress
                        ? player1Data?.specialAttackCount?.toString() || "0"
                        : player2Data?.specialAttackCount?.toString() || "0"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Opponent */}
            <div className="bg-base-300 rounded-lg p-6">
              <h3 className="text-2xl font-bold mb-2">Opponent</h3>
              <p className="text-sm mb-1">
                {connectedAddress === player1Data?.playerAddress ? player2Data?.name : player1Data?.name}
              </p>
              <div className="text-xs opacity-70 mb-4">
                <Address
                  address={
                    connectedAddress === player1Data?.playerAddress
                      ? player2Data?.playerAddress
                      : player1Data?.playerAddress
                  }
                />
              </div>

              <div className="space-y-3">
                <div className="bg-base-100 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Health</span>
                    <span className="text-2xl font-bold">
                      {connectedAddress === player1Data?.playerAddress
                        ? player2Data?.health?.toString() || "0"
                        : player1Data?.health?.toString() || "0"}
                    </span>
                  </div>
                </div>
                <div className="bg-base-100 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Basic Attacks</span>
                    <span className="text-xl font-bold">
                      {connectedAddress === player1Data?.playerAddress
                        ? player2Data?.basicAttackCount?.toString() || "0"
                        : player1Data?.basicAttackCount?.toString() || "0"}
                    </span>
                  </div>
                </div>
                <div className="bg-base-100 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Medium Attacks</span>
                    <span className="text-xl font-bold">
                      {connectedAddress === player1Data?.playerAddress
                        ? player2Data?.mediumAttackCount?.toString() || "0"
                        : player1Data?.mediumAttackCount?.toString() || "0"}
                    </span>
                  </div>
                </div>
                <div className="bg-base-100 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Special Attacks</span>
                    <span className="text-xl font-bold">
                      {connectedAddress === player1Data?.playerAddress
                        ? player2Data?.specialAttackCount?.toString() || "0"
                        : player1Data?.specialAttackCount?.toString() || "0"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Move Selection */}
      {!isPlayer && (
        <div className="alert alert-warning shadow-lg mb-6">
          <div className="w-full">
            <div className="flex items-start gap-2 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current flex-shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>You are not a player in this game. Connect with a player's wallet to participate.</span>
            </div>
            <div className="text-xs mt-2 opacity-70">
              <p>Connected: {connectedAddress || "No wallet connected"}</p>
              <p>Player 1: {player1Data?.playerAddress || "Loading..."}</p>
              <p>Player 2: {player2Data?.playerAddress || "Loading..."}</p>
            </div>
          </div>
        </div>
      )}

      {isPlayer && (gameState === 0 || gameState === undefined) && (
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">Select Your Moves (5 moves per round)</h2>
            {!hasGameStarted && <p className="text-warning text-sm mb-4">⏳ Game will start soon...</p>}
            <div className="grid grid-cols-1 gap-6">
              {moves.map((move, index) => (
                <div key={index} className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-lg">
                      Move {index + 1}: {MOVE_NAMES[move]}
                    </span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <button
                      className={`btn ${move === 0 ? "btn-primary" : "btn-outline"}`}
                      onClick={() => handleMoveChange(index, 0)}
                      disabled={!canSubmitMoves}
                    >
                      No Move
                    </button>
                    <button
                      className={`btn ${move === 1 ? "btn-primary" : "btn-outline"}`}
                      onClick={() => handleMoveChange(index, 1)}
                      disabled={!canSubmitMoves}
                    >
                      ⬆️ Move Up
                    </button>
                    <button
                      className={`btn ${move === 2 ? "btn-primary" : "btn-outline"}`}
                      onClick={() => handleMoveChange(index, 2)}
                      disabled={!canSubmitMoves}
                    >
                      ⬇️ Move Down
                    </button>
                    <button
                      className={`btn ${move === 3 ? "btn-primary" : "btn-outline"}`}
                      onClick={() => handleMoveChange(index, 3)}
                      disabled={!canSubmitMoves}
                    >
                      ⚔️ Basic (1💥)
                    </button>
                    <button
                      className={`btn ${move === 4 ? "btn-primary" : "btn-outline"}`}
                      onClick={() => handleMoveChange(index, 4)}
                      disabled={!canSubmitMoves}
                    >
                      ⚔️⚔️ Medium (2💥)
                    </button>
                    <button
                      className={`btn ${move === 5 ? "btn-primary" : "btn-outline"}`}
                      onClick={() => handleMoveChange(index, 5)}
                      disabled={!canSubmitMoves}
                    >
                      💥 Special (3💥)
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="card-actions justify-end mt-4">
              <button className="btn btn-primary btn-lg" onClick={handleSubmitMoves} disabled={!canSubmitMoves}>
                Submit All Moves
              </button>
            </div>
            {!canSubmitMoves && hasGameStarted && timeRemaining === 0 && (
              <p className="text-error text-sm mt-2">Time's up! Waiting for round calculation...</p>
            )}
          </div>
        </div>
      )}

      {/* Game Over */}
      {gameState === 1 && (
        <div className="alert alert-info shadow-lg">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current flex-shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <div>
              <h3 className="font-bold">Game Over!</h3>
              <div className="text-xs">
                Winner:{" "}
                {(player1Data?.health ?? 0n) > (player2Data?.health ?? 0n)
                  ? `Player 1 (${player1Data?.name})`
                  : (player2Data?.health ?? 0n) > (player1Data?.health ?? 0n)
                    ? `Player 2 (${player2Data?.name})`
                    : "Draw"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
