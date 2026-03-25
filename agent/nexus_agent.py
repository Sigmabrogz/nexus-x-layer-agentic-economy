import os
import time
import logging
from web3 import Web3
from eth_account import Account
import json
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
X_LAYER_RPC = "https://testnetrpc.xlayer.tech"
w3 = Web3(Web3.HTTPProvider(X_LAYER_RPC))

PRIVATE_KEY = os.getenv("BURNER_WALLET_PK")
if PRIVATE_KEY:
    agent_account = Account.from_key(PRIVATE_KEY)
else:
    agent_account = None

INTENT_MANAGER_ADDRESS = os.getenv("INTENT_MANAGER_ADDRESS", "0x0000000000000000000000000000000000000000")

INTENT_MANAGER_ABI = json.loads("""
[
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "tokenIn",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "tokenOut",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountIn",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "minAmountOut",
        "type": "uint256"
      }
    ],
    "name": "IntentCreated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amountOut",
        "type": "uint256"
      }
    ],
    "name": "fulfillIntent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]
""")

def main():
    if not w3.is_connected():
        logging.error("Failed to connect to X Layer RPC.")
        return
    logging.info(f"Nexus Agent Online. Connected to {X_LAYER_RPC}")
    if agent_account:
        logging.info(f"Agent Wallet Address: {agent_account.address}")
    
    contract = w3.eth.contract(address=Web3.to_checksum_address(INTENT_MANAGER_ADDRESS), abi=INTENT_MANAGER_ABI)
    
    logging.info("Listening for IntentCreated events...")
    
    # Simple poll loop for the hackathon
    latest_block = w3.eth.block_number
    while True:
        try:
            current_block = w3.eth.block_number
            if current_block > latest_block:
                events = contract.events.IntentCreated.get_logs(fromBlock=latest_block + 1, toBlock=current_block)
                for event in events:
                    args = event['args']
                    intent_id = args['id']
                    logging.info(f"Detected Intent #{intent_id} from {args['user']}! Fulfilling...")
                    
                    if agent_account:
                        # Dummy fulfill logic for hackathon POC
                        tx = contract.functions.fulfillIntent(intent_id, args['minAmountOut']).build_transaction({
                            'from': agent_account.address,
                            'nonce': w3.eth.get_transaction_count(agent_account.address),
                            'gas': 300000,
                            'gasPrice': w3.eth.gas_price
                        })
                        signed_tx = w3.eth.account.sign_transaction(tx, private_key=PRIVATE_KEY)
                        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
                        logging.info(f"Fulfillment Transaction Sent: {tx_hash.hex()}")
                latest_block = current_block
            time.sleep(5)
        except Exception as e:
            logging.error(f"Error polling events: {e}")
            time.sleep(5)

if __name__ == "__main__":
    main()