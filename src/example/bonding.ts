import { btcClient, mempoolClient } from "../client";
import * as vault from "../index";
import { globalParams } from "../params";
import { UTXO } from "../types/utxo";
import { logToJSON, psbt } from "../utils"
/*
 *  bondingAmount in shatoshi
 *  mintingAmount consider equal to bondingAmount
*/
async function createBondingTransaction(bondingAmount: number): Promise<{
    hexTxfromPsbt: string;
    fee: number;
}> {
    if (!globalParams.bondHolderAddress) {
        throw new Error('Bond holder address is not provided');
    }
    if (!globalParams.bondHolderPrivKey) {
        throw new Error('Bond holder private key is not provided');
    }
    if (!globalParams.bondHolderPublicKey) {
        throw new Error('Bond holder public key is not provided');
    }
    if (!globalParams.protocolPublicKey) {
        throw new Error('Protocol public key is not provided');
    }
    if (!globalParams.covenantPublicKeys) {
        throw new Error('Covenant public keys are not provided');
    }
    logToJSON(globalParams);
    const staker = new vault.Staker(
        globalParams.bondHolderAddress,
        globalParams.bondHolderPublicKey,
        globalParams.protocolPublicKey,
        globalParams.covenantPublicKeys,
        globalParams.covenantQuorum,
        globalParams.tag,
        globalParams.version,
        globalParams.destChainId || '1', 
        globalParams.destUserAddress || '',
        globalParams.destSmartContractAddress || '',
        bondingAmount,
    );
    // --- Get UTXOs
    const regularUTXOs: UTXO[] = await btcClient.getUnspentTransactionOutputs(globalParams.bondHolderAddress);
    
    //const regularUTXOs = await addresses.getAddressTxsUtxo({address: globalParams.bondHolderAddress});
    const { fees } = mempoolClient;
    const { fastestFee : feeRate } = await fees.getFeesRecommended(); // Get this from Mempool API
    const rbf = true; // Replace by fee, need to be true if we want to replace the transaction when the fee is low
    const { psbt: unsignedVaultPsbt, feeEstimate: fee } =
    await staker.getUnsignedVaultPsbt(
      regularUTXOs,
      bondingAmount,
      feeRate,
      rbf,
    );
    // Simulate signing
    const signedPsbt = psbt.signInputs(
        globalParams.bondHolderPrivKey,
        globalParams.network,
        unsignedVaultPsbt.toBase64(),
        true,
    );
    // --- Sign with staker
    const hexTxfromPsbt = signedPsbt.extractTransaction().toHex();
    return {
        hexTxfromPsbt,
        fee
    };
}

const bondingAmount = 10000; // in satoshis
createBondingTransaction(bondingAmount)
    .then(async ({ hexTxfromPsbt, fee }) => {
        console.log(`Signed Tx in Hex: ${hexTxfromPsbt} with estimate fee ${fee}`); // log it for the unbonding.ts
        const testRes = await btcClient.rpcClient.command("testmempoolaccept", [hexTxfromPsbt]);
        console.log(testRes);
        return btcClient.sendrawtransaction(hexTxfromPsbt);
}).then((txid) => {
        console.log(`Transaction ID: ${txid}`);
}).catch((error) => { console.error(error); });