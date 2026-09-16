"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";

export default function AddStationPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    stationCode: "",
    name: "",
    city: "",
    state: "",
    distanceFromRoha: "",
    latitude: "",
    longitude: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (
      !form.stationCode ||
      !form.name ||
      !form.city ||
      !form.state ||
      !form.distanceFromRoha ||
      !form.latitude ||
      !form.longitude
    ) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/station", {
        stationCode: form.stationCode,
        name: form.name,
        city: form.city,
        state: form.state,
        distanceFromRoha: Number(form.distanceFromRoha),
        geolocation: {
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
        },
        isActive: form.isActive,
      });

      router.push("/dashboard/stations");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create station.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Add Station</h1>
          <p style={styles.subtitle}>Add a new railway station</p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/dashboard/stations")}
          style={styles.secondaryButton}
        >
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.grid}>
          <div style={styles.field}>
            <label>Station Code</label>
            <input
              name="stationCode"
              value={form.stationCode}
              onChange={handleChange}
              //   placeholder="e.g. ROHA"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label>Station Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              //   placeholder="e.g. Roha"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label>City</label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              //   placeholder="e.g. Roha"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label>State</label>
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              //   placeholder="e.g. Maharashtra"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label>Distance from Roha (km)</label>
            <input
              type="number"
              min="0"
              name="distanceFromRoha"
              value={form.distanceFromRoha}
              onChange={handleChange}
              placeholder="e.g. 80"
              style={styles.input}
            />
          </div>

          <div />

          <div style={styles.field}>
            <label>Latitude</label>
            <input
              type="number"
              step="any"
              name="latitude"
              value={form.latitude}
              onChange={handleChange}
              placeholder="e.g. 18.9894"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label>Longitude</label>
            <input
              type="number"
              step="any"
              name="longitude"
              value={form.longitude}
              onChange={handleChange}
              placeholder="e.g. 73.1175"
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.activeRow}>
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
          />

          <label>Station is active</label>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.actions}>
          <button
            type="button"
            onClick={() => router.push("/dashboard/stations")}
            style={styles.secondaryButton}
          >
            Cancel
          </button>

          <button type="submit" disabled={loading} style={styles.primaryButton}>
            {loading ? "Adding..." : "Add Station"}
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
    gap: "7px",
  },

  input: {
    height: "40px",
    border: "1px solid #ccc",
    padding: "0 10px",
    fontSize: "14px",
    outline: "none",
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
};
