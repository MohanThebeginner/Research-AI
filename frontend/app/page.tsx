"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import Button from "@/components/ui/Button";

export default function Home() {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/healthcheck`)
      .then((res) => setStatus(res.data.status))
      .catch(() => setStatus("offline"));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 px-6">
      <div className="max-w-xl text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-primary">
          AI Research Assistant
        </p>
        <h1 className="mb-4 font-display text-4xl font-semibold text-ink">
          Read less. Understand more.
        </h1>
        <p className="text-base leading-relaxed text-muted">
          Upload a document, get an instant summary, and ask follow-up questions
          grounded in the source material — not a guess.
        </p>
      </div>

      <div className="flex gap-3">
        <Link href="/register">
          <Button variant="primary">Get started</Button>
        </Link>
        <Link href="/login">
          <Button variant="secondary">Log in</Button>
        </Link>
      </div>

      <p className="font-mono text-xs uppercase tracking-wider text-muted">
        Backend status: {status}
      </p>
    </main>
  );
}
