
import Client from "bitcoin-core-ts";
import { globalParams } from "../params";
import { UTXO, BtcUnspent } from "../types/utxo";

export const client = new Client({
    network: globalParams.networkName,
    host: globalParams.btcHost,
    port: globalParams.btcPort,
    wallet: globalParams.walletName,
    username: globalParams.btcRpcUser,
    password: globalParams.btcRpcPassword
});

export const getUnspentTransactionOutputs = async (address: string) : Promise<UTXO[]> => {
    const listUnspent: BtcUnspent[] = await client.command("listunspent", 0, 9999999, [address]);
    const mempoolUtxos: UTXO[] = listUnspent.map((utxo: BtcUnspent) => {
        return {
            txid: utxo.txid,
            vout: utxo.vout,
            value: utxo.amount * 100000000, // convert to satoshis
            confirmations: utxo.confirmations,
            status: {
                confirmed: utxo.confirmations > 0,
                block_height: 0,
                block_hash: "",
                block_time: 0
            }
        };
    });
    return mempoolUtxos;
}

export const sendrawtransaction = async (hex: string): Promise<string> => {
    const txid = await client.command("sendrawtransaction", hex);
    return txid;
}
const btcNodeClient = {
    rpcClient: client,
    sendrawtransaction,
    getUnspentTransactionOutputs
};

export default btcNodeClient;