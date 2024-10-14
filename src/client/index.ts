import { AddressTxsUtxo } from "@mempool/mempool.js/lib/interfaces/bitcoin/addresses";
import { globalParams } from "../params";
import { default as BtcMempool } from "./mempool";
import btcClient from "./bitcoin";

const mempoolClient = new BtcMempool(globalParams.mempoolUrl);

export const client =
  globalParams.btcClientMode === "mempool" ? mempoolClient : btcClient;

export const getUtxos = async (address: string): Promise<AddressTxsUtxo[]> => {
  const utxos =
    globalParams.btcClientMode === "mempool"
      ? await mempoolClient.addresses.getAddressTxsUtxo({ address })
      : await btcClient.getUnspentTransactionOutputs(address);
  return utxos;
};

export const sendRawTx = (hex: string): Promise<string> => {
  const endpoint = globalParams.mempoolUrl + "/tx";
  console.log({ endpoint });
  return fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
    },
    body: hex,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json(); // Parse the JSON response
    })
    .then((data) => {
      console.log({ data });
      return data.txid;
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
      return null;
    });
};

export { BtcMempool, mempoolClient, btcClient };
