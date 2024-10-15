import { toXOnly } from "bitcoinjs-lib/src/psbt/bip371";
import { mempoolClient } from "../client";
import { globalParams } from "../params";
import { ECPair } from "../utils";

export const feeRate = 1;
export const rbf = true;

const maxRetries = 10;
const retryDelay = 5000;

export const stakerKeyPair = ECPair.fromWIF(
  globalParams.bondHolderPrivKey!,
  globalParams.network
);

export const protocolKeyPair = ECPair.fromWIF(
  globalParams.protocolPrivKey!,
  globalParams.network
);

export const covenant_1_keyPair = ECPair.fromWIF(
  globalParams.covenantPrivKeys[0],
  globalParams.network
);
export const covenant_2_keyPair = ECPair.fromWIF(
  globalParams.covenantPrivKeys[1],
  globalParams.network
);
export const covenant_3_keyPair = ECPair.fromWIF(
  globalParams.covenantPrivKeys[2],
  globalParams.network
);
export const covenant_4_keyPair = ECPair.fromWIF(
  globalParams.covenantPrivKeys[3],
  globalParams.network
);
export const covenant_5_keyPair = ECPair.fromWIF(
  globalParams.covenantPrivKeys[4],
  globalParams.network
);

const covenants_keyPairs = [
  covenant_1_keyPair,
  covenant_2_keyPair,
  covenant_3_keyPair,
  covenant_4_keyPair,
  covenant_5_keyPair,
];

export const sortedCovenants = covenants_keyPairs.sort((a, b) =>
  Buffer.compare(
    Uint8Array.from(toXOnly(a.publicKey)),
    Uint8Array.from(toXOnly(b.publicKey))
  )
);

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
