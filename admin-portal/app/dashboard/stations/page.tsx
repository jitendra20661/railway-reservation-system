"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { ACTION, RESOURCE } from "@/services/permissions";
import { getUser, hasPermission } from "@/services/auth";

type Geolocation = {
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
  geolocation: Geolocation;
  isActive: boolean;
};

export default function StationsPage() {
  const router = useRouter();

  const currentUser = getUser();

  const canViewStations =
    currentUser?.role === "SUPER_ADMIN" ||
    hasPermission(RESOURCE.STATIONS, ACTION.READ);

  const canCreateStations =
    currentUser?.role === "SUPER_ADMIN" ||
    hasPermission(RESOURCE.STATIONS, ACTION.CREATE);

  const canUpdateStations =
    currentUser?.role === "SUPER_ADMIN" ||
    hasPermission(RESOURCE.STATIONS, ACTION.UPDATE);

  const canDeleteStations =
    currentUser?.role === "SUPER_ADMIN" ||
    hasPermission(RESOURCE.STATIONS, ACTION.DELETE);

  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!canViewStations) {
      setLoading(false);
      return;
    }

    fetchStations();
  }, [canViewStations]);

  const fetchStations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/station");

      setStations(response.data);
    } catch (err: any) {
      console.error(err);

      setError(err?.response?.data?.message || "Failed to load stations.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this station?",
    );

    if (!confirmed) return;

    try {
      await api.delete(`/station/${id}`);

      setStations((current) => current.filter((station) => station._id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete station.");
    }
  };

  const filteredStations = stations.filter((station) => {
    const value = search.toLowerCase();

    return (
      station.stationCode.toLowerCase().includes(value) ||
      station.name.toLowerCase().includes(value) ||
      station.city.toLowerCase().includes(value) ||
      station.state.toLowerCase().includes(value)
    );
  });

  if (!canViewStations) {
    return (
      <div style={styles.page}>
        <h1 style={styles.title}>Stations</h1>

        <div style={styles.permissionBox}>
          You do not have permission to view stations.
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Stations</h1>

          <p style={styles.subtitle}>Manage railway stations</p>
        </div>

        {canCreateStations && (
          <button
            onClick={() => router.push("/dashboard/stations/add")}
            // style={styles.primaryButton}
          >
            + Add Station
          </button>
        )}
      </div>

      {/* Search */}
      <div style={styles.toolbar}>
        <input
          type="text"
          placeholder="Search stations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Error */}
      {error && <div style={styles.error}>{error}</div>}

      {/* Loading */}
      {loading ? (
        <div style={styles.message}>Loading stations...</div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Code</th>
                <th style={styles.th}>Station</th>
                <th style={styles.th}>City</th>
                <th style={styles.th}>State</th>
                <th style={styles.th}>Distance</th>
                <th style={styles.th}>Location</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredStations.length === 0 ? (
                <tr>
                  <td colSpan={8} style={styles.empty}>
                    No stations found.
                  </td>
                </tr>
              ) : (
                filteredStations.map((station) => (
                  <tr key={station._id}>
                    <td style={styles.td}>
                      <strong>{station.stationCode}</strong>
                    </td>

                    <td style={styles.td}>{station.name}</td>

                    <td style={styles.td}>{station.city}</td>

                    <td style={styles.td}>{station.state}</td>

                    <td style={styles.td}>{station.distanceFromRoha} km</td>

                    <td style={styles.td}>
                      {station.geolocation ? (
                        <span style={styles.coordinates}>
                          {station.geolocation.latitude.toFixed(4)},{" "}
                          {station.geolocation.longitude.toFixed(4)}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td style={styles.td}>
                      <span>{station.isActive ? "ACTIVE" : "INACTIVE"}</span>
                    </td>

                    <td style={styles.td}>
                      <div style={styles.actions}>
                        {canUpdateStations && (
                          <button
                            style={styles.editButton}
                            onClick={() =>
                              router.push(
                                `/dashboard/stations/${station._id}/edit`,
                              )
                            }
                          >
                            Edit
                          </button>
                        )}

                        {canDeleteStations && (
                          <button
                            style={styles.deleteButton}
                            onClick={() => handleDelete(station._id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Count */}
      {!loading && (
        <div style={styles.count}>
          Showing {filteredStations.length} of {stations.length} stations
        </div>
      )}
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

  primaryButton: {
    height: "40px",
    padding: "0 16px",
    border: "none",
    background: "#222",
    color: "#fff",
    cursor: "pointer",
    fontSize: "14px",
  },

  toolbar: {
    marginBottom: "16px",
  },

  searchInput: {
    width: "320px",
    height: "40px",
    border: "1px solid #ccc",
    padding: "0 12px",
    fontSize: "14px",
    outline: "none",
  },

  tableContainer: {
    border: "1px solid #ddd",
    background: "#fff",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },

  th: {
    textAlign: "left",
    padding: "13px 14px",
    borderBottom: "1px solid #ddd",
    background: "#fafafa",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },

  td: {
    padding: "13px 14px",
    borderBottom: "1px solid #eee",
    whiteSpace: "nowrap",
  },

  coordinates: {
    fontFamily: "monospace",
    fontSize: "12px",
    color: "#555",
  },

  actions: {
    display: "flex",
    gap: "8px",
  },

  message: {
    padding: "40px",
    textAlign: "center",
    color: "#666",
  },

  empty: {
    padding: "40px",
    textAlign: "center",
    color: "#777",
  },

  error: {
    marginBottom: "16px",
    padding: "10px 12px",
    border: "1px solid #e0b4b4",
    background: "#fff5f5",
    color: "#a33",
    fontSize: "14px",
  },

  permissionBox: {
    marginTop: "20px",
    padding: "20px",
    border: "1px solid #ddd",
    color: "#666",
  },

  count: {
    marginTop: "12px",
    fontSize: "13px",
    color: "#777",
  },
};
