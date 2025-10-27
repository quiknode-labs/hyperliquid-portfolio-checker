"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function LiquidationsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await api.info({ type: "liquidatable" });
        setRows(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load liquidations");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="animate-[fade-in_0.5s_ease-out] space-y-6">
      {/* 👇 only the heading text/emoji changed */}
      <h1 className="text-3xl font-bold text-white">⚠️ Liquidations</h1>

      {loading && (
        <div className="glass rounded-2xl p-6">
          <p className="text-gray-600">Loading data…</p>
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
                <th className="px-6 py-4 font-semibold">Address</th>
                <th className="px-6 py-4 font-semibold text-right">Risk</th>
                <th className="px-6 py-4 font-semibold text-right">Leverage</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rows.map((r, i) => (
                <tr key={i} className="table-row">
                  <td className="px-6 py-4 font-mono text-sm">{r?.address ?? "-"}</td>
                  <td className="px-6 py-4 text-right">{Number(r?.risk ?? 0).toFixed(2)}%</td>
                  <td className="px-6 py-4 text-right">{Number(r?.lev ?? 0).toFixed(2)}x</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-danger-100 text-danger-700">
                      At Risk
                    </span>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="px-6 py-6 text-gray-600" colSpan={4}>
                    No liquidations at the moment.
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
