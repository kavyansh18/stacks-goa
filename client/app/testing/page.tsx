"use client";
import React, { useEffect, useState } from "react";
import { getTotalReqs, getReq, Req } from "@/lib/contract";
import { motion } from "framer-motion";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const rowVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1, 
    },
  }),
};

const App: React.FC = () => {
  const [reqs, setReqs] = useState<Req[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReq, setSelectedReq] = useState<Req | null>(null);

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
        const fetchedReqs = results.filter((req): req is Req => req !== null);
        
        setReqs(fetchedReqs);
        console.log("All requests fetched and set on the frontend:", fetchedReqs);

      } catch (err) {
        setError("Failed to fetch requests: " + (err as Error).message);
        console.error("Error fetching requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReqs();
  }, []);

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to handle form submission
    toast.success("submitted thokchom", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    setSelectedReq(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-100">
        <p className="text-xl">Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-red-400">
        <p className="text-xl">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white text-orange-600 min-h-screen font-mono p-4">
      <ToastContainer />
      {/* Header Section */}
      <header className="flex justify-between items-center py-4 px-8 border-2 border-orange-600 rounded-lg max-w-7xl mx-auto mt-4">
        <div className="text-2xl font-bold flex-grow text-center">
          <span className="text-orange-600">OPTIMISTIC ORACLE v2.1</span>
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center border border-orange-600 rounded-full px-4 py-2">
            <span className="mr-2">💡</span> DARK
          </button>
          <button className="flex items-center border border-orange-600 rounded-full px-4 py-2">
            <span className="mr-2">🔗</span> CONNECT WALLET
          </button>
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
            <button className="bg-orange-600 text-white rounded-md px-4 py-1">ALL REQUESTS</button>
            <button className="border border-orange-600 text-orange-600 rounded-md px-4 py-1">TOKEN PRICES</button>
            <button className="border border-orange-600 text-orange-600 rounded-md px-4 py-1">SPORTS SCORES</button>
            <button className="border border-orange-600 text-orange-600 rounded-md px-4 py-1">UNRESOLVED</button>
            <button className="border border-orange-600 text-orange-600 rounded-md px-4 py-1">RESOLVED</button>
          </div>
        </div>

        {/* Oracle Request Board Header */}
        <div className="flex justify-between items-center border-b border-orange-600 pb-2 mb-4">
          <h2 className="text-xl font-bold">ORACLE REQUEST BOARD</h2>
          <span className="text-sm">// 5 requests</span>
          <span className="text-sm">Last updated: 8:55:32 PM</span>
          <button className="border border-orange-600 rounded-full px-3 py-1 text-sm">
            <span className="mr-1">🔁</span> REFRESH
          </button>
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
<div className="grid grid-cols-[50px_1fr_2fr_1fr_120px] gap-4 border-b-2 border-orange-600 pb-2 text-sm font-bold uppercase text-black">
          <div>ID</div>
          <div>REQUESTER</div>
          <div className="ml-8">QUESTION</div>
          <div>PRIZE</div>
          <div className="text-right">SUBMIT ANSWER</div>
        </div>

        {/* Table Rows (dynamically rendered) */}
        {reqs.length === 0 ? (
          <p className="text-center text-lg text-gray-400">
            No requests found in the contract.
          </p>
        ) : (
          reqs.map((req, index) => (
            <motion.div
              key={req.id.toString()}
              className="grid grid-cols-[50px_1fr_2fr_1fr_120px] gap-4 py-2 border-b border-orange-300 items-center text-sm"
              variants={rowVariants}
              initial="hidden"
              animate="visible"
              custom={index}
            >
              <div className="text-black overflow-hidden truncate">{req.id.toString()}</div>
              <div className="text-black overflow-hidden">{req.requester}</div>
              <div className="text-black overflow-hidden truncate ml-8">{req.request}</div>
              <div className="text-black overflow-hidden truncate">{(req.prize)/1000000} STX</div>
              <div className="text-orange-600 justify-self-end">
                <button
                  onClick={() => setSelectedReq(req)}
                  className="px-2 py-1 text-xs border border-orange-600 rounded-full hover:bg-orange-600 hover:text-white transition-colors duration-200"
                >
                  SUBMIT
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pop-up Modal */}
      {selectedReq && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-orange-100 border-2 border-orange-600 p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="flex justify-between items-center border-b border-orange-600 pb-2 mb-4">
              <h3 className="text-lg font-bold">Submit Answer for Request ID: {selectedReq.id.toString()}</h3>
              <button
                onClick={() => setSelectedReq(null)}
                className="text-orange-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>
            <div className="mb-4">
              <p className="font-bold text-black">Description:</p>
              <p className="text-black break-words">{selectedReq.request}</p>
              <p className="text-orange-600">{(selectedReq.prize)/1000000} STX</p>
            </div>
            <form onSubmit={handleSubmitAnswer}>
              <div className="mb-4">
                <label htmlFor="answer" className="block text-black font-bold mb-2">
                  Your Answer:
                </label>
                <input
                  type="text"
                  id="answer"
                  className="w-full px-3 py-2 border border-orange-600 rounded-md bg-white text-black"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors duration-200"
                >
                  SUBMIT ANSWER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;