import { bitcoin } from "@unisat/wallet-sdk/lib/bitcoin-core";
import ECPairFactory from "ecpair";
import * as ecc from "tiny-secp256k1";

export const ECPair = ECPairFactory(ecc);

export const generatePrivateKey = function (network?: bitcoin.Network): string {
    const keyPair = ECPair.makeRandom({network});
    return keyPair.toWIF();
}
export const extractPublicKeyFromWIF = function (WIF: string, network?: bitcoin.Network): string {
    const keyPair = ECPair.fromWIF(WIF, network);
    return keyPair.publicKey.toString("hex");
}

const crypto = {
    ECPair,
    generatePrivateKey,
    extractPublicKeyFromWIF
}
export default crypto;