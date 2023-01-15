import axios from "axios";
import BigNumber from "bignumber.js";
import { Client, Events, ActivityType, GatewayIntentBits } from "discord.js";

import { Config } from "../types";

export default class PriceTicker {
  private _token: string;
  private _client: Client;
  private _analyticsURL: string;

  constructor({ tokens, analyticsURL }: Config) {
    this._token = tokens.priceTicker;
    this._analyticsURL = analyticsURL;
    this._client = new Client({ intents: [GatewayIntentBits.Guilds] });
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
      await this._updateTicker(tokenData.price.value, tokenData.price.change24H);
    } catch (err) {
      throw err;
    }
  }

  private async _updateTicker(price: string, change24H: string) {
    try {
      const plyPrice = new BigNumber(price).precision(3).toString();

      console.log(`Record PLY Price: ${plyPrice} (${change24H}%)`);

      await this._client.user?.setUsername(`💵 PLY $${plyPrice}`);
      this._client.user?.setActivity(`24H: ${parseFloat(change24H) > 0 ? "+" : ""}${change24H}%`, {
        type: ActivityType.Watching,
      });
    } catch (err) {
      throw err;
    }
  }
}
