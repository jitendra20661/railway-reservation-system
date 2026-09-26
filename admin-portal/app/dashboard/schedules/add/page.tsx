"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../../services/api";

type Train = {
  _id: string;
  trainNumber: string;
  name: string;
  capacity: number;
  isActive: boolean;
};

type Station = {
  _id: string;
  stationCode: string;
  name: string;
  city: string;
  state: string;
  distanceFromRoha: number;
  isActive: boolean;
};

type Stop = {
  stationId: string;
  arrivalTime: string;
  waitTime: string;
};

const days = [
  { label: "Mon", name: "Monday", value: 0 },
  { label: "Tue", name: "Tuesday", value: 1 },
  { label: "Wed", name: "Wednesday", value: 2 },
  { label: "Thu", name: "Thursday", value: 3 },
  { label: "Fri", name: "Friday", value: 4 },
  { label: "Sat", name: "Saturday", value: 5 },
  { label: "Sun", name: "Sunday", value: 6 },
];

export default function AddSchedulePage() {
  const router = useRouter();

  const [trains, setTrains] = useState<Train[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [trainId, setTrainId] = useState("");
  const [direction, setDirection] = useState("ROHA_TO_THOKUR");

  const [stops, setStops] = useState<Stop[]>([
    {
      stationId: "",
      arrivalTime: "",
      waitTime: "",
    },
    {
      stationId: "",
      arrivalTime: "",
      waitTime: "",
    },
  ]);

  const [selectedDays, setSelectedDays] = useState<number[]>([
    0, 1, 2, 3, 4, 5, 6,
  ]);

  const [status, setStatus] = useState("ACTIVE");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trainsResponse, stationsResponse] = await Promise.all([
          api.get("/train"),
          api.get("/station"),
        ]);

        setTrains(trainsResponse.data.filter((train: Train) => train.isActive));

        setStations(
          stationsResponse.data.filter((station: Station) => station.isActive),
        );
      } catch (error) {
        console.error("Failed to load data:", error);
        setError("Failed to load trains or stations.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateStop = (index: number, field: keyof Stop, value: string) => {
    setStops((currentStops) =>
      currentStops.map((stop, i) =>
        i === index
          ? {
              ...stop,
              [field]: value,
            }
          : stop,
      ),
    );
  };

  const addStop = () => {
    setStops((currentStops) => [
      ...currentStops,
      {
        stationId: "",
        arrivalTime: "",
        waitTime: "",
      },
    ]);
  };

  const removeStop = (index: number) => {
    if (stops.length <= 2) {
      return;
    }

    setStops((currentStops) => currentStops.filter((_, i) => i !== index));
  };

  const toggleDay = (day: number) => {
    setSelectedDays((currentDays) => {
      if (currentDays.includes(day)) {
        return currentDays.filter((d) => d !== day);
      }

      return [...currentDays, day].sort();
    });
  };

  const getOperatingDays = () => {
    return days
      .map((day) => (selectedDays.includes(day.value) ? "1" : "0"))
      .join("");
  };

  const calculateDepartureTime = (arrivalTime: string, waitTime: string) => {
    if (!arrivalTime || !waitTime) {
      return undefined;
    }

    const [hours, minutes] = arrivalTime.split(":").map(Number);
    const waitMinutes = Number(waitTime);

    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes) ||
      Number.isNaN(waitMinutes) ||
      waitMinutes < 0
    ) {
      return undefined;
    }

    const totalMinutes = hours * 60 + minutes + waitMinutes;

    const departureHours = Math.floor(totalMinutes / 60) % 24;
    const departureMinutes = totalMinutes % 60;

    return `${String(departureHours).padStart(2, "0")}:${String(
      departureMinutes,
    ).padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    if (!trainId) {
      setError("Please select a train.");
      return;
    }

    if (stops.length < 2) {
      setError("A schedule must have at least 2 stops.");
      return;
    }

    if (stops.some((stop) => !stop.stationId)) {
      setError("Please select a station for every stop.");
      return;
    }

    if (
      stops.some(
        (stop) =>
          !stop.arrivalTime || !stop.waitTime || Number(stop.waitTime) < 0,
      )
    ) {
      setError("Please enter arrival time and wait time for every stop.");
      return;
    }

    if (selectedDays.length === 0) {
      setError("Please select at least one operating day.");
      return;
    }

    try {
      setSaving(true);

      await api.post("/schedule", {
        trainId,
        direction,
        stops: stops.map((stop) => ({
          stationId: stop.stationId,
          arrivalTime: stop.arrivalTime,
          departureTime: calculateDepartureTime(
            stop.arrivalTime,
            stop.waitTime,
          ),
        })),
        operatingDays: getOperatingDays(),
        status,
      });

      router.push("/dashboard/schedules");
    } catch (error: any) {
      console.error("Failed to create schedule:", error);

      const message = error.response?.data?.message;

      if (Array.isArray(message)) {
        setError(message.join(", "));
      } else {
        setError(message || "Failed to create schedule.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div
      style={{
        maxWidth: "800px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
        }}
      >
        <h2 style={{ margin: 0 }}>Add Schedule</h2>
      </div>

      {error && (
        <div
          style={{
            border: "1px solid #edcccc",
            backgroundColor: "#fdf0f0",
            color: "#a33a3a",
            padding: "8px 10px",
            marginBottom: "10px",
            fontSize: "13px",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div
          style={{
            border: "1px solid #d6dbe1",
            padding: "12px",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px",
            }}
          >
            <div>
              <label
                htmlFor="train"
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                Train
              </label>

              <select
                id="train"
                value={trainId}
                onChange={(e) => setTrainId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "7px",
                  boxSizing: "border-box",
                }}
              >
                <option value="">Select train</option>

                {trains.map((train) => (
                  <option key={train._id} value={train._id}>
                    {train.trainNumber} - {train.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="direction"
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                Direction
              </label>

              <select
                id="direction"
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                style={{
                  width: "100%",
                  padding: "7px",
                  boxSizing: "border-box",
                }}
              >
                <option value="ROHA_TO_THOKUR">Roha → Thokur</option>

                <option value="THOKUR_TO_ROHA">Thokur → Roha</option>
              </select>
            </div>
          </div>
        </div>

        {/* ========== Stops Container ========== */}
        <div
          style={{
            border: "1px solid #d6dbe1",
            padding: "12px",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "7px",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "14px",
              }}
            >
              Stops
            </h3>

            <button type="button" onClick={addStop}>
              + Add Stop
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 120px 120px 65px",
              gap: "8px",
              padding: "5px 8px",
              backgroundColor: "#f1f3f5",
              borderTop: "1px solid #d6dbe1",
              borderBottom: "1px solid #d6dbe1",
              fontSize: "12px",
              color: "#555",
            }}
          >
            <strong>Station</strong>
            <strong>Arrival</strong>
            <strong>Wait Time</strong>
            <strong></strong>
          </div>

          {stops.map((stop, index) => (
            <div
              key={index}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 120px 120px 65px",
                gap: "8px",
                alignItems: "center",
                padding: "6px 8px",
                borderBottom: "1px solid #eee",
              }}
            >
              <select
                value={stop.stationId}
                onChange={(e) => updateStop(index, "stationId", e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px",
                  boxSizing: "border-box",
                }}
              >
                <option value="" disabled>
                  Select station
                </option>

                {stations
                  .filter(
                    (station) =>
                      !stops.some(
                        (otherStop, otherIndex) =>
                          otherIndex !== index &&
                          otherStop.stationId === station._id,
                      ),
                  )
                  .map((station) => (
                    <option key={station._id} value={station._id}>
                      {station.stationCode} - {station.name}
                    </option>
                  ))}
              </select>

              <input
                type="time"
                value={stop.arrivalTime}
                onChange={(e) =>
                  updateStop(index, "arrivalTime", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "5px",
                  boxSizing: "border-box",
                }}
              />

              <input
                type="number"
                min="0"
                value={stop.waitTime}
                onChange={(e) => updateStop(index, "waitTime", e.target.value)}
                style={{
                  width: "100%",
                  padding: "5px",
                  boxSizing: "border-box",
                }}
              />

              <button
                type="button"
                onClick={() => removeStop(index)}
                disabled={stops.length <= 2}
                style={{
                  fontSize: "12px",
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* ==========Operating Days Container========== */}
        <div
          style={{
            border: "1px solid #d6dbe1",
            padding: "12px",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: "20px",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  marginBottom: "6px",
                }}
              >
                Operating Days
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "4px",
                }}
              >
                {days.map((day) => {
                  const isSelected = selectedDays.includes(day.value);

                  return (
                    <button
                      key={day.value}
                      type="button"
                      title={day.name}
                      onClick={() => toggleDay(day.value)}
                      style={{
                        // width: "28px",
                        // height: "28px",
                        padding: 5,
                        marginRight: 5,
                        border: "1px solid",
                        borderColor: isSelected ? "#b9d8bf" : "#ddd",
                        backgroundColor: isSelected ? "#eef8f0" : "#f5f5f5",
                        color: isSelected ? "#276738" : "#999",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>

              <div
                style={{
                  marginTop: "5px",
                  fontSize: "11px",
                  color: "#777",
                }}
              >
                {getOperatingDays()}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  marginBottom: "6px",
                }}
              >
                Status
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                }}
              >
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{
                    padding: "6px 8px",
                  }}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>

                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    backgroundColor:
                      status === "ACTIVE" ? "#4d9b5f" : "#c65a5a",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            width: "100%",
            padding: "9px",
            fontWeight: 600,
          }}
        >
          {saving ? "Creating..." : "Create Schedule"}
        </button>
      </form>
    </div>
  );
}
