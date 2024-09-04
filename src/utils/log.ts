import * as bitcoin from "bitcoinjs-lib";

export function logToJSON(any: any) {
  console.log(
    JSON.stringify(
      any,
      (k, v) => {
        if (v.type === "Buffer") {
          return Buffer.from(v.data).toString("hex");
        }
          if (k === "network") {
              switch (v) {
                  case bitcoin.networks.bitcoin:
                      return "bitcoin";
                  case bitcoin.networks.testnet:
                      return "testnet";
                  case bitcoin.networks.regtest:
                      return "regtest";
              }
        }
        if (typeof v == "bigint") {
          return v.toString(10);
        }
        return v;
      },
      2,
    ),
  );
}