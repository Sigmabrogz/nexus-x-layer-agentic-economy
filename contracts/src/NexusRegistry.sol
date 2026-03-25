// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract NexusRegistry {
    struct Intent {
        address user;
        string action;
        uint256 amount;
        bool executed;
    }

    mapping(uint256 => Intent) public intents;
    uint256 public intentCount;

    event IntentCreated(uint256 indexed id, address indexed user, string action, uint256 amount);
    event IntentExecuted(uint256 indexed id, address indexed executor);

    function createIntent(string memory action, uint256 amount) external {
        intents[intentCount] = Intent(msg.sender, action, amount, false);
        emit IntentCreated(intentCount, msg.sender, action, amount);
        intentCount++;
    }

    function executeIntent(uint256 id) external {
        require(id < intentCount, "Intent does not exist");
        require(!intents[id].executed, "Intent already executed");

        intents[id].executed = true;
        emit IntentExecuted(id, msg.sender);
    }
}
