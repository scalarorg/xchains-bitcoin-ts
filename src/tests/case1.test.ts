import { describe } from "bun:test";
import { ensureExists, feeRate, getTxHex, rbf } from "./utils";

import { btcClient } from "../client";
import * as vault from "../index";
import { globalParams } from "../params";
import { psbt } from "../utils";

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
    const stakerSignedPsbt = await psbt.signInputs(
      globalParams.bondHolderPrivKey!,
      globalParams.network,
      unsignedPsbt.toBase64(),
      false
    );
    // Step 2: this Psbt will be sent to bla bla ... then received by relayer of service dApp
    // the service dApp will sign the psbt, finalize it and send to bitcoin network
    // simulate service sign the psbt
    const serviceSignedPsbt = await psbt.signInputs(
      globalParams.protocolPrivKey!,
      globalParams.network,
      stakerSignedPsbt.toBase64(),
      true
    );
    const hexTxfromPsbt = serviceSignedPsbt.extractTransaction().toHex();
    const txid = btcClient.sendrawtransaction(hexTxfromPsbt);
    return txid;
  } catch (error) {
    console.log({ error });
  }
}

// 0.95682505 tBTC
const txid = "f0a4958d4a824b41d13489bcd94712272244c6400c4fd835c76b74b2893fdd5c";

describe("test burn tx with user and protocol", async () => {
  await ensureExists(txid);
  const hexTx = await getTxHex(txid);
  const burntTxId = await burning(hexTx);
  console.log({ burntTxId });
});
