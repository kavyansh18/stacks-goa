"use client";

import WalletConnect, { connectWallet } from "@/hook/connectWallet";

export default function Connect() {
  return (
    <div>
      <WalletConnect />
    </div>
  );
}
