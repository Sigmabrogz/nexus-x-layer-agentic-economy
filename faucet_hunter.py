import os
import requests
import json
import logging

logging.basicConfig(level=logging.INFO)

# Dummy test for faucet
def hunt_faucets(address):
    # Common faucet endpoints pattern
    endpoints = [
        "https://faucet.xlayer.tech/api/claim",
        "https://www.okx.com/api/v5/mkt/faucet/claim"
    ]
    
    for endpoint in endpoints:
        try:
            logging.info(f"Attempting to claim from {endpoint} for address {address}")
            res = requests.post(endpoint, json={"address": address}, timeout=5)
            if res.status_code == 200:
                logging.info(f"Success! {res.text}")
                return True
            else:
                logging.warning(f"Failed {endpoint}: {res.status_code} {res.text[:100]}")
        except Exception as e:
            logging.error(f"Error on {endpoint}: {e}")
            
    logging.error("All known faucet endpoints failed or required CAPTCHA. Will need to bridge or use alternative testnet funds.")
    return False

if __name__ == "__main__":
    from eth_account import Account
    import secrets
    
    # Load from env or generate for the test
    with open('/home/yatharth/sigma/hackathon-project/.env', 'r') as f:
        pk = f.read().split('=')[1].strip()
    
    acct = Account.from_key(pk)
    logging.info(f"Generated Wallet Address: {acct.address}")
    hunt_faucets(acct.address)
