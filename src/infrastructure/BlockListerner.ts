import { RpcClient } from "@taquito/rpc";

import { Config } from "../types";

export default class BlockListener {
  private _rpcClient: RpcClient;
  private _lastBlockHash: string;

  constructor({ rpcURL }: Config) {
    this._rpcClient = new RpcClient(rpcURL);
    this._lastBlockHash = "";
  }

  async start(callback: () => any) {
    setInterval(() => this._process(callback), 2000);
  }

  private async _process(callback: () => any) {
    try {
      const block = await this._rpcClient.getBlock();
      if (block.hash === this._lastBlockHash) {
        return;
      } else {
        this._lastBlockHash = block.hash;
        callback();
      }
    } catch (err) {
      console.error(err);
    }
  }
}
