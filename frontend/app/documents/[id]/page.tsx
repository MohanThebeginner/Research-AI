"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

export default function DocumentDetailPage() {
  const { id } = useParams();
  const [document, setDocument] = useState<any>(null);
  const [summary, setSummary] = useState("");
  const [summarizing, setSummarizing] = useState(false);
  const [summarizeError, setSummarizeError] = useState("");
  const [indexing, setIndexing] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [chatError, setChatError] = useState("");

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
    setSummarizeError("");
    try {
      const res = await api.post(`/api/v1/ai/summarize/${id}`);
      setSummary(res.data.summary);
    } catch (err: any) {
      setSummarizeError(err.response?.data?.message || "Something went wrong, please try again");
    } finally {
      setSummarizing(false);
    }
  };

  const handleIndex = async () => {
    setIndexing(true);
    try {
      await api.post(`/api/v1/documents/${id}/index`);
      fetchDocument();
    } finally {
      setIndexing(false);
    }
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setAsking(true);
    setChatError("");

    try {
      await api.post(`/api/v1/ai/chat/${id}`, { message: question });
      setQuestion("");
      fetchHistory();
    } catch (err: any) {
      setChatError(err.response?.data?.message || "Something went wrong, please try again");
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
        <div className="mb-4 flex items-center gap-3">
          <button
            className="rounded bg-black p-2 text-white disabled:opacity-50"
            onClick={handleIndex}
            disabled={indexing || document.isIndexed}
          >
            {document.isIndexed
              ? "Indexed for RAG"
              : indexing
              ? "Indexing..."
              : "Index for RAG"}
          </button>
          {document.isIndexed && (
            <span className="text-sm text-green-600">
              Chat answers now use retrieved chunks, not the full document
            </span>
          )}
        </div>

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

        {summarizeError && <p className="mt-2 text-red-500">{summarizeError}</p>}
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

        {chatError && <p className="mt-2 text-red-500">{chatError}</p>}
      </div>
    </main>
  );
}
