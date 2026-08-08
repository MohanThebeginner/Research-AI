"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/documents", label: "Documents" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 flex-col justify-between border-r border-border bg-surface px-4 py-6">
        <div>
          <p className="mb-8 px-2 font-display text-lg font-semibold text-ink">
            ResearchAI
          </p>
          <nav className="flex flex-col gap-1">
            {links.map((link) => {
              const active = pathname === link.href || pathname?.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-2 text-sm font-medium ${
                    active
                      ? "bg-primary-soft text-primary"
                      : "text-muted hover:bg-primary-soft hover:text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-md px-3 py-2 text-left text-sm font-medium text-muted hover:bg-primary-soft hover:text-ink"
        >
          Log out
        </button>
      </aside>

      <main className="flex-1 bg-paper">{children}</main>
    </div>
  );
}
