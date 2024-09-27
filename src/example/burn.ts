import { ethers } from "ethers";

const BURN_CONTRACT_ADDRESS = "0xca168aD77763E5511408832C4eA1eA142448e356";
const SBTC_CONTRACT_ADDRESS = "0x336A29050AD9abC4Bb375ea9591453cC7e3f6287";
const BURN_AMOUNT = ethers.parseUnits("0.00000000000001", 18);
const PRIV_KEY =
  "0xd0b64e67b8c82d25d4bb8f835f92bfab9e394bb34883362006b790235f1aa05b";

// Connect to your Ethereum node
const provider = new ethers.JsonRpcProvider("http://localhost:8545");

// Define your wallet or signer
const signer = new ethers.Wallet(PRIV_KEY, provider);

// Define the ABI and contract address for sBTC
const sBTCABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
];

// Initialize the sBTC contract
const sBTC = new ethers.Contract(SBTC_CONTRACT_ADDRESS, sBTCABI, signer);

async function burn() {
  // Call the approve function
  try {
    const txApprove = await sBTC.approve(BURN_CONTRACT_ADDRESS, BURN_AMOUNT);
    console.log("Approval transaction hash:", txApprove.hash);

    // Wait for the transaction to be mined
    const receipt = await txApprove.wait();
    console.log({ receipt });
    console.log("Transaction confirmed in block:", receipt.blockNumber);
  } catch (error) {
    console.error("Error during approval:", error);
  }
}

burn();
