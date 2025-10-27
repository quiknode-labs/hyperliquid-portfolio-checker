"use client";

import { useState, useEffect } from "react";
import { api, storage } from "../lib/api";
import {
  formatUSD,
  formatNumber,
  getPositionSide,
  getPnLColor,
} from "../lib/utils";
import AddressInput from "../components/AddressInput";
import StatCard from "../components/StatCard";

// --- NEW: tolerant balances parser (handles a few response shapes) ---
function parseSpotBalances(spotResult: any): Array<{ token: string; total: number; hold: number }> {
  if (!spotResult) return [];

  // Most likely shape: { balances: [{ token, total, hold }, ...] }
  if (Array.isArray(spotResult.balances)) {
    return spotResult.balances.map((b: any) => ({
      token: String(b?.token ?? ""),
      total: Number(b?.total ?? 0),
      hold: Number(b?.hold ?? 0),
    }));
  }

  // Sometimes nested or differently named:
  // { wallet: { balances: [...] } } / { spotBalances: [...] } / { data: { balances: [...] } }
  const nested =
    spotResult?.wallet?.balances ??
    spotResult?.spotBalances ??
    spotResult?.data?.balances ??
    [];

  if (Array.isArray(nested)) {
    return nested.map((b: any) => ({
      token: String(b?.token ?? ""),
      total: Number(b?.total ?? 0),
      hold: Number(b?.hold ?? 0),
    }));
  }

  // Fallback: no balances found
  return [];
}

