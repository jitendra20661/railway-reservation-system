"use client";

import { useEffect, useState } from "react";
import api from "../../../services/api";
import { useRouter } from "next/navigation";
import { getUser, hasPermission } from "@/services/auth";
import { ACTION, RESOURCE } from "@/services/permissions";
import { Roles } from "@/services/roles";

type Station = {
  _id: string;
  stationCode: string;
  name: string;
};

type Train = {
  _id: string;
  trainNumber: string;
  name: string;
};

type ScheduleStop = {
  stationId: Station;
  arrivalTime?: string;
  departureTime?: string;
};

type Schedule = {
  _id: string;
  trainId: Train;
  direction: string;
  stops: ScheduleStop[];
  operatingDays: string;
  status: string;
};

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function SchedulesPage() {
  const router = useRouter();

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const currentUser = getUser();

  const canViewTrains =
    currentUser?.role === Roles.SUPER_ADMIN ||
    hasPermission(RESOURCE.TRAINS, ACTION.READ);

  const canCreateSchedules =
    currentUser?.role === Roles.SUPER_ADMIN ||
    hasPermission(RESOURCE.TRAINS, ACTION.CREATE);

  const canUpdateTrains =
    currentUser?.role === Roles.SUPER_ADMIN ||
    hasPermission(RESOURCE.TRAINS, ACTION.UPDATE);

  const canDeleteTrains =
    currentUser?.role === Roles.SUPER_ADMIN ||
    hasPermission(RESOURCE.TRAINS, ACTION.DELETE);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await api.get("/schedule");

        console.log("Schedule response:", response.data);

        setSchedules(response.data);
      } catch (error) {
        console.error("Failed to fetch schedules:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  const filteredSchedules = schedules.filter((schedule) => {
    const value = search.toLowerCase();

    return (
      schedule.trainId.name.toLowerCase().includes(value) ||
      schedule.trainId.trainNumber.toLowerCase().includes(value) ||
      schedule.stops.some((stop) =>
        stop.stationId.name.toLowerCase().includes(value),
      )
    );
  });

  const formatDirection = (direction: string) => {
    if (direction === "ROHA_TO_THOKUR") {
      return "Roha → Thokur";
    }

    if (direction === "THOKUR_TO_ROHA") {
      return "Thokur → Roha";
    }

    return direction;
  };

  if (loading) {
    return <p>Loading schedules...</p>;
  }

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this schedule?",
    );

    if (!confirmed) return;

    try {
      await api.delete(`/schedule/${id}`);

      setSchedules((current) =>
        current.filter((schedule) => schedule._id !== id),
      );
    } catch (error: any) {
      console.error("Failed to delete schedule:", error);

      alert(error?.response?.data?.message || "Failed to delete schedule.");
    }
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Schedules</h1>

          <p style={styles.subtitle}>Manage railway schedules.</p>
        </div>

        {canCreateSchedules && (
          <button onClick={() => router.push("/dashboard/schedules/add")}>
            + Add Schedule
          </button>
        )}
      </div>

      {/* Search */}
      <div style={styles.toolbar}>
        <input
          type="text"
          placeholder="Search schedules..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Error */}
      {error && <div style={styles.error}>{error}</div>}

      {/* Empty State */}
      {schedules.length === 0 ? (
        <p>No schedules found.</p>
      ) : (
        filteredSchedules.map((schedule) => (
          <div
            key={schedule._id}
            style={{
              border: "1px solid #d6dbe1",
              padding: "10px 12px",
              marginBottom: "20px",
              // maxWidth: "60%",
              // minWidth: "400px",
              // margin: "20px auto",
            }}
          >
            {/* Train */}

            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: "7px",
                marginBottom: "7px",
              }}
            >
              <div>
                <strong
                  style={{
                    fontSize: "16px",
                    color: "#1e3a5f",
                  }}
                >
                  {schedule.trainId.name}
                </strong>

                <span
                  style={{
                    fontSize: "12px",
                    color: "#666",
                  }}
                >
                  #{schedule.trainId.trainNumber}
                </span>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => handleDelete(schedule._id)}
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Metadata */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "9px",
                fontSize: "12px",
              }}
            >
              {/* Direction */}
              <div
                style={{
                  padding: "3px 7px",
                  backgroundColor: "#eef4fb",
                  border: "1px solid #d6e2f0",
                  color: "#315a82",
                }}
              >
                {formatDirection(schedule.direction)}
              </div>

              {/* Status */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  color: schedule.status === "ACTIVE" ? "#276738" : "#a33a3a",
                }}
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    backgroundColor:
                      schedule.status === "ACTIVE" ? "#4d9b5f" : "#c65a5a",
                    display: "inline-block",
                  }}
                />

                {schedule.status}
              </div>

              {/* Operating Days */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                <span
                  style={{
                    marginRight: "3px",
                    marginLeft: "3px",
                    color: "#666",
                  }}
                >
                  Runs:
                </span>

                {dayLabels.map((day, index) => {
                  const isActive = schedule.operatingDays[index] === "1";

                  return (
                    <span
                      key={index}
                      title={isActive ? "Operating" : "Not operating"}
                      style={{
                        // width: "20px",
                        // height: "20px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        fontWeight: 600,
                        border: "1px solid",
                        borderColor: isActive ? "#b9d8bf" : "#ddd",
                        backgroundColor: isActive ? "#eef8f0" : "#f5f5f5",
                        color: isActive ? "#276738" : "#999",
                        padding: "2px",
                        marginRight: "3px",
                      }}
                    >
                      {day}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Stops */}
            <div>
              <strong
                style={{
                  fontSize: "13px",
                }}
              >
                Stops
              </strong>

              {/* Table Header */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "65px 1fr 100px 100px",
                  gap: "8px",
                  padding: "5px 8px",
                  borderTop: "1px solid #d6dbe1",
                  borderBottom: "1px solid #d6dbe1",
                  marginTop: "4px",
                  backgroundColor: "#f1f3f5",
                  fontSize: "12px",
                  color: "#555",
                }}
              >
                <strong>Code</strong>
                <strong>Station</strong>
                <strong>Arrival</strong>
                <strong>Departure</strong>
              </div>

              {/* Stops */}
              {schedule.stops.map((stop, stopIndex) => (
                <div
                  key={stopIndex}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "65px 1fr 100px 100px",
                    gap: "8px",
                    alignItems: "center",
                    padding: "5px 8px",
                    borderBottom: "1px solid #eee",
                    fontSize: "13px",
                  }}
                >
                  <strong
                    style={{
                      color: "#1e3a5f",
                    }}
                  >
                    {stop.stationId.stationCode}
                  </strong>

                  <span>{stop.stationId.name}</span>

                  <span>{stop.arrivalTime || "-"}</span>

                  <span>{stop.departureTime || "-"}</span>
                </div>
              ))}
            </div>
          </div>
        ))
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
