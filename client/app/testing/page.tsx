"use client";
import React, { useEffect, useState } from "react";
import { getAllReqs, getReq, Req } from "@/lib/contract";

const App: React.FC = () => {
  const [reqs, setReqs] = useState<Req[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReqs = async () => {
      try {
        const allReqs = await getAllReqs();
        console.log("data on fe", allReqs)
        if (allReqs.length > 0) {
          setReqs(allReqs);
        } else {
          // Fallback to fetching ID 0 if getAllReqs returns empty
          const singleReq = await getReq(0);
          if (singleReq) {
            setReqs([singleReq]);
          }
        }
      } catch (err) {
        setError("Failed to fetch requests: " + (err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchReqs();
  }, []);

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
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-purple-400">
          Stacks Contract Data Viewer 🔮
        </h1>
        {reqs.length === 0 ? (
          <p className="text-center text-lg text-gray-400">
            No requests found in the contract.
          </p>
        ) : (
          <div className="space-y-8">
            {reqs.map((req, index) => (
              <div
                key={req.id}
                className="bg-gray-800 rounded-xl p-6 shadow-2xl hover:shadow-purple-500/30 transition-shadow duration-300"
              >
                <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-4">
                  <h2 className="text-2xl font-semibold text-cyan-400">
                    Request ID:{" "}
                    <span className="text-white">{req.id.toString()}</span>
                  </h2>
                  <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Active
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="p-4 bg-gray-700 rounded-lg shadow-inner">
                    <p className="text-sm text-gray-400 font-medium">
                      Requester
                    </p>
                    <p className="font-mono text-sm break-all mt-1 text-yellow-300">
                      {req.requester}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg shadow-inner">
                    <p className="text-sm text-gray-400 font-medium">Request</p>
                    <p className="font-mono text-md break-words mt-1 text-green-300">
                      "{req.request}"
                    </p>
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg shadow-inner">
                    <p className="text-sm text-gray-400 font-medium">Prize</p>
                    <p className="font-mono text-md mt-1 text-red-300">
                      {req.prize.toString()}n
                    </p>
                  </div>
                  <div className="col-span-1 md:col-span-2 lg:col-span-3 p-4 bg-gray-700 rounded-lg shadow-inner">
                    <p className="text-sm text-gray-400 font-medium">Response</p>
                    <p className="font-mono text-md break-words mt-1 text-blue-300">
                      {req.response || "None"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;