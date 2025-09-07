import { STACKS_TESTNET } from "@stacks/network";
import {
  fetchCallReadOnlyFunction,
  OptionalCV,
  PrincipalCV,
  StringAsciiCV,
  uintCV,
  UIntCV,
  TupleCV,
  ClarityValue,
  ResponseOkCV,
  someCV,
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

export async function getAllReqs(): Promise<Req[]> {
  try {
    const latestIdCV: ClarityValue = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "get-total-req",
      functionArgs: [],
      senderAddress: CONTRACT_ADDRESS,
      network: STACKS_TESTNET,
    });

    console.log("Raw response from get-total-req:", latestIdCV);

    let latestId = 0;
    const typedLatestIdCV = latestIdCV as ResponseOkCV<UIntCV>;
    if (typedLatestIdCV.type === "ok" && typedLatestIdCV.value.type === "uint") {
      latestId = Number(typedLatestIdCV.value.value);
    } else {
      console.error("get-total-req returned unexpected type:", latestIdCV);
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

export async function getReq(id: number): Promise<Req | null> {
  try {
    const reqDetails = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "get-data",
      functionArgs: [uintCV(id)],
      senderAddress: CONTRACT_ADDRESS,
      network: STACKS_TESTNET,
    });

    const responseCV = reqDetails as any;
    console.log(`ResponseCV for ID ${id}:`, responseCV);

    if (responseCV.type !== "ok" || responseCV.value.type !== "some" || responseCV.value.value.type !== "tuple") {
      console.log(`Request ID ${id} is not a valid tuple`);
      return null;
    }

    const resCV = responseCV.value.value;

    const req: Req = {
      id: id,
      requester: resCV.requester.value,
      request: resCV.request.value,
      response: resCV.response.type === "some" ? resCV.response.value.value : null,
      prize: Number(resCV.prize.value),
    };

    return req;
  } catch (error) {
    console.error(`Error fetching request ID ${id}:`, error);
    return null;
  }
}