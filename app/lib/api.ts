const QUICKNODE_URL = process.env.NEXT_PUBLIC_QUICKNODE_URL || "";

export const api = {
  /**
   * Call QuickNode Info endpoint
   */
  async info(body: any) {
    if (!QUICKNODE_URL) {
      throw new Error("NEXT_PUBLIC_QUICKNODE_URL not configured");
    }

    const response = await fetch(`${QUICKNODE_URL}/info`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Info API Error (${response.status}): ${error}`);
    }

    return response.json();
  },

  /**
   * Call QuickNode EVM endpoint
   */
  async evm(body: any) {
    if (!QUICKNODE_URL) {
      throw new Error("NEXT_PUBLIC_QUICKNODE_URL not configured");
    }

    const response = await fetch(`${QUICKNODE_URL}/evm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`EVM API Error (${response.status}): ${error}`);
    }

    return response.json();
  },
};

// Storage utilities for saving wallet addresses
export const storage = {
  ADDRESSES_KEY: "hyperliquid_addresses",

  getAddresses(): string[] {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(this.ADDRESSES_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveAddress(address: string): void {
    const addresses = this.getAddresses();
    if (!addresses.includes(address)) {
      addresses.push(address);
      localStorage.setItem(this.ADDRESSES_KEY, JSON.stringify(addresses));
    }
  },

  removeAddress(address: string): void {
    const addresses = this.getAddresses().filter((a) => a !== address);
    localStorage.setItem(this.ADDRESSES_KEY, JSON.stringify(addresses));
  },

  clearAddresses(): void {
    localStorage.removeItem(this.ADDRESSES_KEY);
  },
};