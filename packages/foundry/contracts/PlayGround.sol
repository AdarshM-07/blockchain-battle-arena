//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PlayGround {
    address public owner;
    uint8 public gameCount = 5;
    uint256 public moveSelectionStartTime;
    uint256 public constant moveSelectionDuration = 30;
    uint256 public constant waitDuration = 10;
    enum Gamestate {
        Active,
        Over
    }
    Gamestate public gameState;

    event RoundCalculated(
        uint8 roundNumber,
        uint256 player1Health,
        uint256 player2Health,
        uint256 nextRoundStartTime
    );

    modifier activeGame() {
        require(gameState == Gamestate.Active, "Game is Ended");
        _;
    }
    uint8 P1initstate = 0;
    uint8 P2initstate = 0;
    struct Player {
        address playerAddress;
        string name;
        uint256 health;
        uint8 basicAttackCount;
        uint8 mediumAttackCount;
        uint8 specialAttackCount;
    }

    Player public player1;
    Player public player2;

    struct Moves {
        uint8 move1;
        uint8 move2;
        uint8 move3;
        uint8 move4;
        uint8 move5;
        uint8 move6;
    }

    Moves public P1moves;
    Moves public P2moves;

    constructor(
        address _owner,
        address _player1,
        string memory _name1,
        address _player2,
        string memory _name2
    ) payable {
        owner = _owner;
        moveSelectionStartTime = block.timestamp + waitDuration;
        player1 = Player(_player1, _name1, 10, 3, 2, 1);
        player2 = Player(_player2, _name2, 10, 3, 2, 1);
        gameState = Gamestate.Active;
    }

    bool public player1Moved = false;
    bool public player2Moved = false;

    function PerformMoves(
        uint8 _move1,
        uint8 _move2,
        uint8 _move3,
        uint8 _move4,
        uint8 _move5
    ) public activeGame {
        require(
            msg.sender == player1.playerAddress ||
                msg.sender == player2.playerAddress,
            "Only registered players can perform moves"
        );
        require(
            block.timestamp <= moveSelectionStartTime + moveSelectionDuration,
            "Move selection period has ended"
        );
        require(
            block.timestamp > moveSelectionStartTime,
            "Game has not started yet"
        );

        // Auto-convert attacks to stay if exhausted within the 5 moves
        Player memory currentPlayer = msg.sender == player1.playerAddress
            ? player1
            : player2;
        uint8[5] memory moves = [_move1, _move2, _move3, _move4, _move5];
        uint8 basicRemaining = currentPlayer.basicAttackCount;
        uint8 mediumRemaining = currentPlayer.mediumAttackCount;
        uint8 specialRemaining = currentPlayer.specialAttackCount;

        for (uint i = 0; i < 5; i++) {
            if (moves[i] == 3) {
                if (basicRemaining > 0) {
                    basicRemaining--;
                } else {
                    moves[i] = 0; // Convert to stay
                }
            } else if (moves[i] == 4) {
                if (mediumRemaining > 0) {
                    mediumRemaining--;
                } else {
                    moves[i] = 0; // Convert to stay
                }
            } else if (moves[i] == 5) {
                if (specialRemaining > 0) {
                    specialRemaining--;
                } else {
                    moves[i] = 0; // Convert to stay
                }
            }
        }

        _move1 = moves[0];
        _move2 = moves[1];
        _move3 = moves[2];
        _move4 = moves[3];
        _move5 = moves[4];

        if (msg.sender == player1.playerAddress) {
            P1moves = Moves(_move1, _move2, _move3, _move4, _move5, 0);
            player1.basicAttackCount = basicRemaining;
            player1.mediumAttackCount = mediumRemaining;
            player1.specialAttackCount = specialRemaining;
            player1Moved = true;
        } else {
            P2moves = Moves(_move1, _move2, _move3, _move4, _move5, 0);
            player2.basicAttackCount = basicRemaining;
            player2.mediumAttackCount = mediumRemaining;
            player2.specialAttackCount = specialRemaining;
            player2Moved = true;
        }
        
    }

    // stay 0 for no move, 1 for up , 2 for down , 3 basic attack, 4 medium attack , 5 special attack
    function getMoveByIndex(
        Moves memory moves,
        uint index
    ) internal pure returns (uint8) {
        if (index == 0) return moves.move1;
        if (index == 1) return moves.move2;
        if (index == 2) return moves.move3;
        if (index == 3) return moves.move4;
        if (index == 4) return moves.move5;
        if (index == 5) return moves.move6;
        return 0;
    }

    function calculateResult() public activeGame {
        require(
            block.timestamp >= moveSelectionStartTime + moveSelectionDuration ||
                (player1Moved && player2Moved),
            "Result calculation not allowed yet"
        );
        gameCount--;
        uint8[] memory P1states = new uint8[](6);
        uint8[] memory P2states = new uint8[](6);

        for (uint i = 0; i < 6; i++) {
            uint8 p1Move = getMoveByIndex(P1moves, i);
            uint8 p2Move = getMoveByIndex(P2moves, i);
            if (p1Move == 0) {
                P1states[i] = P1initstate;
            } else if (p1Move == 1) {
                P1states[i] = 1;
            } else if (p1Move == 2) {
                P1states[i] = 0;
            }
            if (p2Move == 0) {
                P2states[i] = P2initstate;
            } else if (p2Move == 1) {
                P2states[i] = 1;
            } else if (p2Move == 2) {
                P2states[i] = 0;
            }
            // Simple logic: higher move value wins
            P1initstate = P1states[i];
            P2initstate = P2states[i];
        }
        uint8 p1Damage = 0;
        uint8 p2Damage = 0;
        for (uint i = 0; i < 5; i++) {
            uint8 p1Move = getMoveByIndex(P1moves, i);
            uint8 p2Move = getMoveByIndex(P2moves, i);

            if (p1Move >= 3 && P1states[i] == P2states[i + 1]) {
                int8 damage = int8(p1Move) - 2;
                if (
                    getMoveByIndex(P2moves, i) >= 3 &&
                    P1states[i] == P2states[i]
                ) {
                    damage = damage - int8(p2Move - 2);
                }

                if (getMoveByIndex(P2moves, i + 1) >= 3) {
                    damage = damage - int8(getMoveByIndex(P2moves, i + 1) - 2);
                }
                p2Damage += damage > 0 ? uint8(damage) : 0;
            }
            if (p2Move >= 3 && P2states[i] == P1states[i + 1]) {
                int8 damage = int8(p2Move) - 2;
                if (
                    getMoveByIndex(P1moves, i) >= 3 &&
                    P2states[i] == P1states[i]
                ) {
                    damage = damage - int8(p1Move - 2);
                }

                if (getMoveByIndex(P1moves, i + 1) >= 3) {
                    damage = damage - int8(getMoveByIndex(P1moves, i + 1) - 2);
                }
                p1Damage += damage > 0 ? uint8(damage) : 0;
            }
        }

        if (p1Damage >= player1.health) {
            player1.health = 0;
        } else {
            player1.health -= p1Damage;
        }
        if (p2Damage >= player2.health) {
            player2.health = 0;
        } else {
            player2.health -= p2Damage;
        }

        if (player1.health == 0 || player2.health == 0 || gameCount == 0) {
            gameOver();
            gameState = Gamestate.Over;
            emit RoundCalculated(gameCount, player1.health, player2.health, 0);
        } else {
            moveSelectionStartTime = block.timestamp + waitDuration;
            P1moves = Moves(0, 0, 0, 0, 0, 0);
            P2moves = Moves(0, 0, 0, 0, 0, 0);
            emit RoundCalculated(
                gameCount,
                player1.health,
                player2.health,
                moveSelectionStartTime
            );
        }
    }

    function gameOver() internal {
        if (player1.health == player2.health) {
            (bool success, ) = payable(owner).call{value: 0.2 ether}("");
            require(success, "Transfer failed");
        } else if (player1.health < player2.health) {
            (bool success, ) = payable(player2.playerAddress).call{
                value: 0.15 ether
            }("");
            require(success, "Transfer failed");
            (bool success2, ) = payable(owner).call{value: 0.05 ether}("");
            require(success2, "Transfer failed");
        } else if (player2.health < player1.health) {
            (bool success, ) = payable(player1.playerAddress).call{
                value: 0.15 ether
            }("");
            require(success, "Transfer failed");
            (bool success2, ) = payable(owner).call{value: 0.05 ether}("");
            require(success2, "Transfer failed");
        }
    }
}
