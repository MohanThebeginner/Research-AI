"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import AppShell from "@/components/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import StatusTag from "@/components/ui/StatusTag";

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
    return <p className="flex min-h-screen items-center justify-center text-muted">Loading...</p>;
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-8 py-10">
        <p className="mb-1 font-mono text-xs uppercase tracking-widest text-primary">
          Document
        </p>
        <div className="mb-8 flex items-center gap-3">
          <h1 className="font-display text-3xl font-semibold text-ink">
            {document.originalName}
          </h1>
          <StatusTag status={document.uploadStatus} />
        </div>

        <Card className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink">Summary</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handleIndex}
                disabled={indexing || document.isIndexed}
                className="font-mono text-xs uppercase tracking-wider text-primary hover:underline disabled:cursor-default disabled:text-muted disabled:no-underline"
              >
                {document.isIndexed ? "Indexed for RAG" : indexing ? "Indexing..." : "Index for RAG"}
              </button>
              <Button variant="secondary" onClick={handleSummarize} disabled={summarizing}>
                {summarizing ? "Summarizing..." : "Generate Summary"}
              </Button>
            </div>
          </div>

          {summary && (
            <p className="whitespace-pre-wrap border-l-2 border-primary pl-4 text-sm leading-relaxed text-ink">
              {summary}
            </p>
          )}
          {!summary && (
            <p className="text-sm text-muted">No summary yet. Generate one above.</p>
          )}
          {summarizeError && <p className="mt-3 text-sm text-danger">{summarizeError}</p>}
        </Card>

        <Card>
          <h2 className="mb-4 font-display text-lg font-semibold text-ink">Ask a question</h2>

          <div className="mb-4 flex flex-col gap-3">
            {messages.length === 0 && (
              <p className="text-sm text-muted">
                No questions yet. Ask something about this document below.
              </p>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={
                  m.sender === "USER"
                    ? "ml-auto max-w-[80%] rounded-md bg-primary-soft px-3 py-2 text-sm text-ink"
                    : "max-w-[85%] border-l-2 border-accent bg-accent-soft px-3 py-2 text-sm text-ink"
                }
              >
                <p className="mb-1 font-mono text-xs uppercase tracking-wider text-muted">
                  {m.sender === "USER" ? "You" : "ResearchAI"}
                </p>
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleAsk} className="flex gap-2">
            <Input
              className="flex-1"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask something about this document"
            />
            <Button type="submit" disabled={asking}>
              {asking ? "Asking..." : "Ask"}
            </Button>
          </form>

          {chatError && <p className="mt-3 text-sm text-danger">{chatError}</p>}
        </Card>
      </div>
    </AppShell>
  );
}
