import { AddressTxsUtxo } from "@mempool/mempool.js/lib/interfaces/bitcoin/addresses";
import * as vault from "../index";
import { UTXO } from "../types/utxo";
import { logToJSON, psbt } from "../utils";
import { getAddressUtxos } from "../utils/bitcoin";
import { getDefaultEthAddress, getDestProtocolAddress } from "./utils";
import { globalParams } from "../params";
import { btcClient, mempoolClient, sendRawTx } from "../client";

/*
 *  bondingAmount in shatoshi
 *  mintingAmount consider equal to bondingAmount
 */
async function createBondingTransaction(
  destNetwork: string,
  bondingAmount: number
): Promise<{
  hexTxfromPsbt: string;
  fee: number;
}> {
  const userAddress = globalParams.destUserAddress || getDefaultEthAddress();
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
    globalParams.destSmartContractAddress ||
      getDestProtocolAddress(destNetwork),
    bondingAmount
  );
  // --- Get UTXOs

  const addressUtxo: AddressTxsUtxo[] = await getAddressUtxos(
    globalParams.bondHolderAddress
  );
  const regularUTXOs: UTXO[] = addressUtxo.map(
    ({ txid, vout, status, value }: AddressTxsUtxo) => ({
      txid,
      vout,
      value,
      status: {
        block_hash: status.block_hash,
        block_height: status.block_height,
        block_time: status.block_time,
        confirmed: status.confirmed,
      },
    })
  );
  //const regularUTXOs = await addresses.getAddressTxsUtxo({address: globalParams.bondHolderAddress});
  const { fees } = mempoolClient;
  const { fastestFee: feeRate } = await fees.getFeesRecommended(); // Get this from Mempool API
  const rbf = true; // Replace by fee, need to be true if we want to replace the transaction when the fee is low
  const { psbt: unsignedVaultPsbt, feeEstimate: fee } =
    await staker.getUnsignedVaultPsbt(
      regularUTXOs,
      bondingAmount,
      feeRate,
      rbf
    );
  console.log(unsignedVaultPsbt);
  // Simulate signing
  const signedPsbt = psbt.signInputs(
    globalParams.bondHolderPrivKey,
    globalParams.network,
    unsignedVaultPsbt.toBase64(),
    true
  );
  // --- Sign with staker
  const hexTxfromPsbt = signedPsbt.extractTransaction().toHex();
  return {
    hexTxfromPsbt,
    fee,
  };
}

async function createBondingTransactions(
  destNetwork: string,
  bondingAmount: number,
  numberTxs: number
) {
  for (let i = 0; i < numberTxs; i++) {
    // Create a bonding transaction
    await createBondingTransaction(
      destNetwork,
      bondingAmount + Math.min(1000, Math.ceil(bondingAmount * i * 0.1))
    )
      .then(async ({ hexTxfromPsbt, fee }) => {
        console.log(
          `Signed Tx in Hex: ${hexTxfromPsbt} with estimated fee ${fee}`
        );

        const testRes = await btcClient.rpcClient.command("testmempoolaccept", [
          hexTxfromPsbt,
        ]);
        console.log({testRes});

        return btcClient.sendrawtransaction(hexTxfromPsbt); 
      })
      .then((txid) => {
        console.log(`Transaction ID: ${txid}`);
      })
      .catch((error) => {
        console.error(error);
      });
  }
}

const bondingAmount = 9999; // in satoshis
const numberTxs = 1;
const destNetwork = "ethereum-sepolia";
logToJSON(globalParams);
createBondingTransactions(destNetwork, bondingAmount, numberTxs);
