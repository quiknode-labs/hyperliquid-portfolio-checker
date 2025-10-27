"use client";

import { useEffect, useState } from "react";
import { api } from "./lib/api";
import Link from "next/link";

export default function HomePage() {
  const [stats, setStats] = useState({ perpAssets: 0, spotAssets: 0, liquidatable: 0, vaults: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [perpData, spotData, liqData, vaultData] = await Promise.all([
          api.info({ type: "meta" }),
          api.info({ type: "spotMeta" }),
          api.info({ type: "liquidatable" }),
          api.info({ type: "vaultSummaries" }),
        ]);
        setStats({
          perpAssets: perpData.universe?.length || 0,
          spotAssets: spotData.universe?.length || 0,
          liquidatable: liqData?.length || 0,
          vaults: vaultData?.length || 0,
        });
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="animate-[fade-in_0.5s_ease-out] space-y-10 md:space-y-12">
      {/* Hero */}
      <section className="glass rounded-2xl md:rounded-3xl p-6 md:p-10 lg:p-12">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 gradient-text">
            Portfolio Checker
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-gray-700 mb-6 md:mb-8">
            Get insights on your Hyperliquid portfolio with real-time tracking of positions, orders, balances, and risk metrics.
          </p>
          {/* Solid button (no glass/gradient) */}
          <Link
            href="/account"
            className="px-6 py-3 rounded-xl font-semibold text-white bg-[#a744fb] hover:bg-[#922de9] transition"
          >
            Track Your Portfolio
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section>
        <div className="section-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="📈 Perpetual Markets" value={loading ? "…" : stats.perpAssets} link="/explorer/assets" />
          <StatsCard title="🪙 Spot Markets" value={loading ? "…" : stats.spotAssets} link="/explorer/spot" />
          <StatsCard title="⚠️ At-Risk Positions" value={loading ? "…" : stats.liquidatable} link="/liquidations" highlight={stats.liquidatable > 0} />
          <StatsCard title="🔐 Active Vaults" value={loading ? "…" : stats.vaults} link="/vaults" />
        </div>
      </section>

      {/* Features */}
      <section>
        <div className="section-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard title="👤 Portfolio Tracking" description="Monitor positions, orders, and balances for any Hyperliquid address" link="/account" />
          <FeatureCard title="📊 Vault Analytics" description="Discover top-performing vaults and analyze their strategies" link="/vaults" />
          <FeatureCard title="🛡️ Risk Monitoring" description="Track liquidatable positions and manage portfolio risk" link="/liquidations" />
          <FeatureCard title="🧭 Asset Explorer" description="Browse all available perpetual markets and their specifications" link="/explorer/assets" />
          <FeatureCard title="🔄 Spot Markets" description="Explore spot trading pairs and token information" link="/explorer/spot" />
          <FeatureCard title="🧪 EVM Explorer" description="Query blockchain data and explore HyperEVM transactions" link="/explorer/evm" />
        </div>
      </section>
    </div>
  );
}

function StatsCard({
  title,
  value,
  link,
  highlight = false,
}: {
  title: string;
  value: string | number;
  link: string;
  highlight?: boolean;
}) {
  return (
    <Link href={link} className="block h-full">
      <div className={`glass rounded-2xl p-6 card-hover h-full flex flex-col justify-between ${highlight ? "ring-2 ring-danger-500" : ""}`}>
        <div className="flex items-start justify-between mb-3">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {highlight && <span className="px-2 py-1 bg-danger-100 text-danger-700 text-xs font-bold rounded-full">Alert</span>}
        </div>
        <p className="text-4xl lg:text-5xl font-bold text-gray-900 leading-none">{value}</p>
      </div>
    </Link>
  );
}

function FeatureCard({ title, description, link }: { title: string; description: string; link: string }) {
  return (
    <Link href={link} className="block h-full">
      <div className="glass rounded-2xl p-6 card-hover h-full flex flex-col">
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-sm text-gray-600 flex-grow">{description}</p>
      </div>
    </Link>
  );
}
