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
  departureTime: string;
};

const days = [
  { label: "M", name: "Monday", value: 0 },
  { label: "T", name: "Tuesday", value: 1 },
  { label: "W", name: "Wednesday", value: 2 },
  { label: "T", name: "Thursday", value: 3 },
  { label: "F", name: "Friday", value: 4 },
  { label: "S", name: "Saturday", value: 5 },
  { label: "S", name: "Sunday", value: 6 },
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
      departureTime: "",
    },
    {
      stationId: "",
      arrivalTime: "",
      departureTime: "",
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
        departureTime: "",
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
          arrivalTime: stop.arrivalTime || undefined,
          departureTime: stop.departureTime || undefined,
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
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
        }}
      >
        <h2 style={{ margin: 0 }}>Add Schedule</h2>

        <button
          type="button"
          onClick={() => router.push("/dashboard/schedules")}
        >
          Back
        </button>
      </div>

      {/* Error */}
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
        {/* Train + Direction */}
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
            {/* Train */}
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

            {/* Direction */}
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

        {/* Stops */}
        <div
          style={{
            border: "1px solid #d6dbe1",
            padding: "12px",
            marginBottom: "10px",
          }}
        >
          {/* Stops Header */}
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

          {/* Table Header */}
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
            <strong>Departure</strong>
            <strong></strong>
          </div>

          {/* Stop Rows */}
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
              {/* Station */}
              <select
                value={stop.stationId}
                onChange={(e) => updateStop(index, "stationId", e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px",
                  boxSizing: "border-box",
                }}
              >
                <option value="">Select station</option>

                {stations.map((station) => (
                  <option key={station._id} value={station._id}>
                    {station.stationCode} - {station.name}
                  </option>
                ))}
              </select>

              {/* Arrival */}
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

              {/* Departure */}
              <input
                type="time"
                value={stop.departureTime}
                onChange={(e) =>
                  updateStop(index, "departureTime", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "5px",
                  boxSizing: "border-box",
                }}
              />

              {/* Remove */}
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

        {/* Operating Days + Status */}
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
            {/* Operating Days */}
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
                        width: "28px",
                        height: "28px",
                        padding: 0,
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

            {/* Status */}
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

        {/* Submit */}
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
