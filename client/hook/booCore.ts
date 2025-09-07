import { getPrivKey } from "@/lib/priv-key";
import {
  AnchorMode,
  broadcastTransaction,
  Cl,
  makeContractCall,
  SignedContractCallOptions,
  SignedMultiSigContractCallOptions,
} from "@stacks/transactions";

const CONTRACT_ADDRESS = "ST3J2X81CCA3JFX6HKM10FCJFXT9PW4E7DMQG1D49";
const CONTRACT_NAME = "boo-core-v0_0_1";

export async function requestData(req: string, prizeAmount: number) {
  const functionArgs = [Cl.stringAscii(req), Cl.uint(prizeAmount)];
  const privKey = await getPrivKey();

  const txOptions:
    | SignedContractCallOptions
    | SignedMultiSigContractCallOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "request-data",
    functionArgs: functionArgs,
    senderKey: privKey,
    network: "testnet",
    // anchorMode: AnchorMode.Any,
    // amount: prizeAmount,
  };

  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction({ transaction });

  console.log("Transaction broadcasted:", broadcastResponse.txid);
}
