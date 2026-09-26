"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../services/api";
import { Roles } from "@/services/roles";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { access_token, user } = response.data;

      if (user.role !== Roles.SUPER_ADMIN && user.role !== Roles.SUB_ADMIN) {
        setError("You are not authorized to access the admin portal.");
        return;
      }

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("user", JSON.stringify(user));

      router.push("/dashboard");
    } catch (error: any) {
      console.error("Admin login failed:", error);

      setError(error.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "6px",
          padding: "18px",
          width: "340px",
          maxWidth: "100%",
          margin: "40px auto 0",
          boxSizing: "border-box",
          textAlign: "left",
        }}
      >
        <h2 style={{ margin: "0 0 18px" }}>Admin Login</h2>

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div style={{ marginBottom: "12px" }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                marginBottom: "4px",
              }}
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "7px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "14px" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                marginBottom: "4px",
              }}
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "7px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Error */}
          {error && <p style={{ margin: "0 0 12px" }}>{error}</p>}

          {/* Login */}
          <button type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
