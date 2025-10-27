"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export default function AssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAssets() {
      try {
        const data = await api.info({ type: "meta" });
        setAssets(data.universe || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load assets");
      } finally {
        setLoading(false);
      }
    }
    loadAssets();
  }, []);

  if (loading) {
    return (
      <div className="animate-[fade-in_0.5s_ease-out]">
        <h1 className="text-3xl font-bold text-white mb-8">📈 Perpetual Markets</h1>
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-gray-600">Loading assets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-[fade-in_0.5s_ease-out]">
        <h1 className="text-3xl font-bold text-white mb-8">📈 Perpetual Markets</h1>
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
        <h1 className="text-3xl font-bold text-white mb-2">📈 Perpetual Markets</h1>
        <p className="text-white/90">Browse all available perpetual contracts on Hyperliquid</p>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-head">
              <tr className="text-left text-sm text-gray-700">
                <th className="px-6 py-4 font-semibold">Asset</th>
                <th className="px-6 py-4 font-semibold text-right">Max Leverage</th>
                <th className="px-6 py-4 font-semibold text-right">Size Decimals</th>
                <th className="px-6 py-4 font-semibold">Margin Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {assets.map((asset: any, idx: number) => {
                const isolatedOnly = !!asset.onlyIsolated;
                return (
                  <tr key={idx} className="table-row">
                    <td className="px-6 py-4 font-bold text-gray-900">{asset.name}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-sm font-semibold">
                        {asset.maxLeverage}x
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-800">{asset.szDecimals}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${isolatedOnly ? "bg-danger-100 text-danger-700" : "bg-success-100 text-success-700"}`}>
                        {isolatedOnly ? "Isolated Only" : "Cross / Isolated"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
