// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

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
        require(amountIn > 0, "Amount must be greater than 0");
        
        // Transfer the tokens to escrow
        require(IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn), "Transfer failed");

        intents[nextIntentId] = Intent(msg.sender, tokenIn, tokenOut, amountIn, minAmountOut, false);
        emit IntentCreated(nextIntentId, msg.sender, tokenIn, tokenOut, amountIn, minAmountOut);
        nextIntentId++;
    }

    function fulfillIntent(uint256 id, uint256 amountOut) external {
        Intent storage intent = intents[id];
        require(!intent.isFulfilled, "Intent already fulfilled");
        require(amountOut >= intent.minAmountOut, "Insufficient output amount");

        intent.isFulfilled = true;
        
        // Agent transfers tokenOut to user
        require(IERC20(intent.tokenOut).transferFrom(msg.sender, intent.user, amountOut), "Agent transfer failed");

        // Contract transfers tokenIn to agent
        require(IERC20(intent.tokenIn).transfer(msg.sender, intent.amountIn), "Escrow release failed");

        emit IntentFulfilled(id, msg.sender, amountOut);
    }
}