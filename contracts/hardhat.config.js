import "@nomicfoundation/hardhat-toolbox";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: "0.8.20",
  paths: {
    sources: "./src",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    xlayerTestnet: {
      url: "https://xlayertestrpc.okx.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  }
};