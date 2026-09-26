import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/register", {
        name,
        email,
        password,
        isActive: true,
      });

      alert("Registration successful!");

      navigate("/login");
    } catch (error) {
      console.error("Registration failed:", error);

      setError(error.response?.data?.message || "Unable to create account.");
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
        <h2 style={{ margin: "0 0 18px" }}>Register</h2>

        <form onSubmit={handleRegister}>
          {/* Name */}
          <div style={{ marginBottom: "12px" }}>
            <label
              htmlFor="name"
              style={{
                display: "block",
                marginBottom: "4px",
              }}
            >
              Name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "7px",
                boxSizing: "border-box",
              }}
            />
          </div>

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
          <div style={{ marginBottom: "12px" }}>
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
              minLength={6}
              required
              style={{
                width: "100%",
                padding: "7px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: "14px" }}>
            <label
              htmlFor="confirmPassword"
              style={{
                display: "block",
                marginBottom: "4px",
              }}
            >
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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

          {/* Register */}
          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", height: "35px" }}
          >
            {loading ? "Registering..." : "Register"}
          </button>

          {/* Login */}
          <div
            style={{
              marginTop: "12px",
              textAlign: "center",
              fontSize: "15px",
            }}
          >
            <span>Already have an account? </span>

            <a href="/login">Login</a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
