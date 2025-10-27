"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { formatAddress, hexToNum, numToHex } from "../../lib/utils";

type Json = Record<string, any> | null;

export default function EvmExplorerPage() {
  // Search state
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Json>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Current block (head) state
  const [head, setHead] = useState<Json>(null);
  const [headLoading, setHeadLoading] = useState(true);

  // ----- Current block from /evm -----
  async function fetchHead() {
    setHeadLoading(true);
    try {
      // Single JSON-RPC call to get latest block with transactions
      const res = await api.evm({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getBlockByNumber",
        params: ["latest", true],
      });
      // Support either direct block or {result}
      const block = res?.result ?? res;
      setHead(block ?? null);
    } catch {
      setHead(null);
    } finally {
      setHeadLoading(false);
    }
  }

  useEffect(() => { fetchHead(); }, []);

  // ----- Search via /evm -----
  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const q = query.trim();
      let data: any = null;

      const isHex = /^0x[0-9a-fA-F]+$/.test(q);
      const isTxOrBlockHash = isHex && q.length === 66;   // 0x + 64
      const isAddress = isHex && q.length === 42;         // 0x + 40
      const isDecBlock = /^\d+$/.test(q);

      if (isTxOrBlockHash) {
        // Try block-by-hash first; if null, fallback to transaction-by-hash
        const byBlock = await api.evm({ jsonrpc: "2.0", id: 1, method: "eth_getBlockByHash", params: [q, true] });
        data = byBlock?.result ?? null;
        if (!data) {
          const byTx = await api.evm({ jsonrpc: "2.0", id: 1, method: "eth_getTransactionByHash", params: [q] });
          data = byTx?.result ?? null;
        }
      } else if (isAddress) {
        const [balanceRes, txCountRes] = await Promise.all([
          api.evm({ jsonrpc: "2.0", id: 1, method: "eth_getBalance", params: [q, "latest"] }),
          api.evm({ jsonrpc: "2.0", id: 2, method: "eth_getTransactionCount", params: [q, "latest"] }),
        ]);
        const balanceWei = balanceRes?.result ?? "0x0";
        const txCountHex = txCountRes?.result ?? "0x0";
        data = {
          address: q,
          balanceWei,
          balance: hexToNum(balanceWei),
          txCount: hexToNum(txCountHex),
        };
      } else if (isDecBlock) {
        const hex = numToHex(parseInt(q, 10));
        const byNum = await api.evm({ jsonrpc: "2.0", id: 1, method: "eth_getBlockByNumber", params: [hex, true] });
        data = byNum?.result ?? null;
      } else {
        setErr("Enter an address, tx hash, block hash, or block number.");
      }

      setResult(data ?? null);
    } catch (e: any) {
      setErr(e?.message ?? "Search failed");
    } finally {
      setLoading(false);
    }
  };

  // ----- Head field fallbacks -----
  const blockNumber = hexToNum(head?.number) ?? head?.height ?? head?.blockNumber ?? null;
  const blockHash = head?.hash ?? head?.blockHash ?? head?.id ?? null;
  const gasUsed = hexToNum(head?.gasUsed) ?? head?.gas?.used ?? null;
  const gasLimit = hexToNum(head?.gasLimit) ?? head?.gas?.limit ?? null;
  const txCount =
    (Array.isArray(head?.transactions) && head!.transactions.length) ||
    (Array.isArray(head?.txs) && head!.txs.length) ||
    head?.transactionsCount ||
    null;
  const timestampSec =
    hexToNum(head?.timestamp) ??
    (typeof head?.time === "number" ? head.time : null);
  const timeText = timestampSec ? new Date(timestampSec * 1000).toLocaleString() : "N/A";

  return (
    <div className="animate-[fade-in_0.5s_ease-out] space-y-6">
      <h1 className="text-3xl font-bold text-white">🧪 EVM Explorer</h1>

      {/* Current Block */}
      <section className="glass rounded-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Current Block</h2>
          {!headLoading && <span className="text-xs text-gray-600">Updated: {new Date().toLocaleTimeString()}</span>}
        </div>

        {headLoading ? (
          <p className="text-gray-600">Loading latest block…</p>
        ) : !head ? (
          <p className="text-gray-600">Not available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Block Number" value={blockNumber ?? "N/A"} />
            <StatCard label="Block Hash" value={blockHash ? formatAddress(blockHash, 10, 10) : "N/A"} mono />
            <StatCard
              label="Gas"
              value={
                gasUsed != null && gasLimit != null
                  ? `${Number(gasUsed).toLocaleString()} / ${Number(gasLimit).toLocaleString()}`
                  : "N/A"
              }
            />
            <StatCard label="Tx Count" value={txCount ?? "N/A"} />
            <StatCard label="Timestamp" value={timeText} className="sm:col-span-2 lg:col-span-4" />
          </div>
        )}
      </section>

      {/* Search */}
      <form onSubmit={onSearch} className="glass rounded-2xl p-4 sm:p-6">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by address / tx hash / block hash / block number"
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-3 rounded-xl bg-[#a744fb] hover:bg-[#922de9] text-white font-semibold disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
        {err && <p className="text-danger-700 text-sm mt-3">{err}</p>}
      </form>

      {/* Search Result */}
      {result && (
        <div className="glass rounded-2xl p-6">
          <pre className="text-xs overflow-auto">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  mono = false,
  className = "",
}: {
  label: string;
  value: any;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={`glass rounded-xl p-4 ${className}`}>
      <p className="text-xs font-medium text-gray-600">{label}</p>
      <p className={`text-lg font-semibold text-gray-900 mt-1 ${mono ? "font-mono break-all" : ""}`}>
        {value}
      </p>
    </div>
  );
}
