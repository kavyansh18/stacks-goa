"use client";
import React, { useState } from "react";
import WalletConnect, { connectWallet } from "@/hook/connectWallet";
import { requestData } from "@/hook/booCore";
import { getStxBalance } from "@/lib/stx-utils";

export default function Connect() {
  const [textInput, setTextInput] = useState<string>("");
  const [numberInput, setNumberInput] = useState<number>(0);
  const [address, setAddress] = useState<string>("");
  const [balance, setBalance] = useState<number>(0); // State for balance
  const [error, setError] = useState<string | null>(null); // State for error messages

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    requestData(textInput, numberInput);
  };

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error("Connection failed:", error);
      setError("Failed to connect wallet");
    }
  };

  const getBalance = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    setBalance(0); // Clear previous balance
    try {
      if (!address) {
        setError("Please enter a valid address");
        return;
      }
      const balanceResult = await getStxBalance(address); // Await the async call
      setBalance(balanceResult); // Store the balance in state
    } catch (error) {
      console.error("Failed to fetch balance:", error);
      setError("Failed to fetch balance. Please check the address and try again.");
    }
  };

  return (
    <div>
      <WalletConnect />
      <button
        type="button"
        onClick={handleConnect}
        style={{ marginTop: "10px" }}
      >
        Connect Wallet
      </button>
      <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
        <label>
          String Input:
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Number Input:
          <input
            type="number"
            value={numberInput}
            onChange={(e) => setNumberInput(Number(e.target.value))}
            required
          />
        </label>
        <br />
        <button type="submit">Submit</button>
      </form>
      <form onSubmit={getBalance} style={{ marginTop: "20px" }}>
        <label>
          Address:
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter STX address"
          />
        </label>
        <button type="submit">Get Balance</button>
      </form>
      {balance && <p>Balance: {balance} STX</p>} {/* Display balance */}
      {error && <p style={{ color: "red" }}>{error}</p>} {/* Display error */}
    </div>
  );
}