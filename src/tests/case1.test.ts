import { describe } from "bun:test";
import { burning, ensureExists, getTxHex } from "./utils";

// 0.95682505 tBTC
const txid = "097c55940aaf7eb823b519de1bc941548e29577a877812fd48b6cefbe896d05a";

describe("test burn tx with user and protocol", async () => {
  await ensureExists(txid);
  const hexTx = await getTxHex(txid);
  const burntTxId = await burning(hexTx);
  console.log({ burntTxId });
});
