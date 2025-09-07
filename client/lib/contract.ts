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

export async function getTotalReqs(): Promise<number> {
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

    console.log(`Total requests from get-total-req formatted: ${latestId}`);

    return latestId;
  } catch (error) {
    console.error("Error in getTotalReqs:", error);
    return 0;
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

    if (!responseCV || responseCV.type !== "ok" || !responseCV.value) {
      console.error(`getReq for ID ${id} failed: Response is not "ok" or value is missing.`);
      return null;
    }

    if (responseCV.value.type !== "some" || !responseCV.value.value) {
      console.warn(`Request ID ${id} is none (no data).`);
      return null;
    }

    if (responseCV.value.value.type !== "tuple") {
      console.error(`getReq for ID ${id} failed: Inner value's value is not "tuple" but "${responseCV.value.value.type}".`);
      return null;
    }

    const resCV = responseCV.value.value as TupleCV<ReqCV>;
    const resData = resCV.value as any; 

    if (!resData.requester || !resData.request || !resData.response || !resData.prize) {
        console.error(`Request ID ${id} is missing expected properties.`);
        return null;
    }

    const req: Req = {
      id: id,
      requester: resData.requester.value,
      request: resData.request.value,
      response:
        resData.response.type === "some" ? resData.response.value.value : null,
      prize: parseInt(resData.prize.value.toString()),
    };

    return req;
  } catch (error) {
    console.error(`Error fetching request ID ${id}:`, error);
    return null;
  }
}