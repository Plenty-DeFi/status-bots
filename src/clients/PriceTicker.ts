import axios from "axios";
import BigNumber from "bignumber.js";
import { Client, Events, ActivityType, GatewayIntentBits } from "discord.js";

import { Config } from "../types";

export default class PriceTicker {
  private _token: string;
  private _client: Client;
  private _analyticsURL: string;
  private _lastPrice: string;
  private _lastChange: string;

  constructor({ tokens, analyticsURL }: Config) {
    this._token = tokens.priceTicker;
    this._analyticsURL = analyticsURL;
    this._client = new Client({ intents: [GatewayIntentBits.Guilds] });
    this._lastPrice = "";
    this._lastChange = "";
  }

  async init() {
    try {
      this._client.once(Events.ClientReady, (c) => {
        console.log(`PlentyPriceTicker ready! Logged in as ${c.user.tag}`);
      });
      await this._client.login(this._token);
    } catch (err) {
      throw err;
    }
  }

  async providePrice() {
    try {
      const res = await axios.get<Array<any>>(`${this._analyticsURL}/analytics/tokens`);
      const tokenData = res.data.filter((item: any) => item.token === "PLY")[0];
      const price = new BigNumber(tokenData.price.value).precision(3).toString();
      const change = tokenData.price.change24H;
      if (this._lastPrice !== price && this._lastChange !== change) {
        await this._updateTicker(price, change);
      }
    } catch (err) {
      throw err;
    }
  }

  private async _updateTicker(plyPrice: string, change24H: string) {
    try {
      this._lastPrice = plyPrice;
      this._lastChange = change24H;
      console.log(`Record PLY Price: ${plyPrice} (${change24H}%) at ${new Date().toUTCString()}`);
      await this._client.user?.setUsername(`💵 PLY $${plyPrice}`);
      this._client.user?.setActivity(`24H: ${parseFloat(change24H) > 0 ? "+" : ""}${change24H}%`, {
        type: ActivityType.Watching,
      });
    } catch (err) {
      throw err;
    }
  }
}
