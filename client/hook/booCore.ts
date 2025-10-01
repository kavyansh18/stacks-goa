import { STACKS_TESTNET } from "@stacks/network";
import { Cl, cvToJSON, fetchCallReadOnlyFunction } from "@stacks/transactions";

import { request } from "@stacks/connect";

const CONTRACT_ADDRESS = "ST3J2X81CCA3JFX6HKM10FCJFXT9PW4E7DMQG1D49";
const CONTRACT_NAME = "boo-core-v0_0_1";

export async function requestData(req: string, prizeAmount: number) {
  const functionArgs = [Cl.stringAscii(req), Cl.uint(prizeAmount)];
  try {
    const response = await request("stx_callContract", {
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName: "request-data",
      functionArgs: functionArgs,
      network: "testnet",
      postConditionMode: "allow",
    });
    console.log("Response from request:", response);
  } catch (error) {
    console.error("Error requesting data:", error);
    throw error;
  }
}

export async function setResponse(id: number, responseStr: string) { //initailize response
  const functionArgs = [Cl.uint(id), Cl.stringAscii(responseStr)];
  try {
    const response = await request("stx_callContract", {
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName: "set-response",
      functionArgs: functionArgs,
      network: "testnet",
      postConditionMode: "allow",
    });
    console.log("Response from set-response:", response);
  } catch (error) {
    console.error("Error setting response:", error);
    throw error;
  }
}

export async function finalizeResponse(id: number, solver: string) { //if verified
  const functionArgs = [Cl.uint(id), Cl.principal(solver)];
  try {
    const response = await request("stx_callContract", {
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName: "finalize-response",
      functionArgs: functionArgs,
      network: "testnet",
      postConditionMode: "allow",
    });
    console.log("Response from finalize-response:", response);
  } catch (error) {
    console.error("Error finalizing response:", error);
    throw error;
  }
}

export async function penalizeSolver(solver: string, amount: number) { //if not verified
  const functionArgs = [Cl.principal(solver), Cl.uint(amount)];
  try {
    const response = await request("stx_callContract", {
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName: "penalize-solver",
      functionArgs: functionArgs,
      network: "testnet",
      postConditionMode: "allow",
    });
    console.log("Response from penalize-solver:", response);
  } catch (error) {
    console.error("Error penalizing solver:", error);
    throw error;
  }
}

export async function getSTXBalance(address: string) {
  try {
    const reqDetails = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "get-stx-balance",
      functionArgs: [Cl.principal(address)],
      senderAddress: CONTRACT_ADDRESS,
      network: STACKS_TESTNET,
    });

    const balance = cvToJSON(reqDetails);
    console.log(balance);
    return balance;
  } catch (error) {
    console.error(`Error fetching request `, error);
    return null;
  }
}
