import * as bitcoin from "bitcoinjs-lib";
import crypto from "./crypto";

const signInputs = function(
    WIF: string,
    network: bitcoin.Network,
    psbtBase64: string,
    finalize: boolean = false,
): bitcoin.Psbt {
    const keyPair = crypto.ECPair.fromWIF(WIF, network);
    const psbt = bitcoin.Psbt.fromBase64(psbtBase64);
    psbt.signAllInputs(keyPair);
    if (finalize) {
        psbt.finalizeAllInputs();
    }
    return psbt;
}
export const psbt = {
    signInputs
}