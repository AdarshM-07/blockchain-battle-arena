"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { hardhat } from "viem/chains";
import { useAccount } from "wagmi";
import { parseEther } from "viem";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useTargetNetwork, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";



const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  const [playerName, setPlayerName] = useState("");
  const { writeContractAsync: writeFindMatch } = useScaffoldWriteContract("GameConsole");
  const router = useRouter();

  const { data: PlayGroundAddress } = useScaffoldReadContract({
    contractName: "GameConsole",
    functionName: "getMatchAddress",
    args: [connectedAddress],
  });

  useEffect(() => {
    if (PlayGroundAddress && PlayGroundAddress !== "0x0000000000000000000000000000000000000000") {
      router.push(`/game/${PlayGroundAddress}`);
    }
  }, [PlayGroundAddress, router]);

  const handleFindMatch = async () => {
    if (!playerName.trim()) {
      alert("Please enter your player name!");
      return;
    }

    try {
      await writeFindMatch({
        functionName: "findMatch",
        args: [playerName],
        value: parseEther("0.1"),
      });
    } catch (error) {
      console.error("Error finding match:", error);
    }
  };
  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Action Game</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address
              address={connectedAddress}
              chain={targetNetwork}
              blockExplorerAddressLink={
                targetNetwork.id === hardhat.id ? `/blockexplorer/address/${connectedAddress}` : undefined
              }
            />
          </div>
          <div className="mt-10 flex flex-col space-y-4 items-center">
            <div className="w-full max-w-md">
              <input
                type="text"
                placeholder="Enter your player name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>
            <button
              onClick={handleFindMatch}
              className="btn btn-primary flex items-center space-x-2"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
              <span>Find Match (0.1 ETH)</span>
            </button>
          </div>


        </div>


      </div>
    </>
  );
};

export default Home;
