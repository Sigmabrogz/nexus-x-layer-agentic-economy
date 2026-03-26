const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NexusRouter", function () {
    let NexusRouter, router, owner, agent1, agent2;
    let MockUSDT, usdt;

    beforeEach(async function () {
        [owner, agent1, agent2] = await ethers.getSigners();
        
        NexusRouter = await ethers.getContractFactory("NexusRouter");
        router = await NexusRouter.deploy();

        MockUSDT = await ethers.getContractFactory("MockUSDT");
        usdt = await MockUSDT.deploy();

        // Mint USDT to agent1
        await usdt.mint(agent1.address, ethers.parseEther("1000"));
    });

    it("Should register an agent", async function () {
        await expect(router.connect(agent1).registerAgent())
            .to.emit(router, "AgentRegistered")
            .withArgs(agent1.address);
        
        expect(await router.registeredAgents(agent1.address)).to.be.true;
    });

    it("Should route native payment correctly", async function () {
        await router.connect(agent1).registerAgent();
        await router.connect(agent2).registerAgent();

        const depositAmount = ethers.parseEther("1.0");
        await router.connect(agent1).deposit({ value: depositAmount });

        expect(await router.agentBalances(agent1.address)).to.equal(depositAmount);

        const paymentAmount = ethers.parseEther("0.1");
        await expect(router.connect(agent1).payForInference(agent2.address, paymentAmount, "/v1/chat/completions"))
            .to.emit(router, "PaymentRouted")
            .withArgs(agent1.address, agent2.address, paymentAmount, "/v1/chat/completions");

        expect(await router.agentBalances(agent1.address)).to.equal(ethers.parseEther("0.9"));
        expect(await router.agentBalances(agent2.address)).to.equal(paymentAmount);
    });

    it("Should route ERC20 payment correctly", async function () {
        await router.connect(agent1).registerAgent();
        await router.connect(agent2).registerAgent();

        const depositAmount = ethers.parseEther("100.0");
        const tokenAddress = await usdt.getAddress();

        // Approve and deposit ERC20
        await usdt.connect(agent1).approve(await router.getAddress(), depositAmount);
        await router.connect(agent1).depositERC20(tokenAddress, depositAmount);

        expect(await router.erc20Balances(agent1.address, tokenAddress)).to.equal(depositAmount);

        // Pay for inference with ERC20
        const paymentAmount = ethers.parseEther("10.0");
        await expect(router.connect(agent1).payForInferenceERC20(agent2.address, tokenAddress, paymentAmount, "/v1/generate"))
            .to.emit(router, "ERC20PaymentRouted")
            .withArgs(agent1.address, agent2.address, tokenAddress, paymentAmount, "/v1/generate");

        expect(await router.erc20Balances(agent1.address, tokenAddress)).to.equal(ethers.parseEther("90.0"));
        expect(await router.erc20Balances(agent2.address, tokenAddress)).to.equal(paymentAmount);
    });
});
