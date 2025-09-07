import { request } from "@stacks/connect";
import { networkFromName } from "@stacks/network";
import { getAddressFromPrivateKey } from "@stacks/transactions";
import { generateWallet } from "@stacks/wallet-sdk";

export async function getPrivKey() {
  const wallet = await generateWallet({
    secretKey:
      "address wheel noble monster worry finger fantasy catch humble joy arrest attack profit alien fatal hidden gadget zoo recipe cycle other ahead chase hospital",
    password: "test-password",
  });

  const privKey = wallet.accounts[0].stxPrivateKey;

  return privKey;
}

export async function getUserAddress() {
  const priv = await getPrivKey();
  const address = getAddressFromPrivateKey(priv, networkFromName("testnet"));

  return address;
}
