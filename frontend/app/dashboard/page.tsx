"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    api
      .get("/api/v1/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => router.push("/login"));
  }, []);

  if (!user) {
    return <p className="flex min-h-screen items-center justify-center">Loading...</p>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
      <p>{user.email}</p>
    </main>
  );
}
