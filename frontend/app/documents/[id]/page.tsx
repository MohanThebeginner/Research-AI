"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

export default function DocumentDetailPage() {
  const { id } = useParams();
  const [document, setDocument] = useState<any>(null);
  const [summary, setSummary] = useState("");
  const [summarizing, setSummarizing] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);

  const fetchDocument = async () => {
    const res = await api.get(`/api/v1/documents/${id}`);
    setDocument(res.data.document);
    setSummary(res.data.document.summary || "");
  };

  const fetchHistory = async () => {
    const res = await api.get(`/api/v1/ai/history/${id}`);
    setMessages(res.data.messages);
  };

  useEffect(() => {
    fetchDocument();
    fetchHistory();
  }, [id]);

  const handleSummarize = async () => {
    setSummarizing(true);
    try {
      const res = await api.post(`/api/v1/ai/summarize/${id}`);
      setSummary(res.data.summary);
    } finally {
      setSummarizing(false);
    }
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setAsking(true);
    try {
      await api.post(`/api/v1/ai/chat/${id}`, { message: question });
      setQuestion("");
      fetchHistory();
    } finally {
      setAsking(false);
    }
  };

  if (!document) {
    return <p className="flex min-h-screen items-center justify-center">Loading...</p>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 p-8">
      <h1 className="text-2xl font-bold">{document.originalName}</h1>

      <div className="w-full max-w-2xl">
        <button
          className="rounded bg-black p-2 text-white disabled:opacity-50"
          onClick={handleSummarize}
          disabled={summarizing}
        >
          {summarizing ? "Summarizing..." : "Generate Summary"}
        </button>

        {summary && (
          <div className="mt-4 whitespace-pre-wrap rounded border p-4">{summary}</div>
        )}
      </div>

      <div className="w-full max-w-2xl">
        <h2 className="mb-2 text-xl font-semibold">Ask a question</h2>

        <div className="mb-4 flex flex-col gap-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`rounded p-2 ${
                m.sender === "USER" ? "self-end bg-gray-100" : "bg-blue-50"
              }`}
            >
              <p className="text-xs text-gray-500">{m.sender}</p>
              <p>{m.content}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleAsk} className="flex gap-2">
          <input
            className="flex-1 rounded border p-2"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask something about this document"
          />
          <button
            className="rounded bg-black p-2 text-white disabled:opacity-50"
            type="submit"
            disabled={asking}
          >
            {asking ? "Asking..." : "Ask"}
          </button>
        </form>
      </div>
    </main>
  );
}
