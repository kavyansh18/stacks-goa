import { request } from "@stacks/connect";
import { Cl } from "@stacks/transactions";

const CONTRACT_ADDRESS = "ST3J2X81CCA3JFX6HKM10FCJFXT9PW4E7DMQG1D49";
const CONTRACT_NAME = "boo-core-v0_0_1";

export async function fundRequest(
  id: number,
  amount: number,
  requester: string
) {
  const functionArgs = [Cl.uint(id), Cl.uint(amount), Cl.principal(requester)];
  try {
    const response = await request("stx_callContract", {
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName: "fund-request",
      functionArgs: functionArgs,
      network: "testnet",
      postConditionMode: "allow",
    });
    console.log("Response from fund-request:", response);
  } catch (error) {
    console.error("Error funding request:", error);
    throw error;
  }
}

export async function rewardSolver(solver: string, amount: number, id: number) {
  const functionArgs = [Cl.principal(solver), Cl.uint(amount), Cl.uint(id)];
  try {
    const response = await request("stx_callContract", {
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName: "reward-solver",
      functionArgs: functionArgs,
      network: "testnet",
      postConditionMode: "allow",
    });
    console.log("Response from reward-solver:", response);
  } catch (error) {
    console.error("Error rewarding solver:", error);
    throw error;
  }
}
