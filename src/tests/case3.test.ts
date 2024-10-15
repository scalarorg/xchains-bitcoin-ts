import { describe, it } from "bun:test";
import { UnStaker } from "..";
import { btcClient } from "../client";
import { globalParams } from "../params";
import { witnessStackToScriptWitness } from "../utils/bitcoin";
import {
  ensureExists,
  feeRate,
  getTxHex,
  protocolKeyPair,
  rbf,
  sortedCovenants,
  stakerKeyPair,
} from "./utils";
import { PsbtInput } from "bip174/src/lib/interfaces";

async function slashingOrLostKey(txHex: string, option = "test") {

  const unStaker = new UnStaker(
    globalParams.bondHolderAddress,
    txHex,
    globalParams.covenantPublicKeys,
    Number(globalParams.covenantQuorum)
  );

  //////////////////////////// Slashing ////////////////////////////
  const { psbt: slashingOrLostKeyPsbt, SolLeaf } =
    await unStaker.getUnsignedSlashingOrLostKeyPsbt(
      globalParams.bondHolderAddress,
      feeRate,
      rbf
    );

  const slashingFinalizer = (_inputIndex: number, input: PsbtInput) => {
    const empty_vector = Buffer.from([]);
    // const scriptSolution = [
    //   input.tapScriptSig![6].signature,
    //   // input.tapScriptSig![5].signature,
    //   empty_vector,
    //   input.tapScriptSig![4].signature,
    //   input.tapScriptSig![3].signature,
    //   // input.tapScriptSig![2].signature,
    //   empty_vector,
    //   input.tapScriptSig![1].signature,
    //   input.tapScriptSig![0].signature,
    // ];

    const scriptSolution = [
      input.tapScriptSig![5].signature,
      empty_vector,
      input.tapScriptSig![3].signature,
      input.tapScriptSig![2].signature,
      empty_vector,
      input.tapScriptSig![0].signature,
    ];

    const witness = scriptSolution
      .concat(SolLeaf.script)
      .concat(SolLeaf.controlBlock);
    return {
      finalScriptWitness: witnessStackToScriptWitness(witness),
    };
  };

  //   slashingOrLostKeyPsbt.signInput(0, stakerKeyPair);
  slashingOrLostKeyPsbt.signInput(0, protocolKeyPair);
  slashingOrLostKeyPsbt.signInput(0, sortedCovenants[0]);
  slashingOrLostKeyPsbt.signInput(0, sortedCovenants[1]);
  slashingOrLostKeyPsbt.signInput(0, sortedCovenants[2]);
  slashingOrLostKeyPsbt.signInput(0, sortedCovenants[3]);
  slashingOrLostKeyPsbt.signInput(0, sortedCovenants[4]);
  slashingOrLostKeyPsbt.finalizeInput(0, slashingFinalizer);
  const slashingTx = slashingOrLostKeyPsbt.extractTransaction(true);

  console.log({txHex: slashingTx.toHex()});

  if (option === "send") {
    return btcClient.sendrawtransaction(slashingTx.toHex());
  }
  return btcClient.testmempoolaccept(slashingTx.toHex());
}

const txid = "7fe37ceaee5e47c2e34abfc29835c22bab1b1573cb736008d56110b28c23b4f2";

describe("test burn tx with protocol and covenants", async () => {
  console.log({ globalParams });

  //   it("send", async () => {
  //     await ensureExists(txid);
  //     const hexTx = await getTxHex(txid);
  //     const burntTxId = await slashingOrLostKey(hexTx, "test");
  //     console.log({ burntTxId });
  //   });

  it("mempool", async () => {
    const hexTx =
      "0200000000010387f68462d17882d651ad3bcb9dda21665121044d235bf02595e005e2a87214230000000000fdffffff607dcadbebd0ac0a470db6e3f2aee8e339f92b8d3f556dbe928d32c87cb8dda80000000000fdffffff69a6dc3162a1906705e46c6174ff5e0e79dae11a59764aec7438c614629a81950100000000fdffffff048038010000000000225120104dcd370ccd5b9147437966a0804e7dcf2915d38df6d3f82c0fb09bec6a02700000000000000000476a4501020304002ae31ea8709aeda8194ba3e2f7e7e95e680e8b65135c8983c0a298d17bc5350acf5dff57a173c5ac8323c4baca3fff0728eb716f39f0e5a60312320cd2935b0c00000000000000003a6a380000000000000539130c4810d57140e1e62967cbf742caeae91b6ece1f98c06d8734d5a9ff0b53e3294626e62e4d232c0000000000013880b3dd18050000000016001450dceca158a9c872eb405d52293d351110572c9e02483045022100e9ade16acd5b533a8a75b8a56826b1e4c1c085663f1987d548ea35f857f8fb6102207cb9b49220202a9fd437f499fa61054f85ff279eed635df09803f94f69833c190121022ae31ea8709aeda8194ba3e2f7e7e95e680e8b65135c8983c0a298d17bc5350a0248304502210099da50306401969675a531489fa700ffd78aee9b84026198a116f430add4f86a022034de7ed7ba9f5fdaa709beab9da01b3a43c50958c275a8544034eff3edb15c2a0121022ae31ea8709aeda8194ba3e2f7e7e95e680e8b65135c8983c0a298d17bc5350a024830450221009548390fd1419d5b2061e62edf7f1255be42fb896f56ff53aa36bdacc2bb3a5302200354aa624ce00197814e00bd091c074bf2ac046040b5f4b3160783285567e22f0121022ae31ea8709aeda8194ba3e2f7e7e95e680e8b65135c8983c0a298d17bc5350a00000000";


    const burntTxId = await slashingOrLostKey(hexTx, "test");

    console.log({ burntTxId });
  });
});
