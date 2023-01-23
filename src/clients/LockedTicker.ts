import axios from "axios";
import BigNumber from "bignumber.js";
import { Client, Events, ActivityType, GatewayIntentBits } from "discord.js";

import { Config } from "../types";

export default class LockedTicker {
  private _token: string;
  private _client: Client;
  private _tzktURL: string;
  private _lastLocked: string;
  private _lastPercentage: string;

  constructor({ tokens, tzktURL }: Config) {
    this._token = tokens.lockedTicker;
    this._tzktURL = tzktURL;
    this._client = new Client({ intents: [GatewayIntentBits.Guilds] });
    this._lastLocked = "";
    this._lastPercentage = "";
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
      const lockedSupply = new BigNumber(_res.data.locked_supply)
        .dividedBy(10 ** 18)
        .decimalPlaces(0)
        .toNumber()
        .toLocaleString();
      const percentage = new BigNumber(_res.data.locked_supply)
        .dividedBy(__res.data.totalSupply)
        .multipliedBy(100)
        .toFixed(2);
      if (this._lastLocked !== lockedSupply && this._lastPercentage !== percentage) {
        await this._updateTicker(lockedSupply, percentage);
      }
    } catch (err) {
      throw err;
    }
  }

  private async _updateTicker(lockedSupply: string, percentage: string) {
    try {
      console.log(`Record Locked: ${lockedSupply} (${percentage}%) at ${new Date().toUTCString()}`);
      await this._client.user?.setUsername(`🔐 ${lockedSupply} PLY`);
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
      this._lastLocked = lockedSupply;
      this._lastPercentage = percentage;
    } catch (err) {
      throw err;
    }
  }
}
