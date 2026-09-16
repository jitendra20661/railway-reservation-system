"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { ACTION, RESOURCE } from "@/services/permissions";
import { getUser, hasPermission } from "@/services/auth";

export default function AddTrainPage() {
  const router = useRouter();

  const currentUser = getUser();

  const canCreateTrains =
    currentUser?.role === "SUPER_ADMIN" ||
    hasPermission(RESOURCE.TRAINS, ACTION.CREATE);

  const [form, setForm] = useState({
    trainNumber: "",
    name: "",
    type: "",
    totalSeats: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!canCreateTrains) {
    return (
      <div style={styles.page}>
        <h1 style={styles.title}>Add Train</h1>

        <div style={styles.permissionBox}>
          You do not have permission to add trains.
        </div>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (
      !form.trainNumber.trim() ||
      !form.name.trim() ||
      !form.type.trim() ||
      !form.totalSeats
    ) {
      setError("Please fill in all fields.");
      return;
    }

    const totalSeats = Number(form.totalSeats);

    if (!Number.isInteger(totalSeats) || totalSeats <= 0) {
      setError("Total seats must be a positive number.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/train", {
        trainNumber: form.trainNumber.trim(),
        name: form.name.trim(),
        // type: form.type,
        capacity: Number(form.totalSeats),
        isActive: form.isActive,
      });

      router.push("/dashboard/trains");
    } catch (err: any) {
      console.error(err);

      setError(err?.response?.data?.message || "Failed to create train.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Add Train</h1>

          <p style={styles.subtitle}>Add a new railway train</p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/dashboard/trains")}
          style={styles.secondaryButton}
        >
          Back
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.grid}>
          {/* Train Number */}
          <div style={styles.field}>
            <label>Train Number</label>

            <input
              name="trainNumber"
              value={form.trainNumber}
              onChange={handleChange}
              //   placeholder="e.g. 10101"
              style={styles.input}
            />
          </div>

          {/* Train Name */}
          <div style={styles.field}>
            <label>Train Name</label>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              //   placeholder="e.g. Konkan Express"
              style={styles.input}
            />
          </div>

          {/* Train Type */}
          <div style={styles.field}>
            <label>Train Type</label>

            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="">Select train type</option>

              <option value="EXPRESS">Express</option>

              <option value="SUPERFAST">Superfast</option>

              <option value="PASSENGER">Passenger</option>

              <option value="LOCAL">Local</option>

              <option value="SPECIAL">Special</option>
            </select>
          </div>

          {/* Total Seats */}
          <div style={styles.field}>
            <label>Total Seats</label>

            <input
              type="number"
              min="1"
              name="totalSeats"
              value={form.totalSeats}
              onChange={handleChange}
              //   placeholder="e.g. 1200"
              style={styles.input}
            />
          </div>
        </div>

        {/* Active */}
        <div style={styles.activeRow}>
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
          />

          <label>Train is active</label>
        </div>

        {/* Error */}
        {error && <div style={styles.error}>{error}</div>}

        {/* Actions */}
        <div style={styles.actions}>
          <button
            type="button"
            onClick={() => router.push("/dashboard/trains")}
            style={styles.secondaryButton}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.primaryButton,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Adding..." : "Add Train"}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: "900px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
  },

  title: {
    margin: 0,
    fontSize: "24px",
    fontWeight: 600,
  },

  subtitle: {
    margin: "6px 0 0",
    color: "#666",
    fontSize: "14px",
  },

  form: {
    border: "1px solid #ddd",
    padding: "24px",
    background: "#fff",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  input: {
    width: "85%",
    height: "30px",
    boxSizing: "border-box",
    border: "1px solid #ccc",
    padding: "0 5px",
    fontSize: "14px",
    outline: "none",
    background: "#fff",
  },

  activeRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "22px",
    fontSize: "14px",
  },

  error: {
    marginTop: "18px",
    padding: "10px",
    border: "1px solid #e0b4b4",
    background: "#fff5f5",
    color: "#a33",
    fontSize: "14px",
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "28px",
  },

  permissionBox: {
    marginTop: "20px",
    padding: "20px",
    border: "1px solid #ddd",
    color: "#666",
  },
};
