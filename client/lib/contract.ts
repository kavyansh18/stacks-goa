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
  const latestIdCV = (await fetchCallReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "get-total-req",
    functionArgs: [],
    senderAddress: CONTRACT_ADDRESS,
    network: STACKS_TESTNET,
  })) as UIntCV;

  const latestId = parseInt(latestIdCV.value.toString());

  const reqs: Req[] = [];

  for (let i = 0; i < latestId; i++) {
    const req = await getReq(i);
    if (req) reqs.push(req);
  }

  return reqs;
}

export async function getReq(id: number) {
  const reqDetails = await fetchCallReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "get-data",
    functionArgs: [uintCV(id)],
    senderAddress: CONTRACT_ADDRESS,
    network: STACKS_TESTNET,
  });

  const responseCV = reqDetails as OptionalCV<TupleCV<ReqCV>>;

  if (responseCV.type === "none") return null;

  if (responseCV.value.type === "tuple") return null;

  const resCV = responseCV.value.value;

  const req: Req = {
    id: id,
    requester: resCV["requester"].value,
    request: resCV["request"].value,
    response:
      resCV["response"].type === "some" ? resCV["response"].value.value : null,
    prize: parseInt(resCV["prize"].value.toString()),
  };

  return req;
}
