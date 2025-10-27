"use client";

import { useState } from "react";
import { isValidAddress, formatAddress } from "../lib/utils";

interface AddressInputProps {
  onSubmit: (address: string) => void;
  loading?: boolean;
  savedAddresses?: string[];
  onRemoveAddress?: (address: string) => void;
}

export default function AddressInput({
  onSubmit,
  loading = false,
  savedAddresses = [],
  onRemoveAddress,
}: AddressInputProps) {
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!address) {
      setError("Please enter an address");
      return;
    }

    if (!isValidAddress(address)) {
      setError("Invalid Ethereum address");
      return;
    }

    onSubmit(address);
  };

  const handleQuickSelect = (addr: string) => {
    setAddress(addr);
    onSubmit(addr);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6">
        <label htmlFor="walletAddress" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Wallet Address
        </label>
        <div className="flex gap-2">
          <input
            id="walletAddress"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..."
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all font-mono"
            disabled={loading}
            aria-invalid={!!error}
            aria-describedby={error ? "addr-error" : undefined}
            spellCheck={false}
          />
          {/* SOLID BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold text-white bg-[#a744fb] hover:bg-[#922de9] rounded-lg sm:rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? "Loading..." : "Load"}
          </button>
        </div>
        {error && (
          <p id="addr-error" className="mt-2 text-xs sm:text-sm text-danger-600">
            {error}
          </p>
        )}
      </form>

      {savedAddresses.length > 0 && (
        <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-3">Saved Addresses</h3>
          <div className="flex flex-wrap gap-2">
            {savedAddresses.map((addr) => (
              <div
                key={addr}
                className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => handleQuickSelect(addr)}
                  className="text-xs sm:text-sm font-mono text-brand-700 hover:text-brand-800"
                  title={addr}
                >
                  {formatAddress(addr)}
                </button>
                {onRemoveAddress && (
                  <button
                    type="button"
                    onClick={() => onRemoveAddress(addr)}
                    className="text-danger-600 hover:text-danger-700 text-base sm:text-lg leading-none"
                    aria-label={`Remove ${addr}`}
                    title="Remove"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
