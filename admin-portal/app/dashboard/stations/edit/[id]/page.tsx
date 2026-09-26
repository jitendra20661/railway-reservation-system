"use client";

import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import api from "@/services/api";

const StationLocationMap = dynamic(
  () => import("../../add/StationLocationMap"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: "500px",
          border: "1px solid #ccc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
          color: "#666",
        }}
      >
        Loading map...
      </div>
    ),
  },
);

type Location = {
  latitude: number;
  longitude: number;
};

type Station = {
  _id: string;
  stationCode: string;
  name: string;
  city: string;
  state: string;
  distanceFromRoha: number;
  geolocation: Location;
  isActive: boolean;
};

type FormData = {
  stationCode: string;
  name: string;
  city: string;
  state: string;
  distanceFromRoha: string;
};

export default function EditStationPage() {
  const router = useRouter();
  const params = useParams();

  const id = params.id as string;

  const [form, setForm] = useState<FormData>({
    stationCode: "",
    name: "",
    city: "",
    state: "",
    distanceFromRoha: "",
  });

  const [location, setLocation] = useState<Location | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /*
   * Fetch station
   */
  useEffect(() => {
    const fetchStation = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/station/${id}`);

        const station: Station = response.data;

        setForm({
          stationCode: station.stationCode,
          name: station.name,
          city: station.city,
          state: station.state,
          distanceFromRoha: String(station.distanceFromRoha),
        });

        if (station.geolocation) {
          setLocation({
            latitude: station.geolocation.latitude,
            longitude: station.geolocation.longitude,
          });
        }
      } catch (error: any) {
        console.error("Failed to fetch station:", error);

        setError(error?.response?.data?.message || "Unable to load station.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStation();
    }
  }, [id]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
   * Update station
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setError("");

    if (!form.stationCode.trim()) {
      setError("Station code is required.");
      return;
    }

    if (!form.name.trim()) {
      setError("Station name is required.");
      return;
    }

    if (!form.city.trim()) {
      setError("City is required.");
      return;
    }

    if (!form.state.trim()) {
      setError("State is required.");
      return;
    }

    if (!form.distanceFromRoha.trim()) {
      setError("Distance from Roha is required.");
      return;
    }

    const distanceFromRoha = Number(form.distanceFromRoha);

    if (!Number.isFinite(distanceFromRoha) || distanceFromRoha < 0) {
      setError("Distance from Roha must be a valid positive number.");
      return;
    }

    if (!location) {
      setError("Please select the station location on the map.");
      return;
    }

    try {
      setSaving(true);

      await api.patch(`/station/${id}`, {
        stationCode: form.stationCode.trim().toUpperCase(),
        name: form.name.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        distanceFromRoha,
        geolocation: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      });

      router.push("/dashboard/stations");
    } catch (error: any) {
      console.error("Failed to update station:", error);

      const message = error?.response?.data?.message;

      if (Array.isArray(message)) {
        setError(message.join(", "));
      } else {
        setError(message || "Unable to update station.");
      }
    } finally {
      setSaving(false);
    }
  };

  /*
   * Loading
   */
  if (loading) {
    return (
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "30px",
        }}
      >
        <div
          style={{
            border: "1px solid #ddd",
            padding: "30px",
            textAlign: "center",
            fontSize: "14px",
            color: "#666",
          }}
        >
          Loading station...
        </div>
      </div>
    );
  }

  /*
   * Main UI
   */
  return (
    <div
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "30px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "25px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: "600",
            }}
          >
            Edit Station
          </h1>

          <p
            style={{
              margin: "6px 0 0",
              fontSize: "13px",
              color: "#666",
            }}
          >
            Update station details and location.
          </p>
        </div>
      </div>

      {/* Error while loading */}
      {error && !form.stationCode && (
        <div
          style={{
            padding: "10px",
            border: "1px solid #ccc",
            background: "#f7f7f7",
            fontSize: "13px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {!error || form.stationCode ? (
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(320px, 420px) minmax(500px, 1fr)",
              gap: "30px",
              alignItems: "start",
            }}
          >
            {/* =========================
                LEFT SIDE
            ========================== */}
            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: "6px",
                padding: "20px",
                background: "#fff",
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: "20px",
                  fontSize: "18px",
                  fontWeight: "600",
                }}
              >
                Station Details
              </h2>

              {/* Station Code */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="stationCode"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Station Code
                </label>

                <input
                  id="stationCode"
                  name="stationCode"
                  type="text"
                  value={form.stationCode}
                  onChange={handleChange}
                  maxLength={10}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    boxSizing: "border-box",
                    fontSize: "14px",
                    textTransform: "uppercase",
                  }}
                />
              </div>

              {/* Station Name */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="name"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Station Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    boxSizing: "border-box",
                    fontSize: "14px",
                  }}
                />
              </div>

              {/* City */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="city"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  City
                </label>

                <input
                  id="city"
                  name="city"
                  type="text"
                  value={form.city}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    boxSizing: "border-box",
                    fontSize: "14px",
                  }}
                />
              </div>

              {/* State */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="state"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  State
                </label>

                <input
                  id="state"
                  name="state"
                  type="text"
                  value={form.state}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    boxSizing: "border-box",
                    fontSize: "14px",
                  }}
                />
              </div>

              {/* Distance */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  htmlFor="distanceFromRoha"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Distance from Roha (km)
                </label>

                <input
                  id="distanceFromRoha"
                  name="distanceFromRoha"
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.distanceFromRoha}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    boxSizing: "border-box",
                    fontSize: "14px",
                  }}
                />
              </div>

              {/* Submit error */}
              {error && form.stationCode && (
                <div
                  style={{
                    marginBottom: "16px",
                    padding: "10px",
                    border: "1px solid #ccc",
                    background: "#f7f7f7",
                    fontSize: "13px",
                    lineHeight: 1.4,
                  }}
                >
                  {Array.isArray(error) ? (
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: "18px",
                      }}
                    >
                      {error.map((message, index) => (
                        <li key={index}>{message}</li>
                      ))}
                    </ul>
                  ) : (
                    error
                  )}
                </div>
              )}

              {/* Update */}
              <button
                type="submit"
                disabled={saving}
                style={{
                  width: "100%",
                  padding: "11px",
                  border: "1px solid #222",
                  borderRadius: "4px",
                  background: "#222",
                  color: "#fff",
                  cursor: saving ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Updating Station..." : "Update Station"}
              </button>
            </div>

            {/* =========================
                RIGHT SIDE
            ========================== */}
            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: "6px",
                padding: "20px",
                background: "#fff",
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: "6px",
                  fontSize: "18px",
                  fontWeight: "600",
                }}
              >
                Station Location
              </h2>

              <p
                style={{
                  marginTop: 0,
                  marginBottom: "15px",
                  fontSize: "13px",
                  color: "#666",
                }}
              >
                Search for the station or click on the map to change its
                location.
              </p>

              <StationLocationMap value={location} onChange={setLocation} />
            </div>
          </div>
        </form>
      ) : null}
    </div>
  );
}