export default function AccountPage() {
  const [savedAddresses, setSavedAddresses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [spotData, setSpotData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"positions" | "orders" | "balances">("positions");

  useEffect(() => {
    setSavedAddresses(storage.getAddresses());
  }, []);

  async function loadPortfolio(address: string) {
    setLoading(true);
    setError("");
    setPortfolioData(null);
    setSpotData(null);
    setOrders([]);

    try {
      const [perpData, spotResult, ordersData] = await Promise.all([
        api.info({ type: "clearinghouseState", user: address }),
        api.info({ type: "spotClearinghouseState", user: address }),
        api.info({ type: "frontendOpenOrders", user: address }),
      ]);

      setPortfolioData(perpData);
      setSpotData(spotResult);
      setOrders(ordersData || []);

      storage.saveAddress(address);
      setSavedAddresses(storage.getAddresses());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load portfolio");
    } finally {
      setLoading(false);
    }
  }

  function handleRemoveAddress(address: string) {
    storage.removeAddress(address);
    setSavedAddresses(storage.getAddresses());
  }

  const positions = portfolioData?.assetPositions || [];
  const marginSummary = portfolioData?.marginSummary;

  // --- CHANGED: balances go through parser (instead of spotData?.balances || []) ---
  const spotBalances = parseSpotBalances(spotData);

  return (
    <div className="w-full animate-[fade-in_0.5s_ease-out]">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          👤 Account Portfolio
        </h1>
        <p className="text-sm sm:text-base text-white/90">
          Track positions, orders, and balances for any Hyperliquid address
        </p>
      </div>

      <AddressInput
        onSubmit={loadPortfolio}
        loading={loading}
        savedAddresses={savedAddresses}
        onRemoveAddress={handleRemoveAddress}
      />

      {error && (
        <div className="glass rounded-xl sm:rounded-2xl p-4 bg-danger-50 border-danger-200 text-danger-700 mt-4 w-full">
          <p className="font-semibold text-sm">Error:</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {portfolioData && (
        <div className="mt-6 sm:mt-8 w-full space-y-6 animate-[slide-up_0.3s_ease-out]">
          {/* Account Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            <StatCard
              title="Account Value"
              value={formatUSD(marginSummary?.accountValue || 0)}
            />
            <StatCard
              title="Total Position"
              value={formatUSD(marginSummary?.totalNtlPos || 0)}
            />
            <StatCard
              title="Unrealized PnL"
              value={formatUSD(marginSummary?.totalRawUsd || 0)}
              className={getPnLColor(marginSummary?.totalRawUsd || 0)}
            />
            <StatCard
              title="Margin Used"
              value={formatUSD(marginSummary?.totalMarginUsed || 0)}
            />
          </div>

          {/* Tabs */}
          <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full">
            <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
              {[
                { id: "positions", label: `Positions (${positions.length})` },
                { id: "orders", label: `Orders (${orders.length})` },
                { id: "balances", label: `Balances (${spotBalances.length})` }, // count matches parsed list
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 sm:px-6 py-3 font-medium transition-all text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-brand-600 border-b-2 border-brand-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Positions Tab */}
            {activeTab === "positions" && (
              <div className="w-full">
                {positions.length === 0 ? (
                  <p className="text-center text-gray-600 py-8 text-sm">No open positions</p>
                ) : (
                  <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[640px]">
                      <thead>
                        <tr className="text-left text-xs sm:text-sm text-gray-600 border-b">
                          <th className="pb-3 pr-4 font-semibold">Asset</th>
                          <th className="pb-3 px-2 font-semibold text-right">Size</th>
                          <th className="pb-3 px-2 font-semibold text-right">Entry</th>
                          <th className="pb-3 px-2 font-semibold text-right">Value</th>
                          <th className="pb-3 px-2 font-semibold text-right">PnL</th>
                          <th className="pb-3 pl-2 font-semibold text-right">Leverage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {positions.map((pos: any, idx: number) => {
                          const position = pos.position;
                          const size = parseFloat(position.szi);
                          const side = getPositionSide(size);

                          return (
                            <tr key={idx} className="border-b last:border-0">
                              <td className="py-4 pr-4">
                                <div className="flex flex-col gap-1">
                                  <span className="font-semibold text-sm">
                                    {position.coin}
                                  </span>
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full inline-block w-fit ${
                                      side === "LONG"
                                        ? "bg-success-100 text-success-700"
                                        : "bg-danger-100 text-danger-700"
                                    }`}
                                  >
                                    {side}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-2 text-right font-mono text-sm">
                                {formatNumber(Math.abs(size), 4)}
                              </td>
                              <td className="py-4 px-2 text-right font-mono text-sm">
                                {position.entryPx ? formatUSD(position.entryPx) : "-"}
                              </td>
                              <td className="py-4 px-2 text-right font-mono text-sm">
                                {position.positionValue
                                  ? formatUSD(position.positionValue)
                                  : "-"}
                              </td>
                              <td
                                className={`py-4 px-2 text-right font-mono text-sm font-semibold ${getPnLColor(
                                  position.unrealizedPnl || 0
                                )}`}
                              >
                                {position.unrealizedPnl
                                  ? formatUSD(position.unrealizedPnl)
                                  : "-"}
                              </td>
                              <td className="py-4 pl-2 text-right text-sm">
                                {position.leverage.value}x
                                <span className="text-gray-500 ml-1 text-xs">
                                  ({position.leverage.type})
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="w-full">
                {orders.length === 0 ? (
                  <p className="text-center text-gray-600 py-8 text-sm">No open orders</p>
                ) : (
                  <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[480px]">
                      <thead>
                        <tr className="text-left text-xs sm:text-sm text-gray-600 border-b">
                          <th className="pb-3 pr-4 font-semibold">Asset</th>
                          <th className="pb-3 px-2 font-semibold">Side</th>
                          <th className="pb-3 px-2 font-semibold text-right">Price</th>
                          <th className="pb-3 px-2 font-semibold text-right">Size</th>
                          <th className="pb-3 pl-2 font-semibold text-right">Filled</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order: any, idx: number) => (
                          <tr key={idx} className="border-b last:border-0">
                            <td className="py-4 pr-4 font-semibold text-sm">{order.coin}</td>
                            <td className="py-4 px-2">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  order.side === "B"
                                    ? "bg-success-100 text-success-700"
                                    : "bg-danger-100 text-danger-700"
                                }`}
                              >
                                {order.side === "B" ? "BUY" : "SELL"}
                              </span>
                            </td>
                            <td className="py-4 px-2 text-right font-mono text-sm">
                              {formatUSD(order.limitPx)}
                            </td>
                            <td className="py-4 px-2 text-right font-mono text-sm">
                              {formatNumber(order.sz, 4)}
                            </td>
                            <td className="py-4 pl-2 text-right font-mono text-sm">
                              {formatNumber(
                                parseFloat(order.origSz) - parseFloat(order.sz),
                                4
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Balances Tab */}
            {activeTab === "balances" && (
              <div className="w-full">
                {spotBalances.length === 0 ? (
                  <p className="text-center text-gray-600 py-8 text-sm">No spot balances</p>
                ) : (
                  <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[360px]">
                      <thead>
                        <tr className="text-left text-xs sm:text-sm text-gray-600 border-b">
                          <th className="pb-3 pr-4 font-semibold">Token</th>
                          <th className="pb-3 px-2 font-semibold text-right">Total</th>
                          <th className="pb-3 pl-2 font-semibold text-right">Hold</th>
                        </tr>
                      </thead>
                      <tbody>
                        {spotBalances.map((balance: any, idx: number) => (
                          <tr key={idx} className="border-b last:border-0">
                            <td className="py-4 pr-4 font-semibold text-sm">{balance.token}</td>
                            <td className="py-4 px-2 text-right font-mono text-sm">
                              {formatNumber(balance.total, 6)}
                            </td>
                            <td className="py-4 pl-2 text-right font-mono text-sm text-gray-600">
                              {formatNumber(balance.hold, 6)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
