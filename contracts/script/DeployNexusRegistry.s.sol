// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {NexusRegistry} from "../src/NexusRegistry.sol";

contract DeployNexusRegistry is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        NexusRegistry registry = new NexusRegistry();
        console.log("NexusRegistry deployed to:", address(registry));

        vm.stopBroadcast();
    }
}
