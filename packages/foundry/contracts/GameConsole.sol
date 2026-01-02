//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {PlayGround} from "./PlayGround.sol";

contract GameConsole {
    address public owner;
    address public waitingPlayer;
    string public playerName;

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
        require(msg.value == 0.1 ether, "Entry fee is 0.1 ether");
        if (waitingPlayer == address(0)) {
            waitingPlayer = msg.sender;
            playerName = _name;
        } else {
            PlayGround newGame = new PlayGround{value: 0.1 ether + msg.value}(
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
        (bool success, ) = payable(msg.sender).call{value: 0.1 ether}("");
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
