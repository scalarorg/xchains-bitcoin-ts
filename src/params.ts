import * as bitcoin from "bitcoinjs-lib";
import { networkInterfaces } from "os";
import { extractPublicKeyFromWIF } from "./utils";
export interface ConfigParams {
    networkName: string;
    network: bitcoin.Network;
    btcHost?: string;
    btcPort?: string;
    btcRpcUser?: string;
    btcRpcPassword?: string;
    walletName: string;
    mempoolUrl?: string;
    bondHolderAddress: string;
    bondHolderPrivKey?: string;
    bondHolderPublicKey?: string;
    protocolPublicKey?: string;
    covenantPublicKeys?: string[];
    covenantQuorum: number;
    // nodeUrl: string;
    // indexerUrl: string;
    // faucetUrl: string;
    // explorerUrl: string;
    // covenant: string;
    // covenantName: string;
    // covenantAddress: string;
    tag: string;
    version: number;
    destChainId?: string;
    destUserAddress?: string;
    destSmartContractAddress?: string;
}
let network = bitcoin.networks.regtest;
if (process.env.NETWORK === "testnet") {
    network = bitcoin.networks.testnet;
} else if (process.env.NETWORK === "mainnet") {
    network = bitcoin.networks.bitcoin;
} 
export const globalParams : ConfigParams = {
    networkName: process.env.NETWORK || 'regtest',
    network: network,
    btcHost: process.env.BITCOIN_HOST || 'localhost',
    btcPort: process.env.BITCOIN_PORT || '18332',
    btcRpcUser: process.env.BITCOIN_RPC_USER || 'user',
    btcRpcPassword: process.env.BITCOIN_RPC_PASSWORD || 'password',
    walletName: process.env.WALLET_NAME || 'legacy',
    mempoolUrl: process.env.MEMPOOL_URL || 'http://localhost:8999',
    bondHolderAddress: process.env.BOND_HOLDER_ADDRESS || '',
    bondHolderPrivKey: process.env.BOND_HOLDER_PRIVATE_KEY,
    bondHolderPublicKey: process.env.BOND_HOLDER_PRIVATE_KEY ? extractPublicKeyFromWIF(process.env.BOND_HOLDER_PRIVATE_KEY, network) : undefined,
    protocolPublicKey: process.env.PROTOCOL_PUBLIC_KEY,
    covenantPublicKeys: process.env.COVENANT_PUBLIC_KEYS?.split(','),
    covenantQuorum: parseInt(process.env.COVENANT_QUORUM || '1'),
    tag: process.env.TAG || '01020304',
    version: parseInt(process.env.VERSION || '1'),
    destChainId: process.env.DEST_CHAIN_ID || '',
    destUserAddress: process.env.DEST_USER_ADDRESS || '',
    destSmartContractAddress: process.env.DEST_SMART_CONTRACT_ADDRESS || '',
};