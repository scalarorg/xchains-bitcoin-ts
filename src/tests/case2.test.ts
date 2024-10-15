import { describe } from "bun:test";
import {
  covenant_1_keyPair,
  covenant_2_keyPair,
  covenant_3_keyPair,
  covenant_4_keyPair,
  covenant_5_keyPair,
  ensureExists,
  feeRate,
  getTxHex,
  rbf,
  stakerKeyPair,
} from "./utils";
import * as vault from "../index";
import { globalParams } from "../params";
import { ECPair } from "../utils";
import { btcClient } from "../client";

async function burnWithoutDApp(txHex: string): Promise<string> {
  const unStaker = new vault.UnStaker(
    globalParams.bondHolderAddress,
    txHex,
    globalParams.covenantPublicKeys,
    Number(globalParams.covenantQuorum)
  );
  // SETUP leaves
  //////////////////////////// Burning Without DApp ////////////////////////////
  const { psbt: burnWithoutDAppPsbt } =
    await unStaker.getUnsignedBurnWithoutDAppPsbt(
      globalParams.bondHolderAddress,
      feeRate,
      rbf
    );

  burnWithoutDAppPsbt.signInput(0, stakerKeyPair);
  burnWithoutDAppPsbt.signInput(0, covenant_1_keyPair);
  burnWithoutDAppPsbt.signInput(0, covenant_2_keyPair);
  burnWithoutDAppPsbt.signInput(0, covenant_3_keyPair);
  burnWithoutDAppPsbt.signInput(0, covenant_4_keyPair);
  burnWithoutDAppPsbt.signInput(0, covenant_5_keyPair);
  console.log(
    burnWithoutDAppPsbt.data.inputs[0].tapScriptSig?.map((x) =>
      x.signature.toString("hex")
    )
  );
  burnWithoutDAppPsbt.finalizeInput(0);
  const burnWithoutDAppTx = burnWithoutDAppPsbt.extractTransaction(true);
  // console.log(burnWithoutDAppTx.toHex());
  // console.log(fee);
  // console.log(burnWithoutDAppTx.virtualSize());

  return btcClient.sendrawtransaction(burnWithoutDAppTx.toHex());
}

// 0.95682505 tBTC
const txid = "076ce9828ea9dc6e9e1b8b609370a74c4c581b3805bfa8ba7308208ed50820e5";

describe("test burn tx with user and covenants", async () => {
  await ensureExists(txid);
  const hexTx = await getTxHex(txid);
  const burntTxId = await burnWithoutDApp(hexTx);
  console.log({ burntTxId });
});
