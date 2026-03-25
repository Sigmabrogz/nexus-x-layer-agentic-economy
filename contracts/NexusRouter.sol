// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract NexusRouter {
    mapping(address => uint256) public agentBalances;
    mapping(address => bool) public registeredAgents;

    event AgentRegistered(address indexed agent);
    event PaymentRouted(address indexed from, address indexed to, uint256 amount, string endpoint);
    event FundsDeposited(address indexed agent, uint256 amount);

    function registerAgent() external {
        require(!registeredAgents[msg.sender], "Already registered");
        registeredAgents[msg.sender] = true;
        emit AgentRegistered(msg.sender);
    }

    function deposit() external payable {
        require(registeredAgents[msg.sender], "Must be registered");
        agentBalances[msg.sender] += msg.value;
        emit FundsDeposited(msg.sender, msg.value);
    }

    function payForInference(address to, uint256 amount, string calldata endpoint) external {
        require(registeredAgents[msg.sender], "Sender not registered");
        require(registeredAgents[to], "Receiver not registered");
        require(agentBalances[msg.sender] >= amount, "Insufficient balance");

        agentBalances[msg.sender] -= amount;
        agentBalances[to] += amount;

        emit PaymentRouted(msg.sender, to, amount, endpoint);
    }
}
