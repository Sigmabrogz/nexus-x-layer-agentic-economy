// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {NexusRouter} from "../src/NexusRouter.sol";

contract NexusRouterTest is Test {
    NexusRouter public router;
    address agent1 = address(0x1);
    address agent2 = address(0x2);

    function setUp() public {
        router = new NexusRouter();
    }

    function test_RegisterAgent() public {
        vm.prank(agent1);
        router.registerAgent();
        assertTrue(router.registeredAgents(agent1));
    }

    function test_Deposit() public {
        vm.prank(agent1);
        router.registerAgent();

        vm.deal(agent1, 1 ether);
        vm.prank(agent1);
        router.deposit{value: 0.5 ether}();

        assertEq(router.agentBalances(agent1), 0.5 ether);
    }

    function test_PayForInference() public {
        vm.prank(agent1);
        router.registerAgent();
        
        vm.prank(agent2);
        router.registerAgent();

        vm.deal(agent1, 1 ether);
        vm.prank(agent1);
        router.deposit{value: 1 ether}();

        vm.prank(agent1);
        router.payForInference(agent2, 0.1 ether, "api.nexus.com/generate");

        assertEq(router.agentBalances(agent1), 0.9 ether);
        assertEq(router.agentBalances(agent2), 0.1 ether);
    }
}
