import { describe } from "bun:test";
import { burning, burnWithoutDApp, ensureExists, getTxHex } from "./utils";

// 0.95682505 tBTC
const txid = "076ce9828ea9dc6e9e1b8b609370a74c4c581b3805bfa8ba7308208ed50820e5";

describe("test burn tx with user and covenants", async () => {
  await ensureExists(txid);
  const hexTx = await getTxHex(txid);
  const burntTxId = await burnWithoutDApp(hexTx);
  console.log({ burntTxId });
});
