import { ethers } from "ethers";
import fs from "fs";
// const MNEMONIC: string = "test test test test test test test test test test test junk";
const MNEMONIC: string = "pride erupt add surge eagle once nerve guide good phrase argue alert budget welcome humor bullet slim safe mom review run dry decrease fox";
const RUNTIME_CHAINS_PATH = "/app/chains"
export interface Addresses {
  mintContract: string;
}

export function getDefaultEthAddress(): string {
    const mnemonic = ethers.Mnemonic.fromPhrase(MNEMONIC);
    const wallet = ethers.HDNodeWallet.fromMnemonic(mnemonic, "m/44'/60'/0'/0/0");
    return wallet.address;
}

export function getDestProtocolAddress(destNetwork: string): string {
    const address = fs.readFileSync(`${RUNTIME_CHAINS_PATH}/${destNetwork}/addresses.json`, 'utf8');
    const addressesJson = JSON.parse(address) as Addresses;
    return addressesJson.mintContract;
}