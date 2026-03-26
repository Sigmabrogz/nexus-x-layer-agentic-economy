import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const address = process.env.X_LAYER_TESTNET_ADDRESS || process.env.BURNER_1_ADDRESS;

async function huntThirdwebFaucet() {
  console.log(`[Faucet Hunter] Attempting to claim from Thirdweb API for address: ${address}...`);
  try {
    // Attempting direct API call to a known faucet endpoint (simulated/mocked if actual requires auth)
    const response = await axios.post('https://faucet.thirdweb.com/api/claim', {
      chainId: 195, // X Layer Testnet
      toAddress: address
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.status === 200 && response.data.success) {
      console.log(`[Faucet Hunter] Successfully claimed testnet funds! Tx: ${response.data.txHash}`);
    } else {
      console.log(`[Faucet Hunter] Failed to claim: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.error(`[Faucet Hunter] Error interacting with Thirdweb faucet API:`, error.message);
    console.log(`[Workaround] Captcha or Auth required. Reverting to local Hardhat node or waiting for manual funding.`);
  }
}

huntThirdwebFaucet();
