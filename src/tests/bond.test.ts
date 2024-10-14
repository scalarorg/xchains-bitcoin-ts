import { describe } from "bun:test";
import { bond } from "./utils";

describe("test create new bond", async () => {
  const amount = Math.floor(Math.random() * 1e5);
  console.log({ amount });
  const txid = await bond(80000);
  console.log({ txid });
});
