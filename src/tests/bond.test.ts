import { AddressTxsUtxo } from "@mempool/mempool.js/lib/interfaces/bitcoin/addresses";
import { describe } from "bun:test";
import { btcClient } from "../client";
import * as vault from "../index";
import { globalParams } from "../params";
import { UTXO } from "../types/utxo";
import { getAddressUtxos } from "../utils/bitcoin";
import { feeRate } from "./utils";
import { psbt } from "../utils";

export async function bond(amount: number): Promise<string> {
  const userAddress = globalParams.destUserAddress;
  const staker = new vault.Staker(
    globalParams.bondHolderAddress,
    globalParams.bondHolderPublicKey,
    globalParams.protocolPublicKey,
    globalParams.covenantPublicKeys,
    Number(globalParams.covenantQuorum),
    globalParams.tag,
    Number(globalParams.version),
    globalParams.destChainId || "1",
    userAddress,
    globalParams.destSmartContractAddress,
    amount
  );
  // --- Get UTXOs

  const regularUTXOs: UTXO[] = (
    await getAddressUtxos(globalParams.bondHolderAddress)
  ).map(({ txid, vout, status, value }: AddressTxsUtxo) => ({
    txid,
    vout,
    value,
    status: {
      block_hash: status.block_hash,
      block_height: status.block_height,
      block_time: status.block_time,
      confirmed: status.confirmed,
    },
  }));

  //   const { fees } = mempoolClient;
  const rbf = true;
  const { psbt: unsignedVaultPsbt } = await staker.getUnsignedVaultPsbt(
    regularUTXOs,
    amount,
    feeRate,
    rbf
  );

  const signedPsbt = psbt.signInputs(
    globalParams.bondHolderPrivKey,
    globalParams.network,
    unsignedVaultPsbt.toBase64(),
    true
  );
  const hexTxfromPsbt = signedPsbt.extractTransaction().toHex();

  console.log("Sending Tx: ", hexTxfromPsbt);

  return await btcClient.sendrawtransaction(hexTxfromPsbt);
}

describe("test create new bond", async () => {
  const amount = Math.floor(Math.random() * 1e5);
  console.log({ amount });
  const txid = await bond(80000);
  console.log({ txid });
});
