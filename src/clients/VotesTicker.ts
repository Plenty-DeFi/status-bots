import axios from "axios";
import BigNumber from "bignumber.js";
import { DefaultContractType } from "@taquito/taquito";
import { Client, Events, ActivityType, GatewayIntentBits } from "discord.js";

import { Config } from "../types";

export default class VotesTicker {
  private _token: string;
  private _client: Client;
  private _tzktURL: string;
  private _veInstance: DefaultContractType;
  private _lastVotes: string;
  private _lastPercentage: string;

  constructor({ tokens, tzktURL }: Config, veInstance: DefaultContractType) {
    this._token = tokens.votesTicker;
    this._tzktURL = tzktURL;
    this._client = new Client({ intents: [GatewayIntentBits.Guilds] });
    this._veInstance = veInstance;
    this._lastVotes = "";
    this._lastPercentage = "";
  }

  async init() {
    try {
      this._client.once(Events.ClientReady, (c) => {
        console.log(`PlentyVotesTicker ready! Logged in as ${c.user.tag}`);
      });
      await this._client.login(this._token);
    } catch (err) {
      throw err;
    }
  }

  async provideVotesValue() {
    try {
      const _res = await axios.get(
        `${this._tzktURL}/bigmaps/358477/keys?sort.desc=lastLevel&limit=1`
      );
      const epochVotes = new BigNumber(_res.data[0].value)
        .dividedBy(10 ** 18)
        .decimalPlaces(0)
        .toNumber()
        .toLocaleString();
      const epochVotingPower = await this._veInstance.contractViews
        .get_total_voting_power({ ts: Math.floor(new Date().getTime() / 1000), time: 1 })
        .executeView({ viewCaller: "KT18kkvmUoefkdok5mrjU6fxsm7xmumy1NEw" });
      const percentage = new BigNumber(_res.data[0].value)
        .dividedBy(epochVotingPower)
        .multipliedBy(100)
        .toFixed(2);
      if (this._lastVotes !== epochVotes && this._lastPercentage !== percentage) {
        await this._updateTicker(epochVotes, percentage);
      }
    } catch (err) {
      throw err;
    }
  }

  private async _updateTicker(epochVotes: string, percentage: string) {
    try {
      this._lastVotes = epochVotes;
      this._lastPercentage = percentage;
      console.log(`Record Voters: ${epochVotes} (${percentage}%) at ${new Date().toUTCString()}`);
      await this._client.user?.setUsername(`🗳️ ${epochVotes}`);
      this._client.user?.setPresence({
        status: "online",
        activities: [
          {
            name: `Votes: ${percentage}%`,
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
