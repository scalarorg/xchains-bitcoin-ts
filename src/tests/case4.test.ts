import { describe } from "bun:test";
import { ensureExists, feeRate, getTxHex, rbf } from "./utils";

import * as vault from "../index";
import { globalParams } from "../params";
import { psbt } from "../utils";
import { Psbt } from "bitcoinjs-lib";

async function burning(txHex: string) {
  try {
    const unStaker = new vault.UnStaker(
      globalParams.bondHolderAddress,
      txHex,
      globalParams.covenantPublicKeys,
      Number(globalParams.covenantQuorum)
    );

    //////////////////////////// Burning ////////////////////////////
    const { psbt: unsignedPsbt } = await unStaker.getUnsignedBurningPsbt(
      globalParams.bondHolderAddress,
      feeRate,
      rbf
    );
    // simulate staker sign the psbt
    // const stakerSignedPsbt = await psbt.signInputs(
    //   globalParams.bondHolderPrivKey!,
    //   globalParams.network,
    //   unsignedPsbt.toBase64(),
    //   false
    // );

    const stakerSignedPsbt = Psbt.fromBase64("cHNidP8BAFICAAAAAX6WwhSPsG0P3RAx5xkdyDWJlkYnN8Bfj0I1+5RamcYDAAAAAAD9////Adi9AAAAAAAAFgAUN5/Vi2cSjSWviTHiiHPNBhTOxDUAAAAAAAEBK4A4AQAAAAAAIlEgg8ldB/Oq2r58Txahcvukuw/cv/fFmrQQkgSY4uUBdr1BFP3Uoq41F+2m2tGmjm9ZyeelRV9bSx80dYaA0FKPNhPcF5d5DZaJDtibdN+87atu1GbbBvxj5kgBue9X4xx1rS5AwjqZRntI2P0WpqT5J+HVV+Fo6hBZ6Gv8MMHQyqfNSiQB+Zc8CLY62HW96ex3jtZX9Zicb9Kytd3QEloUVjgATGIVwVCSm3TBoElUt4tLYDXpel4HiloPKOyW1Ue/7prOgDrAPu8mVK0CpF3NA1w0ywWJmEbtIwnBNVFh4KTgYZ9lA8z1x6NlDe6V7Dej0LxpwcCSXOrYRIpOnuhwZQKLoZQkPUUg/dSirjUX7aba0aaOb1nJ56VFX1tLHzR1hoDQUo82E9ytILmYDQKMuOD7t4mD+hfxHzMVJrxwgNWAa3am3/F2mshmrMAAAA==")

    // the service dApp will sign the psbt, finalize it and send to bitcoin network
    // simulate service sign the psbt
    const serviceSignedPsbt = await psbt.signInputs(
      globalParams.protocolPrivKey!,
      globalParams.network,
      stakerSignedPsbt.toBase64(),
      true
    );

    console.log({
      stakerSignedPsbt: stakerSignedPsbt.toBase64(),
      serviceSignedPsbt: serviceSignedPsbt.toBase64(),
    });

    for (let i = 0; i < serviceSignedPsbt.data.inputs.length; i++) {
      const input = serviceSignedPsbt.data.inputs[i];
      console.log("NonWitnessUtxo: ", input.nonWitnessUtxo);
      console.log("WitnessUtxo: ", input.witnessUtxo);
      console.log("PartialSigs: ", input.partialSig);
      console.log("SighashType: ", input.sighashType);
      console.log("RedeemScript: ", input.redeemScript);
      console.log("WitnessScript: ", input.witnessScript);
      console.log("Bip32Derivation: ", input.bip32Derivation);
      console.log("FinalScriptSig: ", input.finalScriptSig);
      console.log("FinalScriptWitness: ", input.finalScriptWitness);
      console.log("TaprootKeySpenSig: ", input.tapKeySig);
      console.log("TaprootScriptSpendSig: ", input.tapScriptSig);
      console.log("TaprootLeafScript: ", input.tapLeafScript);
      console.log("TaprootBip32Derivation: ", input.tapBip32Derivation);
      console.log("TaprootInternalKey: ", input.tapInternalKey);
      console.log("TaprootMerkleRoot: ", input.tapMerkleRoot);
      console.log("Unknowns: ", input.unknownKeyVals);
    }

    const hexTxfromPsbt = serviceSignedPsbt.extractTransaction().toHex();
    console.log({ hexTxfromPsbt });

    return "txHash";

    // const txid = btcClient.sendrawtransaction(hexTxfromPsbt);

    // return txid;
  } catch (error) {
    console.log({ error });
  }
}

// 0.95682505 tBTC
const txid = "03c6995a94fb35428f5fc0372746968935c81d19e73110dd0f6db08f14c2967e";

describe("test burn tx with user and protocol", async () => {
  await ensureExists(txid);
  const hexTx = await getTxHex(txid);
  const burntTxId = await burning(hexTx);
});

// 020000000001015ad096e8fbceb648fd1278877a57298e5441c91bde19b523b87eaf0a94557c090000000000fdffffff01722600000000000016001450dceca158a9c872eb405d52293d351110572c9e044070b70f7005337a6702be9cc4a361502b5343409efcfc41ea2255eeac5341ab87dabbacd86e19d79f03e871a6dd79aa6bf967c1c56e0f36c897c88da52387d5cf40f3d657e1fb6972b8992df96055d27296fe41a185d34486b77ae6b3fcd87cda31855b7aac430b153dbdb43037911fccf6f010de3b188341dc5aa6aa5e11b2debe44202ae31ea8709aeda8194ba3e2f7e7e95e680e8b65135c8983c0a298d17bc5350aad20cf5dff57a173c5ac8323c4baca3fff0728eb716f39f0e5a60312320cd2935b0cac61c150929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0788050e79d530637b2bf963ec79e739ea478978b77b362649439e20045cdcb566ee53347bcebe6c4c52f0b194b8ac3a58febe0d1ac65227c7b4b1420ee4911cc00000000"
//
