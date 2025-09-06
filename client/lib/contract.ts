import { STACKS_TESTNET } from "@stacks/network";
import {
  fetchCallReadOnlyFunction,
  OptionalCV,
  PrincipalCV,
  StringAsciiCV,
  uintCV,
  UIntCV,
  TupleCV,
} from "@stacks/transactions";

const CONTRACT_ADDRESS = "ST3J2X81CCA3JFX6HKM10FCJFXT9PW4E7DMQG1D49";
const CONTRACT_NAME = "boo-core-v0_0_1";

type ReqCV = {
  requester: PrincipalCV;
  request: StringAsciiCV;
  response: OptionalCV<PrincipalCV>;
  prize: UIntCV;
};

export type Req = {
  id: number;
  requester: string;
  request: string;
  response: string | null;
  prize: number;
};

export async function getAllReqs() {
  try {
    const latestIdCV = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "get-total-req",
      functionArgs: [],
      senderAddress: CONTRACT_ADDRESS,
      network: STACKS_TESTNET,
    });

    console.log("Raw response from get-total-req:", latestIdCV);

    let latestId: number;
    if (latestIdCV.type === "ok" && latestIdCV.value.type === "uint") {
      latestId = parseInt(latestIdCV.value.value.toString());
    } else if (latestIdCV.type === "none") {
      console.log("get-total-req returned (none), assuming 0 requests");
      latestId = 0;
    } else {
      console.error("get-total-req returned unexpected type:", latestIdCV.type);
      latestId = 0;
    }

    if (isNaN(latestId)) {
      console.error("Parsed latestId is NaN, raw value:", latestIdCV);
      latestId = 0;
    }

    console.log(`Total requests from get-total-req: ${latestId}`);

    const reqs: Req[] = [];

    for (let i = 0; i < latestId; i++) {
      const req = await getReq(i);
      if (req) {
        console.log(`Request ID ${i}:`, req);
        reqs.push(req);
      } else {
        console.log(`Request ID ${i} returned null`);
      }
    }

    console.log("Final requests array:", reqs);
    return reqs;
  } catch (error) {
    console.error("Error in getAllReqs:", error);
    return [];
  }
}

export async function getReq(id: number) {
  try {
    const reqDetails = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "get-data",
      functionArgs: [uintCV(id)],
      senderAddress: CONTRACT_ADDRESS,
      network: STACKS_TESTNET,
    });

    const responseCV = reqDetails as any; // Temporarily use 'any' due to 'ok' wrapper
    console.log(`ResponseCV for ID ${id}:`, responseCV);

    // Unwrap the 'ok' response
    if (responseCV.type !== "ok") {
      console.log(`Request ID ${id} has unexpected type: ${responseCV.type}`);
      return null;
    }

    const innerCV = responseCV.value as OptionalCV<TupleCV<ReqCV>>;
    if (innerCV.type === "none") {
      console.log(`Request ID ${id} is none (no data)`);
      return null;
    }

    if (innerCV.type !== "some" || innerCV.value.type !== "tuple") {
      console.log(`Request ID ${id} has unexpected inner type: ${innerCV.value?.type}`);
      return null;
    }

    const resCV = innerCV.value;

    const req: Req = {
      id: id,
      //@ts-ignore
      requester: resCV.requester.value,
      //@ts-ignore
      request: resCV.request.value,
      //@ts-ignore
      response: resCV.response.type === "some" ? resCV.response.value.value : null,
      //@ts-ignore
      prize: parseInt(resCV.prize.value.toString()),
    };

    return req;
  } catch (error) {
    console.error(`Error fetching request ID ${id}:`, error);
    return null;
  }
}