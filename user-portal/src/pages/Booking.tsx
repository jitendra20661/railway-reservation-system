import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import type {
  BookingAvailability,
  SearchSchedule,
  SearchState,
} from "../types";
import { getErrorMessage } from "../utils";

function Booking() {
  const location = useLocation();
  const navigate = useNavigate();

  const schedule = location.state?.schedule as SearchSchedule | undefined;
  const search = location.state?.search as SearchState | undefined;

  const [availability, setAvailability] = useState<BookingAvailability | null>(
    null,
  );
  const [seats, setSeats] = useState(1);

  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");

  const pricePerSeat = 100;

  useEffect(() => {
    if (!schedule || !search) {
      setLoading(false);
      return;
    }

    const fetchAvailability = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/booking/availability", {
          params: {
            scheduleId: schedule.scheduleId,
            fromStationId: schedule.from.stationId,
            toStationId: schedule.to.stationId,
            journeyDate: search.date,
          },
        });

        setAvailability(response.data);
      } catch (error) {
        console.error(error);

        setError(getErrorMessage(error, "Unable to check seat availability."));
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [schedule, search]);

  const handleBooking = async () => {
    if (!schedule || !search) {
      setError("Booking details are missing. Please search for a train again.");
      return;
    }
    try {
      setBookingLoading(true);
      setError("");

      await api.post("/booking", {
        scheduleId: schedule.scheduleId,
        journeyDate: search.date,
        fromStationId: schedule.from.stationId,
        toStationId: schedule.to.stationId,
        seats: seats,
      });

      alert("Booking successful!");

      navigate("/my-bookings");
    } catch (error) {
      console.error(error);

      setError(getErrorMessage(error, "Unable to complete booking."));
    } finally {
      setBookingLoading(false);
    }
  };

  if (!schedule || !search) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>No train selected</h2>

        <button onClick={() => navigate("/")}>Back to Search</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: "20px" }}>
        <p>Checking seat availability...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "6px",
          padding: "16px",
          width: "360px",
          maxWidth: "100%",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        <h2 style={{ margin: "0 0 14px" }}>Booking Details</h2>

        {/* Train */}
        <div style={{ marginBottom: "10px" }}>
          <strong>{schedule.train?.name || "Train"}</strong>

          {schedule.train?.number && <span> ({schedule.train.number})</span>}
        </div>

        {/* Journey */}
        {/* Journey */}
        <div style={{ marginBottom: "12px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
            }}
          >
            <div>
              <strong>{schedule.from.stationCode}</strong>
              <div style={{ fontSize: "13px" }}>
                {schedule.from.stationName}
              </div>
            </div>

            <div style={{ fontSize: "18px" }}>→</div>

            <div style={{ textAlign: "right" }}>
              <strong>{schedule.to.stationCode}</strong>
              <div style={{ fontSize: "13px" }}>{schedule.to.stationName}</div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "5px",
              fontSize: "14px",
            }}
          >
            <span>{schedule.from.departureTime}</span>
            <span>{schedule.to.arrivalTime}</span>
          </div>

          <div
            style={{
              marginTop: "5px",
              fontSize: "14px",
            }}
          >
            Date: <strong>{search.date}</strong>
          </div>
        </div>

        {/* Availability */}
        <div
          style={{
            borderTop: "1px solid #eee",
            borderBottom: "1px solid #eee",
            padding: "9px 0",
            marginBottom: "12px",
          }}
        >
          <strong>{availability?.availableSeats || 0}</strong> seats available
        </div>

        {/* Seats + Price */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <div>
            <label>Seats</label>

            <div style={{ marginTop: "4px" }}>
              <input
                type="number"
                min="1"
                max={availability?.availableSeats || 1}
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                style={{
                  width: "55px",
                  padding: "5px",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div>₹{pricePerSeat} / seat</div>

            <div style={{ marginTop: "4px" }}>
              Total: <strong>₹{seats * pricePerSeat}</strong>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && <p style={{ margin: "0 0 12px" }}>{error}</p>}

        {/* Confirm */}
        <button
          onClick={handleBooking}
          disabled={
            bookingLoading ||
            !availability ||
            availability.availableSeats === 0 ||
            seats < 1 ||
            seats > availability.availableSeats
          }
          style={{ width: "100%" }}
        >
          {bookingLoading ? "Booking..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
}

export default Booking;
