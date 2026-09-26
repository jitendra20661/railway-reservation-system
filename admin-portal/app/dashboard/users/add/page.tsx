"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import api from "@/services/api";
import { Roles } from "@/services/roles";

type CreateUserResponse = {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
};

export default function AddUserPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

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

      const response = await api.post<CreateUserResponse>("/user", {
        name: name.trim(),
        email: email.trim(),
        password,
        role: Roles.SUB_ADMIN,
        isActive,
      });

      if (response.data) {
        setSuccess("Sub-admin created successfully.");

        setTimeout(() => {
          router.push("/dashboard/users");
        }, 800);
      }
    } catch (err: any) {
      console.error(err);

      const message = err?.response?.data?.message;

      if (Array.isArray(message)) {
        setError(message.join(", "));
      } else {
        setError(message || "Failed to create sub-admin.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Add New</h1>
          <p style={styles.subtitle}>Create a new sub-admin</p>
        </div>
      </div>

      <div style={styles.formContainer}>
        <form onSubmit={handleSubmit}>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                style={styles.input}
                disabled={loading}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                style={styles.input}
                disabled={loading}
              />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                style={styles.input}
                disabled={loading}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                style={styles.input}
                disabled={loading}
              />
            </div>
          </div>

          <div style={styles.activeRow}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={loading}
            />
            <label>Active</label>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          {success && <div style={styles.success}>{success}</div>}

          <div style={styles.actions}>
            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: "100%",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },

  title: {
    margin: 0,
    fontSize: "24px",
    fontWeight: 600,
  },

  subtitle: {
    margin: "5px 0 0",
    fontSize: "14px",
    color: "#666",
  },

  backButton: {
    height: "36px",
    padding: "0 14px",
    border: "1px solid #ccc",
    background: "#fff",
    color: "#333",
    cursor: "pointer",
    fontSize: "14px",
  },

  disabledInput: {
    width: "100%",
    height: "40px",
    boxSizing: "border-box",
    border: "1px solid #ddd",
    padding: "0 10px",
    fontSize: "14px",
    background: "#f7f7f7",
    color: "#666",
  },

  error: {
    marginBottom: "16px",
    padding: "10px 12px",
    border: "1px solid #e0b4b4",
    background: "#fff5f5",
    color: "#a33",
    fontSize: "14px",
  },

  success: {
    marginBottom: "16px",
    padding: "10px 12px",
    border: "1px solid #b8d8b8",
    background: "#f5fff5",
    color: "#367336",
    fontSize: "14px",
  },

  formContainer: {
    width: "100%",
    maxWidth: "700px",
    border: "1px solid #ddd",
    background: "#fff",
    padding: "20px",
    boxSizing: "border-box",
  },

  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "14px",
  },

  label: {
    marginBottom: "6px",
    fontSize: "13px",
    fontWeight: 500,
  },

  input: {
    width: "100%",
    height: "36px",
    boxSizing: "border-box",
    border: "1px solid #ccc",
    padding: "0 10px",
    fontSize: "13px",
    outline: "none",
  },

  activeRow: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    marginTop: "2px",
    fontSize: "13px",
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
    marginTop: "18px",
  },
};
