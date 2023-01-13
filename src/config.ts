import { Config } from "./types";

export const config: Config = {
  tokens: {
    priceTicker: process.env.PRICE_TICKER_TOKEN || "",
    lockedTicker: process.env.LOCKED_TICKER_TOKEN || "",
    votesTicker: process.env.VOTES_TICKER_TOKEN || "",
  },
  tzktURL: process.env.TZKT_URL || "https://api.tzkt.io/v1",
  analyticsURL: process.env.ANALYTICS_URL || "https://api.analytics.plenty.network",
  rpcURL: process.env.RPC_URL || "https://mainnet.smartpy.io",
};
