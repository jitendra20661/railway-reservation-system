"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { getToken, getUser, logout, hasPermission } from "../../services/auth";

import { RESOURCE, ACTION } from "../../services/permissions";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const token = getToken();
    const user = getUser();

    if (!token || !user) {
      router.replace("/login");
      return;
    }

    setMounted(true);
  }, [router]);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  // Don't render permission-dependent UI during SSR/hydration
  if (!mounted) {
    return null;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: "180px",
          borderRight: "1px solid #ddd",
          padding: "16px",
          boxSizing: "border-box",
        }}
      >
        <h3 style={{ margin: "0 0 20px" }}>{getUser()?.name?.toUpperCase()}</h3>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <Link href="/dashboard">Dashboard</Link>

          {hasPermission(RESOURCE.TRAINS, ACTION.READ) && (
            <Link href="/dashboard/trains">Trains</Link>
          )}

          {hasPermission(RESOURCE.STATIONS, ACTION.READ) && (
            <Link href="/dashboard/stations">Stations</Link>
          )}

          {hasPermission(RESOURCE.SCHEDULES, ACTION.READ) && (
            <Link href="/dashboard/schedules">Schedules</Link>
          )}

          {hasPermission(RESOURCE.USERS, ACTION.READ) && (
            <Link href="/dashboard/users">Users</Link>
          )}

          {hasPermission(RESOURCE.BOOKINGS, ACTION.READ) && (
            <Link href="/dashboard/bookings">Bookings</Link>
          )}
        </nav>

        <button
          onClick={handleLogout}
          style={{
            marginTop: "30px",
          }}
        >
          Logout
        </button>
      </aside>

      <main
        style={{
          flex: 1,
          padding: "20px",
        }}
      >
        {children}
      </main>
    </div>
  );
}
