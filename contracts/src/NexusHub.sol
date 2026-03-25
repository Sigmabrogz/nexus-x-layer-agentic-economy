// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract NexusHub {
    struct Agent {
        address owner;
        string name;
        string capabilityURI;
        bool isActive;
    }

    mapping(address => Agent) public agents;
    address[] public agentList;

    event AgentRegistered(address indexed agentAddress, address indexed owner, string name);
    event AgentDeactivated(address indexed agentAddress);

    function registerAgent(address _agentAddress, string memory _name, string memory _capabilityURI) external {
        require(agents[_agentAddress].owner == address(0), "Agent already registered");
        
        agents[_agentAddress] = Agent({
            owner: msg.sender,
            name: _name,
            capabilityURI: _capabilityURI,
            isActive: true
        });
        
        agentList.push(_agentAddress);
        emit AgentRegistered(_agentAddress, msg.sender, _name);
    }

    function deactivateAgent(address _agentAddress) external {
        require(agents[_agentAddress].owner == msg.sender, "Only owner can deactivate");
        require(agents[_agentAddress].isActive, "Already inactive");
        
        agents[_agentAddress].isActive = false;
        emit AgentDeactivated(_agentAddress);
    }

    function getActiveAgents() external view returns (address[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < agentList.length; i++) {
            if (agents[agentList[i]].isActive) {
                count++;
            }
        }
        
        address[] memory active = new address[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < agentList.length; i++) {
            if (agents[agentList[i]].isActive) {
                active[index] = agentList[i];
                index++;
            }
        }
        
        return active;
    }
}
