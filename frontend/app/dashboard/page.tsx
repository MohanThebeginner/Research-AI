"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import AppShell from "@/components/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatusTag from "@/components/ui/StatusTag";

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
    return <p className="flex min-h-screen items-center justify-center text-muted">Loading...</p>;
  }

  const statCards = stats
    ? [
        { label: "Documents", value: stats.totalDocuments },
        { label: "AI Requests", value: stats.totalAiRequests },
        { label: "Storage Used", value: formatBytes(stats.storageUsedBytes) },
        { label: "Avg Response", value: `${stats.avgResponseTimeMs} ms` },
      ]
    : [];

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-8 py-10">
        <p className="mb-1 font-mono text-xs uppercase tracking-widest text-primary">
          Overview
        </p>
        <h1 className="mb-1 font-display text-3xl font-semibold text-ink">
          Welcome, {user.name}
        </h1>
        <p className="mb-8 text-sm text-muted">{user.email}</p>

        {stats && (
          <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {statCards.map((card) => (
              <Card key={card.label}>
                <p className="mb-1 font-mono text-xs uppercase tracking-wider text-muted">
                  {card.label}
                </p>
                <p className="font-display text-2xl font-semibold text-ink">{card.value}</p>
              </Card>
            ))}
          </div>
        )}

        <div className="mb-8">
          <h2 className="mb-3 font-display text-lg font-semibold text-ink">
            Recent Documents
          </h2>
          {stats?.recentDocuments?.length === 0 && (
            <p className="text-sm text-muted">No documents uploaded yet.</p>
          )}
          <div className="flex flex-col gap-2">
            {stats?.recentDocuments?.map((doc: any) => (
              <Link key={doc.id} href={`/documents/${doc.id}`}>
                <Card className="flex items-center justify-between transition-colors hover:border-primary">
                  <span className="text-sm font-medium text-ink">{doc.originalName}</span>
                  <StatusTag status={doc.uploadStatus} />
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <Link href="/documents">
          <Button variant="primary">Go to Documents</Button>
        </Link>
      </div>
    </AppShell>
  );
}
