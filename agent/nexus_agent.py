import os
import time
import logging
from web3 import Web3

logging.basicConfig(level=logging.INFO)
X_LAYER_RPC = "https://testnetrpc.xlayer.tech"
w3 = Web3(Web3.HTTPProvider(X_LAYER_RPC))

def main():
    if not w3.is_connected():
        logging.error("Failed to connect to X Layer RPC.")
        return
    logging.info("Nexus Agent Online. Listening for IntentCreated events...")
    time.sleep(1)

if __name__ == "__main__":
    main()
