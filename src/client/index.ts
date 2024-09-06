import { globalParams } from '../params';
import { default as BtcMempool } from './mempool';

export { default as btcClient } from './bitcoin';
export { BtcMempool };
export const mempoolClient = new BtcMempool(globalParams.mempoolUrl || 'https://mempool.space/api');