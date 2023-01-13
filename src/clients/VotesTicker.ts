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

  constructor({ tokens, tzktURL }: Config, veInstance: DefaultContractType) {
    this._token = tokens.votesTicker;
    this._tzktURL = tzktURL;
    this._client = new Client({ intents: [GatewayIntentBits.Guilds] });
    this._veInstance = veInstance;
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
      const epochVotes = _res.data[0].value;
      const epochVotingPower = await this._veInstance.contractViews
        .get_total_voting_power({ ts: Math.floor(new Date().getTime() / 1000), time: 1 })
        .executeView({ viewCaller: "KT18kkvmUoefkdok5mrjU6fxsm7xmumy1NEw" });
      this, this._updateTicker(epochVotes, epochVotingPower);
    } catch (err) {
      throw err;
    }
  }

  private async _updateTicker(epochVotes: string, epochVotingPower: string) {
    try {
      await this._client.user?.setUsername(
        `🗳️ ${new BigNumber(epochVotes)
          .dividedBy(10 ** 18)
          .decimalPlaces(0)
          .toNumber()
          .toLocaleString()} PLY`
      );

      const percentage = new BigNumber(epochVotes)
        .dividedBy(epochVotingPower)
        .multipliedBy(100)
        .toFixed(2);

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
