"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { getPairName, getSizeDecimals } from "../../lib/utils";

export default function SpotPage() {
  const [spotAssets, setSpotAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSpot() {
      try {
        const data = await api.info({ type: "spotMeta" });
        setSpotAssets(data.universe || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load spot markets");
      } finally {
        setLoading(false);
      }
    }
    loadSpot();
  }, []);

  if (loading) {
    return (
      <div className="animate-[fade-in_0.5s_ease-out]">
        <h1 className="text-3xl font-bold text-white mb-8">🪙 Spot Markets</h1>
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-gray-600">Loading spot markets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-[fade-in_0.5s_ease-out]">
        <h1 className="text-3xl font-bold text-white mb-8">🪙 Spot Markets</h1>
        <div className="glass rounded-2xl p-6 bg-danger-50 border-danger-200 text-danger-700">
          <p className="font-semibold">Error:</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-[fade-in_0.5s_ease-out]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">🪙 Spot Markets</h1>
        <p className="text-white/90">Explore all spot trading pairs on Hyperliquid</p>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-head">
              <tr className="text-left text-sm text-gray-700">
                <th className="px-6 py-4 font-semibold">Index</th>
                <th className="px-6 py-4 font-semibold">Pair Name</th>
                <th className="px-6 py-4 font-semibold">Tokens</th>
                <th className="px-6 py-4 font-semibold text-right">Size Decimals</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {spotAssets.map((asset: any, idx: number) => (
                <tr key={idx} className="table-row">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
                      @{idx}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">
                    {getPairName(asset, idx)}
                  </td>
                  <td className="px-6 py-4 text-gray-800">
                    {Array.isArray(asset?.tokens) ? asset.tokens.join(" / ") : (asset?.token0Symbol && asset?.token1Symbol ? `${asset.token0Symbol} / ${asset.token1Symbol}` : "N/A")}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-800">
                    {getSizeDecimals(asset)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
