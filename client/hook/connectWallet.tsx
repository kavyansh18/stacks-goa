import { useState } from "react";
import { connect, disconnect, isConnected } from "@stacks/connect";

async function connecteWallet() {
  if (isConnected()) {
    disconnect();
    return;
  }
  const response = await connect();

  // const address = await a
}

export default function ConnectWallet() {
  const [address, setAddress] = useState("");

  // const handleWalletConnect = async () => {
  //     const addr = await
  // }
}
