import { request } from "@stacks/connect";
import { STACKS_TESTNET } from "@stacks/network";
import { Cl, cvToJSON, fetchCallReadOnlyFunction } from "@stacks/transactions";

const CONTRACT_ADDRESS = "ST3J2X81CCA3JFX6HKM10FCJFXT9PW4E7DMQG1D49";
const CONTRACT_NAME = "boo-solver-v0_0_1";

export async function registerSolver(amount: number) {
  const functionArgs = [Cl.uint(amount)];
  try {
    const response = await request("stx_callContract", {
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName: "register-solver",
      functionArgs: functionArgs,
      network: "testnet",
      postConditionMode: "allow",
    });
    console.log("Response from register-solver:", response);
  } catch (error) {
    console.error("Error registering solver:", error);
    throw error;
  }
}

export async function addCollateral(amount: number) {
  const functionArgs = [Cl.uint(amount)];
  try {
    const response = await request("stx_callContract", {
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName: "add-collateral",
      functionArgs: functionArgs,
      network: "testnet",
      postConditionMode: "allow",
    });
    console.log("Response from add-collateral:", response);
  } catch (error) {
    console.error("Error adding collateral:", error);
    throw error;
  }
}

export async function unregisterSolver() {
  try {
    const response = await request("stx_callContract", {
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName: "unregister-solver",
      functionArgs: [],
      network: "testnet",
      postConditionMode: "allow",
    });
    console.log("Response from unregister-solver:", response);
  } catch (error) {
    console.error("Error unregistering solver:", error);
    throw error;
  }
}

export async function slashSolver(solver: string, amount: number) {
  const functionArgs = [Cl.principal(solver), Cl.uint(amount)];
  try {
    const response = await request("stx_callContract", {
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName: "slash-solver",
      functionArgs: functionArgs,
      network: "testnet",
      postConditionMode: "allow",
    });
    console.log("Response from slash-solver:", response);
  } catch (error) {
    console.error("Error slashing solver:", error);
    throw error;
  }
}

export async function getCollateral(solver: string) {
  try {
    const reqDetails = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "get-stx-balance",
      functionArgs: [Cl.principal(solver)],
      senderAddress: CONTRACT_ADDRESS,
      network: STACKS_TESTNET,
    });

    const balance = cvToJSON(reqDetails);
    console.log(balance);
  } catch (error) {
    console.error(`Error fetching request `, error);
    return null;
  }
}

export async function isRegistered(solver: string) {
  try {
    const reqDetails = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "is-registered",
      functionArgs: [Cl.principal(solver)],
      senderAddress: CONTRACT_ADDRESS,
      network: STACKS_TESTNET,
    });

    const balance = cvToJSON(reqDetails);
    console.log(balance);
  } catch (error) {
    console.error(`Error fetching request `, error);
    return null;
  }
}
