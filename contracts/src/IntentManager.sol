// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract IntentManager {
    struct Intent {
        address user;
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 minAmountOut;
        bool isFulfilled;
    }
    
    mapping(uint256 => Intent) public intents;
    uint256 public nextIntentId;

    event IntentCreated(uint256 indexed id, address indexed user, address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut);
    event IntentFulfilled(uint256 indexed id, address indexed agent, uint256 amountOut);

    function createIntent(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut) external {
        intents[nextIntentId] = Intent(msg.sender, tokenIn, tokenOut, amountIn, minAmountOut, false);
        emit IntentCreated(nextIntentId, msg.sender, tokenIn, tokenOut, amountIn, minAmountOut);
        nextIntentId++;
    }

    function fulfillIntent(uint256 id, uint256 amountOut) external {
        require(!intents[id].isFulfilled, "Intent already fulfilled");
        intents[id].isFulfilled = true;
        // Logic to transfer tokenOut from agent to user, and tokenIn to agent
        emit IntentFulfilled(id, msg.sender, amountOut);
    }
}
