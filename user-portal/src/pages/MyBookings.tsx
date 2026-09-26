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
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>My Bookings</h2>

          <p style={styles.subtitle}>View and manage your train bookings</p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "25px",
            textAlign: "center",
          }}
        >
          <p style={{ margin: 0 }}>You don't have any bookings yet.</p>

          <button
            onClick={() => navigate("/")}
            style={{
              marginTop: "15px",
              padding: "8px 16px",
              cursor: "pointer",
            }}
          >
            Search Trains
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {bookings.map((booking) => {
            const train = booking.scheduleId?.trainId;
            return (
              <div key={booking._id} style={styles.bookingCard}>
                <div style={styles.bookingCardHeader}>
                  <div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
                    >
                      Booking ID: {booking._id}
                    </div>

                    {/* <div
                      style={{
                        marginTop: "3px",
                        fontSize: "11px",
                        color: "#777",
                      }}
                    >
                      Train booking
                    </div> */}
                  </div>

                  <div
                    style={{
                      padding: "4px 10px",
                      border: "1px solid #ddd",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  >
                    {booking.status}
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1px 220px",
                    gap: "20px",
                    padding: "16px",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "12px",
                        marginLeft: "4em",
                      }}
                    >
                      {train?.trainNumber && (
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#777",
                          }}
                        >
                          #{train.trainNumber}
                        </span>
                      )}
                      <strong
                        style={{
                          fontSize: "14px",
                        }}
                      >
                        {train?.name || "Train"}
                      </strong>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 70px 1fr",
                        alignItems: "center",
                        maxWidth: "520px",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: "17px",
                            fontWeight: 600,
                          }}
                        >
                          {booking.fromStationId?.stationCode}
                        </div>

                        <div
                          style={{
                            marginTop: "3px",
                            fontSize: "12px",
                            color: "#777",
                          }}
                        >
                          {booking.fromStationId?.name}
                        </div>
                      </div>

                      <div
                        style={{
                          textAlign: "center",
                          fontSize: "20px",
                          color: "#777",
                        }}
                      >
                        →
                      </div>

                      <div>
                        <div
                          style={{
                            fontSize: "17px",
                            fontWeight: 600,
                          }}
                        >
                          {booking.toStationId?.stationCode}
                        </div>

                        <div
                          style={{
                            marginTop: "3px",
                            fontSize: "12px",
                            color: "#777",
                          }}
                        >
                          {booking.toStationId?.name}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      width: "1px",
                      height: "70px",
                      backgroundColor: "#eee",
                    }}
                  />

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "14px 20px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#777",
                        }}
                      >
                        Journey Date
                      </div>

                      <strong style={{ fontSize: "13px" }}>
                        {booking.journeyDate}
                      </strong>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#777",
                          marginBottom: "3px",
                        }}
                      >
                        Seats
                      </div>

                      <strong style={{ fontSize: "13px" }}>
                        {booking.seats}
                      </strong>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#777",
                          marginBottom: "3px",
                        }}
                      >
                        Total Amount
                      </div>

                      <strong style={{ fontSize: "13px" }}>
                        ₹{booking.totalAmount}
                      </strong>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "8px",
                    padding: "10px 16px",
                    borderTop: "1px solid #eee",
                  }}
                >
                  {/* <button
                    onClick={() => navigate(`/booking/${booking._id}`)}
                    style={{
                      padding: "7px 14px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    View Booking
                  </button> */}

                  {booking.status === "CONFIRMED" && (
                    <button
                      style={{
                        padding: "7px 14px",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                      disabled
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyBookings;

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: "95%",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },

  title: {
    // margin: 0,
    textAlign: "left",

    fontSize: "24px",
    fontWeight: 600,
  },

  subtitle: {
    margin: "5px 0 0",
    fontSize: "14px",
    color: "#666",
  },

  // tableContainer: {
  //   border: "1px solid #ddd",
  //   background: "#fff",
  //   overflowX: "auto",
  // },

  bookingCard: {
    width: "60%",
    borderCollapse: "collapse",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#fff",
    overflow: "hidden",
  },

  bookingCardHeader: {
    // textAlign: "left",
    borderBottom: "1px solid #ddd",
    // background: "#fafafa",
    // fontWeight: 600,
    // whiteSpace: "nowrap",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
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
