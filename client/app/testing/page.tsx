"use client";
import React, { useEffect, useState } from "react";
import { getAllReqs, getReq, Req } from "@/lib/contract";

const App: React.FC = () => {
  const [reqs, setReqs] = useState<Req[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  useEffect(() => {
    const fetchReqs = async () => {
      try {
        setDebugInfo((prev) => [...prev, "Fetching all requests..."]);
        const allReqs = await getAllReqs();
        setDebugInfo((prev) => [
          ...prev,
          `Received ${allReqs.length} requests from getAllReqs`,
        ]);

        // If no requests, try fetching ID 0 directly for debugging
        if (allReqs.length === 0) {
          setDebugInfo((prev) => [
            ...prev,
            "No requests found, attempting to fetch request ID 0 directly...",
          ]);
          const singleReq = await getReq(0);
          if (singleReq) {
            setDebugInfo((prev) => [...prev, "Found request ID 0 directly"]);
            setReqs([singleReq]);
          } else {
            setDebugInfo((prev) => [...prev, "Request ID 0 returned null"]);
          }
        } else {
          setReqs(allReqs);
        }
      } catch (err) {
        const errorMessage = "Failed to fetch requests: " + (err as Error).message;
        setError(errorMessage);
        setDebugInfo((prev) => [...prev, errorMessage]);
      } finally {
        setLoading(false);
      }
    };

    fetchReqs();
  }, []);

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: "20px" }}>
        <h1>Error</h1>
        <p>{error}</p>
        <h2>Debug Info</h2>
        <ul>
          {debugInfo.map((info, index) => (
            <li key={index}>{info}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Requests from Contract</h1>
      {reqs.length === 0 ? (
        <p>No requests found in the contract. Check console logs and debug info for details.</p>
      ) : (
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #ddd" }}>
              <th style={{ padding: "8px", textAlign: "left" }}>ID</th>
              <th style={{ padding: "8px", textAlign: "left" }}>Requester</th>
              <th style={{ padding: "8px", textAlign: "left" }}>Request</th>
              <th style={{ padding: "8px", textAlign: "left" }}>Response</th>
              <th style={{ padding: "8px", textAlign: "left" }}>Prize</th>
            </tr>
          </thead>
          <tbody>
            {reqs.map((req) => (
              <tr key={req.id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "8px" }}>{req.id}</td>
                <td style={{ padding: "8px" }}>{req.requester}</td>
                <td style={{ padding: "8px" }}>{req.request}</td>
                <td style={{ padding: "8px" }}>{req.response || "None"}</td>
                <td style={{ padding: "8px" }}>{req.prize}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <h2>Debug Info</h2>
      <ul>
        {debugInfo.map((info, index) => (
          <li key={index}>{info}</li>
        ))}
      </ul>
      <p>
        <strong>Note:</strong> This is a read-only interaction with the Stacks testnet contract at address{" "}
        <code>ST3J2X81CCA3JFX6HKM10FCJFXT9PW4E7DMQG1D49.boo-core-v0_0_1</code>. No wallet
        connection is required, as the functions <code>getAllReqs</code> and <code>getReq</code> use
        read-only calls via <code>fetchCallReadOnlyFunction</code> from the @stacks/transactions
        library. If write operations (e.g., submitting a new request) were needed, a wallet connection
        using @stacks/connect would be required for signing transactions.
      </p>
    </div>
  );
};

export default App;