// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract NexusHub {
    struct Agent {
        address owner;
        string metadataURI;
        bool isActive;
        uint256 totalTasksCompleted;
    }

    mapping(address => Agent) public agents;
    address[] public registeredAgents;

    event AgentRegistered(address indexed agentAddress, address indexed owner, string metadataURI);
    event AgentDeactivated(address indexed agentAddress);

    function registerAgent(address agentAddress, string memory metadataURI) external {
        require(agents[agentAddress].owner == address(0), "Agent already registered");
        agents[agentAddress] = Agent({
            owner: msg.sender,
            metadataURI: metadataURI,
            isActive: true,
            totalTasksCompleted: 0
        });
        registeredAgents.push(agentAddress);
        emit AgentRegistered(agentAddress, msg.sender, metadataURI);
    }

    function recordTaskCompleted(address agentAddress) external {
        require(agents[agentAddress].isActive, "Agent not active");
        // Simple trust-based completion for MVP
        agents[agentAddress].totalTasksCompleted += 1;
    }

    function getRegisteredAgentsCount() external view returns (uint256) {
        return registeredAgents.length;
    }
}
