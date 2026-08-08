"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import AppShell from "@/components/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatusTag from "@/components/ui/StatusTag";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const fetchDocuments = async () => {
    try {
      const res = await api.get("/api/v1/documents");
      setDocuments(res.data.documents);
    } catch (err) {
      setError("Failed to load documents");
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/api/v1/documents", formData);
      setFile(null);
      fetchDocuments();
    } catch (err: any) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/api/v1/documents/${id}`);
    fetchDocuments();
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-8 py-10">
        <p className="mb-1 font-mono text-xs uppercase tracking-widest text-primary">
          Library
        </p>
        <h1 className="mb-8 font-display text-3xl font-semibold text-ink">Documents</h1>

        <Card className="mb-8">
          <form onSubmit={handleUpload} className="flex flex-col gap-3">
            <label className="text-sm font-medium text-ink">Upload a document</label>
            <input
              type="file"
              accept=".pdf,.txt,.docx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-primary-soft file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary"
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" disabled={uploading} className="w-fit">
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </form>
        </Card>

        <div className="flex flex-col gap-2">
          {documents.length === 0 && (
            <p className="text-sm text-muted">No documents yet. Upload your first one above.</p>
          )}
          {documents.map((doc) => (
            <Card key={doc.id} className="flex items-center justify-between">
              <Link href={`/documents/${doc.id}`} className="flex items-center gap-3">
                <span className="text-sm font-medium text-ink hover:text-primary">
                  {doc.originalName}
                </span>
                <StatusTag status={doc.uploadStatus} />
              </Link>
              <Button variant="danger" onClick={() => handleDelete(doc.id)}>
                Delete
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
