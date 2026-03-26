// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/NexusRouter.sol";
import "../src/MockUSDT.sol";

contract DeployLocal is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("ANVIL_PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        MockUSDT mockUSDT = new MockUSDT();
        NexusRouter router = new NexusRouter();

        console.log("MockUSDT deployed to:", address(mockUSDT));
        console.log("NexusRouter deployed to:", address(router));

        vm.stopBroadcast();
    }
}
