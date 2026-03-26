// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract NexusRouter {
    mapping(address => uint256) public agentBalances; // Native token
    mapping(address => mapping(address => uint256)) public erc20Balances; // ERC20 token balances (agent => token => amount)
    mapping(address => bool) public registeredAgents;

    address public treasury;
    uint256 public feeBasisPoints = 200; // 2% fee

    event AgentRegistered(address indexed agent);
    event PaymentRouted(address indexed from, address indexed to, uint256 amount, uint256 fee, string endpoint);
    event ERC20PaymentRouted(address indexed from, address indexed to, address indexed token, uint256 amount, uint256 fee, string endpoint);
    event FundsDeposited(address indexed agent, uint256 amount);
    event ERC20FundsDeposited(address indexed agent, address indexed token, uint256 amount);

    constructor() {
        treasury = msg.sender;
    }

    function registerAgent() external {
        require(!registeredAgents[msg.sender], "Already registered");
        registeredAgents[msg.sender] = true;
        emit AgentRegistered(msg.sender);
    }

    // Native token deposit
    function deposit() external payable {
        require(registeredAgents[msg.sender], "Must be registered");
        agentBalances[msg.sender] += msg.value;
        emit FundsDeposited(msg.sender, msg.value);
    }

    // ERC20 token deposit
    function depositERC20(address token, uint256 amount) external {
        require(registeredAgents[msg.sender], "Must be registered");
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        erc20Balances[msg.sender][token] += amount;
        emit ERC20FundsDeposited(msg.sender, token, amount);
    }

    // Native payment
    function payForInference(address to, uint256 amount, string calldata endpoint) external {
        require(registeredAgents[msg.sender], "Sender not registered");
        require(registeredAgents[to], "Receiver not registered");
        require(agentBalances[msg.sender] >= amount, "Insufficient balance");

        uint256 fee = (amount * feeBasisPoints) / 10000;
        uint256 netAmount = amount - fee;

        agentBalances[msg.sender] -= amount;
        agentBalances[to] += netAmount;
        agentBalances[treasury] += fee;

        emit PaymentRouted(msg.sender, to, amount, fee, endpoint);
    }

    // ERC20 payment
    function payForInferenceERC20(address to, address token, uint256 amount, string calldata endpoint) external {
        require(registeredAgents[msg.sender], "Sender not registered");
        require(registeredAgents[to], "Receiver not registered");
        require(erc20Balances[msg.sender][token] >= amount, "Insufficient balance");

        uint256 fee = (amount * feeBasisPoints) / 10000;
        uint256 netAmount = amount - fee;

        erc20Balances[msg.sender][token] -= amount;
        erc20Balances[to][token] += netAmount;
        erc20Balances[treasury][token] += fee;

        emit ERC20PaymentRouted(msg.sender, to, token, amount, fee, endpoint);
    }
}