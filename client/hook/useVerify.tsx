"use client";
import { useState } from "react";
export const useVerify = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const verifyAnswer = async (question: string, answer: string) => {
    setLoading(true);
    setError(null);
    setData(null);

    const endpoint = "https://9b7da07975a9.ngrok-free.app/verify";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
          answer: answer,
        }),
      });

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("API Response Data:", responseData);
      setData(responseData);
      return responseData;
    } catch (err: any) {
      console.error("Error verifying answer:", err);
      setError(err.message || "An unknown error occurred.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { verifyAnswer, data, loading, error };
};
