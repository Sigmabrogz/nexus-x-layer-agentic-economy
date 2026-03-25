// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {NexusRegistry} from "../src/NexusRegistry.sol";

contract NexusRegistryTest is Test {
    NexusRegistry public registry;

    function setUp() public {
        registry = new NexusRegistry();
    }

    function test_CreateIntent() public {
        registry.createIntent("SWAP_ETH_USDC", 100);
        assertEq(registry.intentCount(), 1);
        (address user, string memory action, uint256 amount, bool executed) = registry.intents(0);
        assertEq(user, address(this));
        assertEq(action, "SWAP_ETH_USDC");
        assertEq(amount, 100);
        assertEq(executed, false);
    }

    function test_ExecuteIntent() public {
        registry.createIntent("SWAP_ETH_USDC", 100);
        registry.executeIntent(0);
        (,,, bool executed) = registry.intents(0);
        assertEq(executed, true);
    }
}
