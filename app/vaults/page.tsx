"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function VaultsPage() {
  const [vaults, setVaults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await api.info({ type: "vaultSummaries" });
        setVaults(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load vaults");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="animate-[fade-in_0.5s_ease-out] space-y-6">
      {/* 👇 only the heading text/emoji changed */}
      <h1 className="text-3xl font-bold text-white">📊 Vault Analytics</h1>

      {/* --- your existing UI continues here; placeholder kept minimal --- */}
      {loading && (
        <div className="glass rounded-2xl p-6">
          <p className="text-gray-600">Loading vaults…</p>
        </div>
      )}
      {error && (
        <div className="glass rounded-2xl p-6 bg-danger-50 border-danger-200 text-danger-700">
          <p className="font-semibold">Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}
      {!loading && !error && (
        <div className="glass rounded-2xl overflow-x-auto">
          <table className="w-full">
            <thead className="table-head">
              <tr className="text-left text-sm text-gray-700">
                <th className="px-6 py-4 font-semibold">Vault</th>
                <th className="px-6 py-4 font-semibold text-right">TVL</th>
                <th className="px-6 py-4 font-semibold text-right">7D PnL</th>
                <th className="px-6 py-4 font-semibold text-right">Sharpe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vaults.map((v, i) => (
                <tr key={i} className="table-row">
                  <td className="px-6 py-4 font-bold text-gray-900">{v?.name ?? `Vault #${i}`}</td>
                  <td className="px-6 py-4 text-right">${Number(v?.tvl ?? 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    {Number(v?.pnl7d ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {Number(v?.sharpe ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
              {vaults.length === 0 && (
                <tr>
                  <td className="px-6 py-6 text-gray-600" colSpan={4}>
                    No vaults to display.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
