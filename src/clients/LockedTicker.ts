import axios from "axios";
import BigNumber from "bignumber.js";
import { Client, Events, ActivityType, GatewayIntentBits } from "discord.js";

import { Config } from "../types";

export default class LockedTicker {
  private _token: string;
  private _client: Client;
  private _tzktURL: string;

  constructor({ tokens, tzktURL }: Config) {
    this._token = tokens.lockedTicker;
    this._tzktURL = tzktURL;
    this._client = new Client({ intents: [GatewayIntentBits.Guilds] });
  }

  async init() {
    try {
      this._client.once(Events.ClientReady, (c) => {
        console.log(`PlentyLockedTicker ready! Logged in as ${c.user.tag}`);
      });
      await this._client.login(this._token);
    } catch (err) {
      throw err;
    }
  }

  async provideLockedValue() {
    try {
      const _res = await axios.get(
        `${this._tzktURL}/contracts/KT18kkvmUoefkdok5mrjU6fxsm7xmumy1NEw/storage`
      );
      const __res = await axios.get(
        `${this._tzktURL}/contracts/KT1JVjgXPMMSaa6FkzeJcgb8q9cUaLmwaJUX/storage`
      );
      const lockedSupply = _res.data.locked_supply;
      const totalSupply = __res.data.totalSupply;
      await this._updateTicker(lockedSupply, totalSupply);
    } catch (err) {
      throw err;
    }
  }

  private async _updateTicker(lockedSupply: string, totalSupply: string) {
    try {
      await this._client.user?.setUsername(
        `🔐 ${new BigNumber(lockedSupply)
          .dividedBy(10 ** 18)
          .decimalPlaces(0)
          .toNumber()
          .toLocaleString()} PLY`
      );

      const percentage = new BigNumber(lockedSupply)
        .dividedBy(totalSupply)
        .multipliedBy(100)
        .toFixed(2);

      this._client.user?.setPresence({
        status: "online",
        activities: [
          {
            name: `Locked: ${percentage}%`,
            type: ActivityType.Watching,
            url: "https://app.plenty.network/vote",
          },
        ],
      });
    } catch (err) {
      throw err;
    }
  }
}
