"use client";

import { getUser } from "../../services/auth";

export default function Dashboard() {
  const user = getUser();

  return (
    <div style={{ padding: "0px 20px" }}>
      <h2>Dashboard</h2>
    </div>
  );
}
