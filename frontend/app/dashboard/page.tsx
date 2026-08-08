"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    api
      .get("/api/v1/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => router.push("/login"));

    api
      .get("/api/v1/dashboard/stats")
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, []);

  if (!user) {
    return <p className="flex min-h-screen items-center justify-center">Loading...</p>;
  }

  return (
    <main className="flex min-h-screen flex-col gap-8 p-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
        <p className="text-gray-500">{user.email}</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded border p-4">
            <p className="text-sm text-gray-500">Documents</p>
            <p className="text-2xl font-bold">{stats.totalDocuments}</p>
          </div>
          <div className="rounded border p-4">
            <p className="text-sm text-gray-500">AI Requests</p>
            <p className="text-2xl font-bold">{stats.totalAiRequests}</p>
          </div>
          <div className="rounded border p-4">
            <p className="text-sm text-gray-500">Storage Used</p>
            <p className="text-2xl font-bold">{formatBytes(stats.storageUsedBytes)}</p>
          </div>
          <div className="rounded border p-4">
            <p className="text-sm text-gray-500">Avg Response Time</p>
            <p className="text-2xl font-bold">{stats.avgResponseTimeMs} ms</p>
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-xl font-semibold">Recent Documents</h2>
        <ul className="flex flex-col gap-2">
          {stats?.recentDocuments?.length === 0 && (
            <p className="text-gray-500">No documents uploaded yet.</p>
          )}
          {stats?.recentDocuments?.map((doc: any) => (
            <li key={doc.id} className="flex items-center justify-between rounded border p-3">
              <Link href={`/documents/${doc.id}`} className="font-medium underline">
                {doc.originalName}
              </Link>
              <span className="text-sm text-gray-500">{doc.uploadStatus}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link href="/documents" className="w-fit rounded bg-black p-2 text-white">
        Go to Documents
      </Link>
    </main>
  );
}
