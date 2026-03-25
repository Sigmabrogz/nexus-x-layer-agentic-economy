import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log("Deploying NexusRouter...");
  const NexusRouter = await hre.ethers.getContractFactory("NexusRouter");
  const router = await NexusRouter.deploy();
  await router.waitForDeployment();

  const address = await router.getAddress();
  console.log("NexusRouter deployed to:", address);

  const configPath = path.join(__dirname, "../../deploy_config.json");
  fs.writeFileSync(configPath, JSON.stringify({ address }, null, 2));
  console.log("Saved config to", configPath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
