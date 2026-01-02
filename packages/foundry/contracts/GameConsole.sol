//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {PlayGround} from "./PlayGround.sol";

// Chainlink Price Feed Interface
interface AggregatorV3Interface {
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}

contract GameConsole {
    address public owner;
    address public waitingPlayer;
    string public playerName;

    // Chainlink ETH/USD Price Feed (Sepolia testnet)
    // For mainnet, use: 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419
    // For Sepolia: 0x694AA1769357215DE4FAC081bf1f309aDC325306
    AggregatorV3Interface internal priceFeed;

    event MatchFound(
        address indexed player1,
        address indexed player2,
        address gameAddress
    );

    constructor(address _owner) {
        owner = _owner;
    }

    mapping(address => PlayGround) internal addToMatch;

    function findMatch(string memory _name) public payable {
        require(msg.value == 0.001 ether, "Entry fee is 0.001 ether");
        if (waitingPlayer == address(0)) {
            waitingPlayer = msg.sender;
            playerName = _name;
        } else {
            PlayGround newGame = new PlayGround{value: 0.001 ether + msg.value}(
                owner,
                waitingPlayer,
                playerName,
                msg.sender,
                _name
            );
            addToMatch[waitingPlayer] = newGame;
            addToMatch[msg.sender] = newGame;

            emit MatchFound(waitingPlayer, msg.sender, address(newGame));

            waitingPlayer = address(0);
            playerName = "";
        }
    }

    function cancelMatch() public {
        require(
            msg.sender == waitingPlayer,
            "Only the waiting player can cancel the match"
        );
        waitingPlayer = address(0);
        (bool success, ) = payable(msg.sender).call{value: 0.001 ether}("");
        require(success, "Transfer failed");
        playerName = "";
    }

    function getMatchAddress(address player) public view returns (address) {
        return address(addToMatch[player]);
    }

    function clearMatchAddress() public {
        delete addToMatch[msg.sender];
    }
}
