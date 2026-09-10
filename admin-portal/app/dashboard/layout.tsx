"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { getToken, isAdmin, logout } from "../../services/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();

    if (!token || !isAdmin()) {
      router.replace("/login");
    }
  }, [router]);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
      }}
    >
      <aside
        style={{
          width: "180px",
          borderRight: "1px solid #ddd",
          padding: "16px",
          boxSizing: "border-box",
        }}
      >
        <h3 style={{ margin: "0 0 20px" }}>Admin</h3>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <Link href="/dashboard">Dashboard</Link>

          {/* <Link href="/dashboard/users">Users</Link> */}
          {/* <Link href="/dashboard/bookings">Bookings</Link> */}
          {/* <Link href="/dashboard/trains">Trains</Link> */}
          {/* <Link href="/dashboard/stations">Stations</Link> */}

          <Link href="/dashboard/schedules">Schedules</Link>
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
