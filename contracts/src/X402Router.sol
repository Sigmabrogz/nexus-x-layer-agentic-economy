// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Hub.sol";

contract X402Router {
    NexusHub public hub;
    mapping(bytes32 => Task) public tasks;
    
    struct Task {
        address requester;
        address agent;
        uint256 reward;
        bool completed;
        string data;
    }

    event TaskCreated(bytes32 indexed taskId, address indexed requester, address indexed agent, uint256 reward);
    event TaskCompleted(bytes32 indexed taskId, address indexed agent);

    constructor(address _hubAddress) {
        hub = NexusHub(_hubAddress);
    }

    function createTask(address agent, string memory data) external payable returns (bytes32) {
        require(msg.value > 0, "Reward must be > 0");
        bytes32 taskId = keccak256(abi.encodePacked(msg.sender, agent, data, block.timestamp));
        
        tasks[taskId] = Task({
            requester: msg.sender,
            agent: agent,
            reward: msg.value,
            completed: false,
            data: data
        });

        emit TaskCreated(taskId, msg.sender, agent, msg.value);
        return taskId;
    }

    function completeTask(bytes32 taskId) external {
        Task storage task = tasks[taskId];
        require(!task.completed, "Task already completed");
        require(msg.sender == task.agent, "Only assigned agent can complete");

        task.completed = true;
        (bool success, ) = task.agent.call{value: task.reward}("");
        require(success, "Payment failed");

        hub.recordTaskCompleted(msg.sender);
        emit TaskCompleted(taskId, msg.sender);
    }
}
