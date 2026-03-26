const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NexusRouter", function () {
  let router, owner, agent1, agent2;

  beforeEach(async function () {
    [owner, agent1, agent2] = await ethers.getSigners();
    const NexusRouterFactory = await ethers.getContractFactory("NexusRouter");
    router = await NexusRouterFactory.deploy();
    await router.waitForDeployment();
  });

  it("Should register an agent", async function () {
    await router.connect(agent1).registerAgent();
    expect(await router.registeredAgents(agent1.address)).to.be.true;
  });

  it("Should accept deposits", async function () {
    await router.connect(agent1).registerAgent();
    await router.connect(agent1).deposit({ value: ethers.parseEther("0.5") });
    expect(await router.agentBalances(agent1.address)).to.equal(ethers.parseEther("0.5"));
  });

  it("Should route payments for inference", async function () {
    await router.connect(agent1).registerAgent();
    await router.connect(agent2).registerAgent();

    await router.connect(agent1).deposit({ value: ethers.parseEther("1") });
    await router.connect(agent1).payForInference(agent2.address, ethers.parseEther("0.1"), "api.nexus.com/generate");

    expect(await router.agentBalances(agent1.address)).to.equal(ethers.parseEther("0.9"));
    expect(await router.agentBalances(agent2.address)).to.equal(ethers.parseEther("0.1"));
  });
});
