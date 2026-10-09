import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getErrorMessage } from "../utils";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { access_token, user } = response.data;

      login(access_token, user);

      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);

      setError(getErrorMessage(error, "Invalid email or password."));
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
        <h2 style={{ margin: "0 0 18px" }}>Login</h2>

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div style={{ marginBottom: "12px" }}>
            <label
              htmlFor="email"
              style={{ display: "block", marginBottom: "4px" }}
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
              style={{ display: "block", marginBottom: "4px" }}
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
          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", height: "35px" }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        {/* Register */}
        <div
          style={{
            marginTop: "12px",
            textAlign: "center",
            fontSize: "15px",
          }}
        >
          <span>Don't have an account? </span>

          <a href="/register">Register here</a>
        </div>
      </div>
    </div>
  );
}

export default Login;
