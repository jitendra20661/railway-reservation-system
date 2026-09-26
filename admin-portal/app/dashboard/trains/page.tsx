"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { ACTION, RESOURCE } from "@/services/permissions";
import { getUser, hasPermission } from "@/services/auth";
import { Roles } from "@/services/roles";

type Train = {
  _id: string;
  trainNumber: string;
  name: string;
  // type: string;
  capacity: number;
  isActive: boolean;
};

export default function TrainsPage() {
  const router = useRouter();

  const currentUser = getUser();

  const canViewTrains =
    currentUser?.role === Roles.SUPER_ADMIN ||
    hasPermission(RESOURCE.TRAINS, ACTION.READ);

  const canCreateTrains =
    currentUser?.role === Roles.SUPER_ADMIN ||
    hasPermission(RESOURCE.TRAINS, ACTION.CREATE);

  const canUpdateTrains =
    currentUser?.role === Roles.SUPER_ADMIN ||
    hasPermission(RESOURCE.TRAINS, ACTION.UPDATE);

  const canDeleteTrains =
    currentUser?.role === Roles.SUPER_ADMIN ||
    hasPermission(RESOURCE.TRAINS, ACTION.DELETE);

  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!canViewTrains) {
      setLoading(false);
      return;
    }

    fetchTrains();
  }, [canViewTrains]);

  const fetchTrains = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/train");

      setTrains(response.data);
    } catch (err: any) {
      console.error(err);

      setError(err?.response?.data?.message || "Failed to load trains.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this train?",
    );

    if (!confirmed) return;

    try {
      await api.delete(`/train/${id}`);

      setTrains((current) => current.filter((train) => train._id !== id));
    } catch (err: any) {
      console.error(err);

      alert(err?.response?.data?.message || "Failed to delete train.");
    }
  };

  const filteredTrains = trains.filter((train) => {
    const value = search.toLowerCase();

    return (
      train.trainNumber.toLowerCase().includes(value) ||
      train.name.toLowerCase().includes(value)
      // train.type.toLowerCase().includes(value)
    );
  });

  if (!canViewTrains) {
    return (
      <div style={styles.page}>
        <h1 style={styles.title}>Trains</h1>

        <div style={styles.permissionBox}>
          You do not have permission to view trains.
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Trains</h1>

          <p style={styles.subtitle}>Manage railway trains</p>
        </div>

        {canCreateTrains && (
          <button onClick={() => router.push("/dashboard/trains/add")}>
            + Add Train
          </button>
        )}
      </div>

      {/* Search */}
      <div style={styles.toolbar}>
        <input
          type="text"
          placeholder="Search train..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Error */}
      {error && <div style={styles.error}>{error}</div>}

      {/* Loading */}
      {loading ? (
        <div style={styles.message}>Loading trains...</div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Train Number</th>

                <th style={styles.th}>Train Name</th>

                <th style={styles.th}>Type</th>

                <th style={styles.th}>Total Seats</th>

                <th style={styles.th}>Status</th>

                <th style={styles.th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredTrains.length === 0 ? (
                <tr>
                  <td colSpan={6} style={styles.empty}>
                    No trains found.
                  </td>
                </tr>
              ) : (
                filteredTrains.map((train) => (
                  <tr
                    key={train._id}
                    style={{
                      backgroundColor: !train.isActive ? "#f7f7f7" : "#fff",
                      color: !train.isActive ? "#888" : "#111",
                    }}
                  >
                    <td style={styles.td}>
                      <p>{train.trainNumber}</p>
                    </td>

                    <td style={styles.td}>{train.name}</td>

                    <td style={styles.td}>N/A</td>

                    <td style={styles.td}>{train.capacity}</td>

                    <td style={styles.td}>
                      <span
                        style={train.isActive ? styles.active : styles.inactive}
                      >
                        {train.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <div style={styles.actions}>
                        {
                          // canUpdateTrains && (
                          //   <button
                          //     onClick={() =>
                          //       router.push(`/dashboard/trains/${train._id}/edit`)
                          //     }
                          //   >
                          //     Edit
                          //   </button>
                          // )
                          !train.isActive && (
                            <span style={{ color: "gray", fontSize: "12px" }}>
                              Deactivated
                            </span>
                          )
                        }

                        {canDeleteTrains && train.isActive && (
                          <button onClick={() => handleDelete(train._id)}>
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
          Showing {filteredTrains.length} of {trains.length} trains
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
    padding: "8px 12px",
    borderBottom: "1px solid #eee",
    whiteSpace: "nowrap",
  },

  active: {
    display: "inline-block",
    padding: "4px 8px",
    background: "#e8f5e9",
    color: "#26733a",
    fontSize: "12px",
  },
  inactive: {
    // display: "inline-block",
    padding: "4px 8px",
    background: "#f5e8e8ff",
    color: "red",
    fontSize: "12px",
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
  searchInput: {
    width: "320px",
    height: "40px",
    border: "1px solid #ccc",
    padding: "0 12px",
    fontSize: "14px",
    outline: "none",
    marginBottom: "15px",
  },
};
