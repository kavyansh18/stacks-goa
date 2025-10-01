"use client";
import React, { useEffect, useState } from "react";
import { getTotalReqs, getReq, Req as ReqBase } from "@/lib/contract";
import {
  registerSolver,
  unregisterSolver,
  isRegistered,
  addCollateral,
} from "@/hook/booSolver";
import {
  setResponse,
  finalizeResponse,
  penalizeSolver,
} from "@/hook/booCore";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import WalletConnect from "@/hook/connectWallet";
import { useVerify } from "@/hook/useVerify";
import { isConnected } from "@stacks/connect";
import { ThreeCircles } from 'react-loader-spinner';

type Req = ReqBase & { verified?: boolean };

const rowVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      ease: "easeOut" as const,
    },
  }),
};

const buttonHoverVariants = {
  hover: {
    scale: 1.05,
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
    transition: {
      duration: 0.2,
      yoyo: Infinity,
    },
  },
  tap: {
    scale: 0.95,
  },
};

const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    boxShadow: ["0px 0px 0px rgba(254, 91, 0, 0)", "0px 0px 10px rgba(254, 91, 0, 0.7)", "0px 0px 0px rgba(254, 91, 0, 0)"],
    transition: {
      duration: 1.5,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop",
    },
  },
};

const App: React.FC = () => {
  const [reqs, setReqs] = useState<Req[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReq, setSelectedReq] = useState<Req | null>(null);
  const [answerInput, setAnswerInput] = useState<string>("");
  const [apiResponse, setApiResponse] = useState<any | null>(null);
  const [registerAmount, setRegisterAmount] = useState<number>(1000000);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [isAddingCollateral, setIsAddingCollateral] = useState<boolean>(false);
  const [isUnregistering, setIsUnregistering] = useState<boolean>(false);
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
  const [showAddCollateralModal, setShowAddCollateralModal] =
    useState<boolean>(false);
  const [isSolverRegistered, setIsSolverRegistered] = useState<boolean | null>(
    null
  );
  const [addCollateralAmount, setAddCollateralAmount] = useState<number>(
    1000000
  );
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const { verifyAnswer, loading: verifyLoading } = useVerify();

  const solverAddress = "ST3J2X81CCA3JFX6HKM10FCJFXT9PW4E7DMQG1D49"; // Hardcoded solver address

  useEffect(() => {
    const fetchReqs = async () => {
      try {
        const totalReqs = await getTotalReqs();
        console.log(`Total requests to fetch: ${totalReqs}`);

        if (totalReqs === 0) {
          setReqs([]);
          console.log("No requests found in the contract.");
          return;
        }

        const fetchPromises = [];
        for (let i = 0; i < totalReqs; i++) {
          fetchPromises.push(getReq(i));
        }

        const results = await Promise.all(fetchPromises);
        const fetchedReqs = results.filter(
          (req): req is Req => req !== null
        ).sort((a, b) => b.id - a.id); // Sort in reverse order

        setReqs(fetchedReqs);
        console.log(
          "All requests fetched and set on the frontend:",
          fetchedReqs
        );
      } catch (err) {
        setError("Failed to fetch requests: " + (err as Error).message);
        console.error("Error fetching requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReqs();
  }, []);

  useEffect(() => {
    const checkStatus = async () => {
      const connected = isConnected();
      setIsWalletConnected(connected);

      if (solverAddress) {
        try {
          const registered = await isRegistered(solverAddress);
          setIsSolverRegistered(registered);
          console.log("Solver Registration Status:", registered);
        } catch (error) {
          console.error("Error checking registration status:", error);
          setIsSolverRegistered(null);
        }
      } else {
        setIsSolverRegistered(null);
      }
    };

    checkStatus();
  }, [solverAddress]);

  const handleRegister = async () => {
    setIsRegistering(true);
    try {
      await registerSolver(registerAmount);
      toast.success("Solver registered successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setIsSolverRegistered(true);
      setShowRegisterModal(false);
    } catch (error) {
      toast.error("Failed to register solver. See console for details.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      console.error("Registration Error:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleUnregister = async () => {
    setIsUnregistering(true);
    try {
      await unregisterSolver();
      toast.success("Solver unregistered successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setIsSolverRegistered(false);
    } catch (error) {
      toast.error("Failed to unregister solver. See console for details.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      console.error("Unregistration Error:", error);
    } finally {
      setIsUnregistering(false);
    }
  };

  const handleAddCollateral = async () => {
    setIsAddingCollateral(true);
    try {
      await addCollateral(addCollateralAmount);
      toast.success("Collateral added successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setShowAddCollateralModal(false);
    } catch (error) {
      toast.error("Failed to add collateral. See console for details.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      console.error("Add Collateral Error:", error);
    } finally {
      setIsAddingCollateral(false);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedReq) {
      const question = selectedReq.request;
      const answer = answerInput;
      const taskId = selectedReq.id;
      const solversAddress = solverAddress;
      const amount = selectedReq.prize;

      setApiResponse(null);
      console.log("Submitting answer to API for verification...");
      const data = await verifyAnswer(question, answer);
      setApiResponse(data);
      console.log("API verification response:", data);

      if (data) {
        setReqs((prevReqs) =>
          prevReqs.map((req) =>
            req.id === selectedReq.id ? { ...req, verified: data.verified } : req
          )
        );

        toast.success(
          `Verification result: ${data.verified ? "Verified" : "Not Verified"}`,
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          }
        );

        if (data.verified) {
          console.log("Verification is true. Calling setResponse...");
          await setResponse(taskId, answer);
          console.log("setResponse function call complete. Now calling finalizeResponse...");
          await finalizeResponse(taskId, solversAddress);
          toast.success("Response finalized successfully!", {
            position: "top-right",
          });
          console.log("finalizeResponse function call complete.");
        } else {
          console.log("Verification is false. Calling penalizeSolver directly...");
          await penalizeSolver(solversAddress, amount);
          toast.error("Solver penalized for incorrect answer.", {
            position: "top-right",
          });
          console.log("penalizeSolver function call complete.");
        }
      } else {
        toast.error("Failed to verify answer.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-gray-100">
        <ThreeCircles
          visible={true}
          height="100"
          width="100"
          color="#FE5B00"
          ariaLabel="three-circles-loading"
          wrapperStyle={{}}
          wrapperClass=""
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-red-400">
        <p className="text-xl">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white text-orange-600 min-h-screen font-mono p-1">
      <ToastContainer />
      {/* Header Section */}
      <header className="flex justify-between items-center py-4 px-8 border-2 border-orange-600 rounded-lg max-w-7xl mx-auto mt-4">
        <div className="text-2xl font-bold flex-grow text-center">
          <span className="text-orange-600">BITCOIN OPTIMISTIC ORACLE (BOO)</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-end">
            {isSolverRegistered === false ? (
              <motion.button
                onClick={() => setShowRegisterModal(true)}
                className="flex items-center border border-orange-600 rounded-full px-4 py-2"
                disabled={!isWalletConnected}
                variants={buttonHoverVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <span className="mr-2">💡</span> Register
              </motion.button>
            ) : isSolverRegistered === true ? (
              <>
                <div className="flex items-center space-x-2">
                  <motion.button
                    onClick={() => setShowAddCollateralModal(true)}
                    className="flex items-center border border-orange-600 rounded-full px-4 py-2"
                    disabled={!isWalletConnected}
                    variants={buttonHoverVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <span className="mr-2">💰</span> Add Collateral
                  </motion.button>
                  <motion.button
                    onClick={handleUnregister}
                    className="flex items-center border border-red-600 text-red-600 rounded-full px-4 py-2"
                    disabled={isUnregistering || !isWalletConnected}
                    variants={buttonHoverVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <span className="mr-2">❌</span> Unregister
                  </motion.button>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">Checking registration...</p>
            )}
          </div>
          <WalletConnect />
        </div>
      </header>

      {/* Description Section */}
      <div className="max-w-7xl mx-auto my-4 text-orange-600 text-sm">
        <p>// Decentralized Oracle Network on Stacks Blockchain</p>
        <p>// Request data • Propose answers • Validate with AI</p>
      </div>

      {/* Main Content Card */}
      <div className="bg-orange-100 border-2 border-orange-600 p-4 rounded-lg max-w-7xl mx-auto">
        {/* Filter and Navigation */}
        <div className="flex items-center justify-between space-x-2 mb-4">
          <div className="flex space-x-2">
            <motion.button
              className="bg-orange-600 text-white rounded-md px-4 py-1"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ALL REQUESTS
            </motion.button>
            <motion.button
              className="border border-orange-600 text-orange-600 rounded-md px-4 py-1"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              TOKEN PRICES
            </motion.button>
            <motion.button
              className="border border-orange-600 text-orange-600 rounded-md px-4 py-1"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              SPORTS SCORES
            </motion.button>
            <motion.button
              className="border border-orange-600 text-orange-600 rounded-md px-4 py-1"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              UNRESOLVED
            </motion.button>
            <motion.button
              className="border border-orange-600 text-orange-600 rounded-md px-4 py-1"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              RESOLVED
            </motion.button>
          </div>
        </div>

        {/* Oracle Request Board Header */}
        <div className="flex justify-between items-center border-b border-orange-600 pb-2 mb-4">
          <h2 className="text-xl font-bold">ORACLE REQUEST BOARD</h2>
          {/* <span className="text-sm">// 5 requests</span>
          <span className="text-sm">Last updated: 8:55:32 PM</span> */}
          <motion.button
            className="border border-orange-600 rounded-full px-3 py-1 text-sm"
            variants={buttonHoverVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <span className="mr-1">🔁</span> REFRESH
          </motion.button>
        </div>

        {/* Filters Section */}
        <div className="flex space-x-4 items-center mb-4 text-sm">
          <span className="text-black font-bold">∇ FILTERS:</span>
          <select className="border border-orange-600 rounded-md px-2 py-1 bg-white">
            <option>All Status</option>
          </select>
          <select className="border border-orange-600 rounded-md px-2 py-1 bg-white">
            <option>All Domains</option>
          </select>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-[50px_1fr_2fr_1fr_120px_120px] gap-4 border-b-2 border-orange-600 pb-2 text-sm font-bold uppercase text-black">
          <div>ID</div>
          <div>REQUESTER</div>
          <div className="ml-8">QUESTION</div>
          <div>PRIZE</div>
          <div>STATUS</div>
          <div className="text-right">ACTIONS</div>
        </div>

        {/* Table Rows (dynamically rendered) */}
        {reqs.length === 0 ? (
          <p className="text-center text-lg text-gray-400">
            No requests found in the contract.
          </p>
        ) : (
          reqs.map((req, index) => {
            const isCompleted = req.response && req.response.length > 0;
            const statusText = isCompleted ? "Completed" : "Pending";
            return (
              <motion.div
                key={req.id.toString()}
                className="grid grid-cols-[50px_1fr_2fr_1fr_120px_120px] gap-4 py-2 border-b border-orange-300 items-center text-sm"
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                custom={index}
              >
                <div className="text-black overflow-hidden truncate">
                  {req.id.toString()}
                </div>
                <div className="text-black overflow-hidden">{req.requester}</div>
                <div className="text-black overflow-hidden truncate ml-8">
                  {req.request}
                </div>
                <div className="text-black overflow-hidden truncate">
                  {req.prize / 1000000} STX
                </div>
                <div className="text-black overflow-hidden ">
                  {statusText}
                </div>
                <div className="text-orange-600 justify-self-end">
                  <motion.button
                    onClick={() => setSelectedReq(req)}
                    className={`px-2 py-1 text-xs border border-orange-600 rounded-full transition-colors duration-200 ${isCompleted ? 'bg-gray-400 text-white cursor-not-allowed' : 'hover:bg-orange-600 hover:text-white'}`}
                    whileHover={{ scale: isCompleted ? 1 : 1.1 }}
                    whileTap={{ scale: isCompleted ? 1 : 0.9 }}
                    disabled={!!isCompleted}
                  >
                    SUBMIT
                  </motion.button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Pop-up Modal */}
      {selectedReq && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="bg-orange-100 border-2 border-orange-600 p-6 rounded-lg shadow-lg w-full max-w-md mx-4"
          >
            <div className="flex justify-between items-center border-b border-orange-600 pb-2 mb-4">
              <h3 className="text-lg font-bold">
                Submit Answer for Request ID: {selectedReq.id.toString()}
              </h3>
              <motion.button
                onClick={() => {
                  setSelectedReq(null);
                  setAnswerInput("");
                  setApiResponse(null);
                }}
                className="text-orange-600 text-xl font-bold"
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.8 }}
              >
                &times;
              </motion.button>
            </div>
            <div className="mb-4">
              <p className="font-bold text-black">Description:</p>
              <p className="text-black break-words">{selectedReq.request}</p>
              <p className="text-orange-600">
                {selectedReq.prize / 1000000} STX
              </p>
            </div>
            <form onSubmit={handleSubmitAnswer}>
              <div className="mb-4">
                <label
                  htmlFor="answer"
                  className="block text-black font-bold mb-2"
                >
                  Your Answer:
                </label>
                <input
                  type="text"
                  id="answer"
                  value={answerInput}
                  onChange={(e) => setAnswerInput(e.target.value)}
                  className="w-full px-3 py-2 border border-orange-600 rounded-md bg-white text-black"
                  required
                />
              </div>
              {verifyLoading ? (
                <div className="text-center text-orange-600 mb-4">
                  Loading verification...
                </div>
              ) : (
                apiResponse && (
                  <div className="mb-4">
                    <p className="text-black font-bold">Verification Status:</p>
                    <p className="text-orange-600">
                      {apiResponse.verified ? "✅ Verified" : "❌ Not Verified"}
                    </p>
                  </div>
                )
              )}
              <div className="flex justify-end">
                <motion.button
                  type="submit"
                  disabled={verifyLoading}
                  className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  SUBMIT ANSWER
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="bg-orange-100 border-2 border-orange-600 p-6 rounded-lg shadow-lg w-full max-w-md mx-4"
          >
            <div className="flex justify-between items-center border-b border-orange-600 pb-2 mb-4">
              <h3 className="text-lg font-bold">Register as a Solver</h3>
              <motion.button
                onClick={() => setShowRegisterModal(false)}
                className="text-orange-600 text-xl font-bold"
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.8 }}
              >
                &times;
              </motion.button>
            </div>
            <div className="mb-4">
              <p className="text-black mb-2">
                Enter the amount of STX you want to stake as collateral to
                become a solver.
              </p>
              <input
                type="number"
                value={registerAmount}
                onChange={(e) => setRegisterAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-orange-600 rounded-md bg-white text-black"
                placeholder="Collateral amount in uSTX"
                min="0"
              />
              <p className="text-sm mt-2 text-gray-500">
                1 STX = 1,000,000 uSTX
              </p>
            </div>
            <div className="flex justify-end">
              <motion.button
                onClick={handleRegister}
                disabled={isRegistering}
                className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isRegistering ? "Staking..." : "Stake Collateral"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Collateral Modal */}
      {showAddCollateralModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="bg-orange-100 border-2 border-orange-600 p-6 rounded-lg shadow-lg w-full max-w-md mx-4"
          >
            <div className="flex justify-between items-center border-b border-orange-600 pb-2 mb-4">
              <h3 className="text-lg font-bold">Add Collateral</h3>
              <motion.button
                onClick={() => setShowAddCollateralModal(false)}
                className="text-orange-600 text-xl font-bold"
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.8 }}
              >
                &times;
              </motion.button>
            </div>
            <div className="mb-4">
              <p className="text-black mb-2">
                Enter the additional amount of STX you want to stake.
              </p>
              <input
                type="number"
                value={addCollateralAmount}
                onChange={(e) => setAddCollateralAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-orange-600 rounded-md bg-white text-black"
                placeholder="Collateral amount in uSTX"
                min="0"
              />
              <p className="text-sm mt-2 text-gray-500">
                1 STX = 1,000,000 uSTX
              </p>
            </div>
            <div className="flex justify-end">
              <motion.button
                onClick={handleAddCollateral}
                disabled={isAddingCollateral}
                className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isAddingCollateral ? "Adding..." : "Add Collateral"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default App;