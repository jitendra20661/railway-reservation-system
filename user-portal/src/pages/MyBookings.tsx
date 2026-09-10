import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/booking/my-bookings");

        setBookings(response.data);
      } catch (error) {
        console.error(error);

        setError(
          error.response?.data?.message || "Unable to fetch your bookings.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "20px" }}>
        <p>Loading your bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>My Bookings</h2>

        <p>{error}</p>

        <button onClick={() => navigate("/")}>Back to Search</button>
      </div>
    );
  }

  return (
    <div
      // style={{ padding: "20px", minWidth: "700px", margin: "0 auto" }}
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "20px",
        minWidth: "700px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ margin: 0 }}>My Bookings</h2>

        {/* <button onClick={() => navigate("/")}>Search Trains</button> */}
      </div>

      {/* No bookings */}
      {bookings.length === 0 ? (
        <div
          style={{
            border: "1px solid #ccc",
            padding: "20px",
          }}
        >
          <p style={{ margin: 0 }}>You don't have any bookings yet.</p>
        </div>
      ) : (
        /* Bookings */
        <div>
          {bookings.map((booking) => (
            <div
              key={booking._id}
              style={{
                border: "1px solid #ccc",
                marginBottom: "15px",
                padding: "16px",
              }}
            >
              {/* Booking Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: "10px",
                  borderBottom: "1px solid #eee",
                }}
              >
                <strong>Booking ID: {booking._id}</strong>

                <strong>{booking.status}</strong>
              </div>

              {/* Journey */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "15px",
                  gap: "20px",
                }}
              >
                <div>
                  <strong>{booking.fromStationId.name}</strong>

                  <div>{booking.fromStationId.stationCode}</div>
                </div>

                <div>→</div>

                <div>
                  <strong>{booking.toStationId.name}</strong>

                  <div>{booking.toStationId.stationCode}</div>
                </div>
              </div>

              {/* Booking Details */}
              {/* <div
                style={{
                  marginTop: "15px",
                  paddingTop: "10px",
                  borderTop: "1px solid #eee",
                }}
              >
                <p>
                  <strong>Journey Date:</strong> {booking.journeyDate}
                </p>

                <p>
                  <strong>Seats:</strong> {booking.seats}
                </p>

                <p>
                  <strong>Total Amount:</strong> ₹{booking.totalAmount}
                </p>
              </div> */}
              <div
                style={{
                  marginTop: "12px",
                  paddingTop: "10px",
                  borderTop: "1px solid #eee",
                  display: "flex",
                  gap: "30px",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong>Date:</strong> {booking.journeyDate}
                </div>

                <div>
                  <strong>Seats:</strong> {booking.seats}
                </div>

                <div>
                  <strong>Amount:</strong> ₹{booking.totalAmount}
                </div>
              </div>

              {/* View Booking */}
              {/* <div style={{ marginTop: "15px" }}>
                <button onClick={() => navigate(`/booking/${booking._id}`)}>
                  View Booking
                </button>
              </div> */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookings;
