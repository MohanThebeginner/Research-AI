"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/healthcheck`)
      .then((res) => setStatus(res.data.status))
      .catch(() => setStatus("backend not reachable"));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">ResearchAI</h1>
      <p>Backend status: {status}</p>
    </main>
  );
}
