import { AddressTxsUtxo } from "@mempool/mempool.js/lib/interfaces/bitcoin/addresses";
import { btcClient, mempoolClient } from "../client";
import * as vault from "../index";
import { globalParams } from "../params";
import { UTXO } from "../types/utxo";
import { ECPair, psbt } from "../utils";
import { getAddressUtxos } from "../utils/bitcoin";

const maxRetries = 10;
const retryDelay = 5000;
const rbf = true;
const feeRate = 100;

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

export const ensureExists = async (txid: string) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const tx = await mempoolClient.transactions.getTx({ txid });
      if (tx) {
        return tx;
      } else throw new Error("Tx not found");
    } catch (error) {
      console.log("Tx not found, waiting for", retryDelay * (i + 1), "ms");
      if (i === maxRetries - 1) throw new Error("Max retries exceeded");
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
};

export const getTxHex = async (txid: string) => {
  const raw = await mempoolClient.transactions.getTxHex({ txid });
  if (raw) {
    return raw;
  } else throw new Error("Tx not found");
};

export async function burning(txHex: string) {
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

export async function burnWithoutDApp(txHex: string): Promise<string> {
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
  // convert to Tx hex

  const stakerKeyPair = ECPair.fromWIF(
    globalParams.bondHolderPrivKey!,
    globalParams.network
  );

  const covenant_1_keyPair = ECPair.fromWIF(
    globalParams.covenantPrivKeys[0],
    globalParams.network
  );
  const covenant_2_keyPair = ECPair.fromWIF(
    globalParams.covenantPrivKeys[1],
    globalParams.network
  );
  const covenant_3_keyPair = ECPair.fromWIF(
    globalParams.covenantPrivKeys[2],
    globalParams.network
  );
  const covenant_4_keyPair = ECPair.fromWIF(
    globalParams.covenantPrivKeys[3],
    globalParams.network
  );
  const covenant_5_keyPair = ECPair.fromWIF(
    globalParams.covenantPrivKeys[4],
    globalParams.network
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
