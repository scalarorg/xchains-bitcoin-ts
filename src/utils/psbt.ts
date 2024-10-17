import * as bitcoin from "bitcoinjs-lib";
import crypto from "./crypto";

const signInputs = function (
  WIF: string,
  network: bitcoin.Network,
  psbtBase64: string,
  finalize: boolean = false
): bitcoin.Psbt {
  const keyPair = crypto.ECPair.fromWIF(WIF, network);
  const psbt = bitcoin.Psbt.fromBase64(psbtBase64);
  psbt.signAllInputs(keyPair);

  console.log("=============SIGN ALL INPUTS =====================");
  console.log(">>>>>>>>>> Before finalize:");
  for (let i = 0; i < psbt.data.inputs.length; i++) {
    const input = psbt.data.inputs[i];
    if (input.tapScriptSig) {
      for (let j = 0; j < input.tapScriptSig.length; j++) {
        console.log("tapSig[" + j + "]: ");
        console.log("pubkey: ", input.tapScriptSig[j].pubkey.toString("hex"));

        // 253, 212, 162, 174, 53, 23, 237, 166, 218, 209, 166, 142, 111, 89, 201, 231, 165, 69, 95, 91, 75, 31, 52, 117, 134, 128, 208, 82, 143, 54, 19, 220
        console.log(
          "leafHash: ",
          input.tapScriptSig[j].leafHash.toString("hex")
        );
        console.log(
          "signature: ",
          input.tapScriptSig[j].signature.toString("hex")
        );
        console.log("\n");
      }
    }
  }

  if (finalize) {
    psbt.finalizeAllInputs();
  }

  console.log(">>>>>>>>>> After:");

  for (let i = 0; i < psbt.data.inputs.length; i++) {
    const input = psbt.data.inputs[i];
    if (input.tapScriptSig) {
      for (let j = 0; j < input.tapScriptSig.length; j++) {
        console.log("-------");
        console.log("tapSig[" + j + "]: ");
        console.log("pubkey: ", input.tapScriptSig[j].pubkey.toString("hex"));
        console.log(
          "leafHash: ",
          input.tapScriptSig[j].leafHash.toString("hex")
        );
        console.log(
          "signature: ",
          input.tapScriptSig[j].signature.toString("hex")
        );
      }
    }
  }

  console.log("=============FINALIZE ALL INPUTS =====================");
  return psbt;
};
export const psbt = {
  signInputs,
};
