import { ethers } from "ethers";
const MNEMONIC: string = "test test test test test test test test test test test junk";
export function getDefaultEthAddress(): string {
    const mnemonic = ethers.Mnemonic.fromPhrase(MNEMONIC);
    const wallet = ethers.HDNodeWallet.fromMnemonic(mnemonic, "m/44'/60'/0'/0/0");
    return wallet.address;
}