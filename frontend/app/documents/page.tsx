"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

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
    <main className="flex min-h-screen flex-col items-center gap-6 p-8">
      <h1 className="text-2xl font-bold">Documents</h1>

      <form onSubmit={handleUpload} className="flex w-80 flex-col gap-2">
        <input
          type="file"
          accept=".pdf,.txt,.docx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        {error && <p className="text-red-500">{error}</p>}
        <button
          className="bg-black text-white rounded p-2"
          type="submit"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>

      <ul className="flex w-96 flex-col gap-2">
        {documents.map((doc) => (
          <li
            key={doc.id}
            className="flex items-center justify-between rounded border p-3"
          >
            <div>
              <Link href={`/documents/${doc.id}`} className="font-medium underline">
                {doc.originalName}
              </Link>
              <p className="text-sm text-gray-500">{doc.uploadStatus}</p>
            </div>
            <button className="text-red-500" onClick={() => handleDelete(doc.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
