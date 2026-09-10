"use client";

import { useEffect, useState } from "react";
import api from "../../../services/api";
import { useRouter } from "next/navigation";

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

const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

export default function SchedulesPage() {
  const router = useRouter();

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
        }}
      >
        <h2 style={{ margin: 0 }}>Schedules</h2>

        <button onClick={() => router.push("/dashboard/schedules/add")}>
          Add Schedule
        </button>
      </div>

      {/* Empty State */}
      {schedules.length === 0 ? (
        <p>No schedules found.</p>
      ) : (
        schedules.map((schedule) => (
          <div
            key={schedule._id}
            style={{
              border: "1px solid #d6dbe1",
              padding: "10px 12px",
              marginBottom: "8px",
            }}
          >
            {/* Train */}
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "7px",
                marginBottom: "7px",
              }}
            >
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
                    color: "#666",
                  }}
                >
                  Days
                </span>

                {dayLabels.map((day, index) => {
                  const isActive = schedule.operatingDays[index] === "1";

                  return (
                    <span
                      key={index}
                      title={isActive ? "Operating" : "Not operating"}
                      style={{
                        width: "20px",
                        height: "20px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        fontWeight: 600,
                        border: "1px solid",
                        borderColor: isActive ? "#b9d8bf" : "#ddd",
                        backgroundColor: isActive ? "#eef8f0" : "#f5f5f5",
                        color: isActive ? "#276738" : "#999",
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
