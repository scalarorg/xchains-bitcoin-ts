export type UTXO = {
  txid: string;
  vout: number;
  value: number;
  status: Status;
};

export type BtcUnspent = {
  txid: string;
  vout: number;
  address: string;
  label?: string;
  scriptPubKey: string;
  amount: number;
  confirmations: number;
  spendable: boolean;
  solvable: boolean;
  desc: string;
  parent_descs?: string[];
  safe: boolean;
}
    
export type Status = {
  confirmed: boolean;
  block_height: number;
  block_hash: string;
  block_time: number;
}

export interface ToSignInput {
  index: number;
  publicKey: string;
  sighashTypes?: number[];
  disableTweakSigner?: boolean;
}
