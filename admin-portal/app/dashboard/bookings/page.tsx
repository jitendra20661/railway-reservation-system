"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";
type ReportStatus = "ALL" | BookingStatus;

type Train = {
  _id: string;
  trainNumber: string;
  name: string;
};

type Station = {
  _id: string;
  stationCode: string;
  name: string;
};

type Booking = {
  _id: string;
  journeyDate: string;
  seats: number;
  status: BookingStatus;
  totalAmount?: number;
  createdAt?: string;
  user?: {
    _id?: string;
    name?: string;
    email?: string;
  };
  train?: {
    _id?: string;
    trainNumber?: string;
    name?: string;
  };
  fromStation?: {
    _id?: string;
    stationCode?: string;
    name?: string;
  };
  toStation?: {
    _id?: string;
    stationCode?: string;
    name?: string;
  };
};

type BookingReportResponse = {
  bookings: Booking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalBookings: number;
    totalSeats: number;
    confirmedBookings: number;
    pendingBookings: number;
    cancelledBookings: number;
  };
};

const emptySummary: BookingReportResponse["summary"] = {
  totalBookings: 0,
  totalSeats: 0,
  confirmedBookings: 0,
  pendingBookings: 0,
  cancelledBookings: 0,
};

const emptyPagination: BookingReportResponse["pagination"] = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

export default function BookingReportsPage() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [status, setStatus] = useState<ReportStatus>("ALL");
  const [trainId, setTrainId] = useState("");
  const [fromStationId, setFromStationId] = useState("");
  const [toStationId, setToStationId] = useState("");
  const [search, setSearch] = useState("");

  const [trains, setTrains] = useState<Train[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [summary, setSummary] =
    useState<BookingReportResponse["summary"]>(emptySummary);

  const [pagination, setPagination] =
    useState<BookingReportResponse["pagination"]>(emptyPagination);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const page = pagination.page;
  const limit = pagination.limit;

  const filteredBookings = bookings.filter((booking) => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return true;
    }

    return [
      booking._id,
      booking.journeyDate,
      booking.status,
      booking.user?.name,
      booking.user?.email,
      booking.train?.trainNumber,
      booking.train?.name,
      booking.fromStation?.stationCode,
      booking.fromStation?.name,
      booking.toStation?.stationCode,
      booking.toStation?.name,
      booking.seats?.toString(),
      booking.totalAmount?.toString(),
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(searchText));
  });

  useEffect(() => {
    loadFilterData();
    loadReport(1);
  }, []);

  async function loadFilterData() {
    try {
      const [trainResponse, stationResponse] = await Promise.all([
        api.get("/train"),
        api.get("/station"),
      ]);

      setTrains(trainResponse.data);
      setStations(stationResponse.data);
    } catch (error: any) {
      console.error(error);
      setError(error?.response?.data?.message || "Failed to load filter data.");
    }
  }

  async function loadReport(requestedPage = 1) {
    if ((fromDate && !toDate) || (!fromDate && toDate)) {
      setError("Please select both from and to dates.");
      return;
    }

    if (fromDate && toDate && fromDate > toDate) {
      setError("From date cannot be after to date.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const params: Record<string, string> = {
        page: String(requestedPage),
        limit: String(limit),
      };

      if (fromDate) {
        params.from = fromDate;
      }

      if (toDate) {
        params.to = toDate;
      }

      if (status !== "ALL") {
        params.status = status;
      }

      if (trainId) {
        params.trainId = trainId;
      }

      if (fromStationId) {
        params.fromStationId = fromStationId;
      }

      if (toStationId) {
        params.toStationId = toStationId;
      }

      const response = await api.get("/booking/report", {
        params,
      });

      const data: BookingReportResponse = response.data;

      setBookings(data.bookings);
      setSummary(data.summary);
      setPagination(data.pagination);
    } catch (error: any) {
      console.error(error);

      setBookings([]);
      setSummary(emptySummary);

      setPagination({
        ...emptyPagination,
        limit,
      });

      setError(
        error?.response?.data?.message || "Failed to load booking report.",
      );
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    setSearch("");
    loadReport(1);
  }

  async function loadUnfilteredReport() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/booking/report", {
        params: {
          page: "1",
          limit: String(limit),
        },
      });

      const data: BookingReportResponse = response.data;

      setBookings(data.bookings);
      setSummary(data.summary);
      setPagination(data.pagination);
    } catch (error: any) {
      console.error(error);

      setBookings([]);
      setSummary(emptySummary);

      setPagination({
        ...emptyPagination,
        limit,
      });

      setError(
        error?.response?.data?.message || "Failed to load booking report.",
      );
    } finally {
      setLoading(false);
    }
  }

  function goToPreviousPage() {
    if (page <= 1 || loading) {
      return;
    }

    loadReport(page - 1);
  }

  function goToNextPage() {
    if (page >= pagination.totalPages || loading) {
      return;
    }

    loadReport(page + 1);
  }

  const firstRow = pagination.total === 0 ? 0 : (page - 1) * limit + 1;

  const lastRow =
    pagination.total === 0 ? 0 : Math.min(page * limit, pagination.total);

  function exportCSV() {
    if (filteredBookings.length === 0) {
      return;
    }

    const rows = filteredBookings.map((booking) => ({
      "Booking ID": booking._id,
      "Journey Date": booking.journeyDate,
      "User Name": booking.user?.name || "",
      "User Email": booking.user?.email || "",
      "Train Number": booking.train?.trainNumber || "",
      "Train Name": booking.train?.name || "",
      "From Station": booking.fromStation?.stationCode || "",
      "To Station": booking.toStation?.stationCode || "",
      Seats: booking.seats,
      "Total Amount": booking.totalAmount ?? "",
      Status: booking.status,
      "Created At": booking.createdAt || "",
    }));

    const headers = Object.keys(rows[0]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) => {
            const value = row[header as keyof typeof row];

            return `"${String(value ?? "").replace(/"/g, '""')}"`;
          })
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "booking-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  function exportExcel() {
    if (filteredBookings.length === 0) {
      return;
    }

    const rows = filteredBookings.map((booking) => ({
      "Booking ID": booking._id,
      "Journey Date": booking.journeyDate,
      "User Name": booking.user?.name || "",
      "User Email": booking.user?.email || "",
      "Train Number": booking.train?.trainNumber || "",
      "Train Name": booking.train?.name || "",
      "From Station": booking.fromStation?.stationCode || "",
      "To Station": booking.toStation?.stationCode || "",
      Seats: booking.seats,
      "Total Amount": booking.totalAmount ?? "",
      Status: booking.status,
      "Created At": booking.createdAt || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");

    XLSX.writeFile(workbook, "booking-report.xlsx");
  }

  function exportPDF() {
    if (filteredBookings.length === 0) {
      return;
    }

    const doc = new jsPDF("landscape");

    doc.setFontSize(16);
    doc.text("Booking Report", 14, 15);

    const body = filteredBookings.map((booking) => [
      booking._id,
      booking.journeyDate,
      booking.user?.name || "",
      booking.train?.trainNumber || "",
      `${booking.fromStation?.stationCode || ""} → ${
        booking.toStation?.stationCode || ""
      }`,
      booking.seats,
      booking.totalAmount ?? "",
      booking.status,
    ]);

    autoTable(doc, {
      startY: 22,
      head: [
        [
          "Booking ID",
          "Journey Date",
          "User",
          "Train",
          "Route",
          "Seats",
          "Amount",
          "Status",
        ],
      ],
      body,
      styles: {
        fontSize: 8,
      },
    });

    doc.save("booking-report.pdf");
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Booking Reports</h1>
          <p style={styles.subtitle}>View and filter booking data.</p>
        </div>
      </div>

      {/* ======Filters Form====== */}
      <div
        style={{
          border: "1px solid #ddd",
          padding: "18px",
          marginBottom: "20px",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, minmax(140px, 1fr))",
            gap: "14px",
          }}
        >
          <div>
            <label style={labelStyle}>From Date</label>

            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div>
            <label style={labelStyle}>To Date</label>

            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div>
            <label style={labelStyle}>Status</label>

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as ReportStatus)
              }
              style={styles.searchInput}
            >
              <option value="ALL">All</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PENDING">Pending</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Train</label>

            <select
              value={trainId}
              onChange={(event) => setTrainId(event.target.value)}
              style={styles.searchInput}
            >
              <option value="">All</option>

              {trains.map((train) => (
                <option key={train._id} value={train._id}>
                  {train.trainNumber} - {train.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>From Station</label>

            <select
              value={fromStationId}
              onChange={(event) => setFromStationId(event.target.value)}
              style={styles.searchInput}
            >
              <option value="">All Stations</option>

              {stations.map((station) => (
                <option key={station._id} value={station._id}>
                  {station.stationCode} - {station.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>To Station</label>

            <select
              value={toStationId}
              onChange={(event) => setToStationId(event.target.value)}
              style={styles.searchInput}
            >
              <option value="">All Stations</option>

              {stations.map((station) => (
                <option key={station._id} value={station._id}>
                  {station.stationCode} - {station.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            marginTop: "16px",
          }}
        >
          <button onClick={applyFilters} disabled={loading}>
            {loading ? "Loading..." : "Apply Filters"}
          </button>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(140px, 1fr))",
          gap: "12px",
          marginBottom: "20px",
          marginTop: "40px",
        }}
      >
        <SummaryCard label="Total Bookings" value={summary.totalBookings} />

        <SummaryCard label="Confirmed" value={summary.confirmedBookings} />

        <SummaryCard label="Pending" value={summary.pendingBookings} />

        <SummaryCard label="Cancelled" value={summary.cancelledBookings} />

        <SummaryCard label="Total Seats" value={summary.totalSeats} />
      </div>

      {/* =========Bookings Table=========  */}
      <div style={styles.tableContainer}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "14px 16px",
            borderBottom: "1px solid #ddd",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              color: "#666",
            }}
          >
            Showing {firstRow}–{lastRow} of {pagination.total}
          </span>

          <div
            style={{
              display: "flex",
              gap: "6px",
              marginLeft: "auto",
            }}
          >
            <input
              type="text"
              value={search}
              placeholder="Search bookings..."
              onChange={(event) => setSearch(event.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "6px",
            }}
          >
            <button
              onClick={exportCSV}
              disabled={filteredBookings.length === 0}
            >
              CSV
            </button>

            <button
              onClick={exportExcel}
              disabled={filteredBookings.length === 0}
            >
              Excel
            </button>

            <button
              onClick={exportPDF}
              disabled={filteredBookings.length === 0}
            >
              PDF
            </button>
          </div>
        </div>

        {loading ? (
          <div
            style={{
              padding: "50px",
              textAlign: "center",
              color: "#666",
              fontSize: "14px",
            }}
          >
            Loading bookings...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div
            style={{
              padding: "50px",
              textAlign: "center",
              color: "#666",
              fontSize: "14px",
            }}
          >
            {search.trim()
              ? "No bookings match your search."
              : "No bookings found."}
          </div>
        ) : (
          <>
            <div
              style={{
                overflowX: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "1050px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    <th style={thStyle}>Booking</th>

                    <th style={thStyle}>Journey</th>

                    <th style={thStyle}>User</th>

                    <th style={thStyle}>Train</th>

                    <th style={thStyle}>Route</th>

                    <th style={thStyle}>Seats</th>

                    <th style={thStyle}>Amount</th>

                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr
                      key={booking._id}
                      style={{
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <td style={tdStyle}>
                        <div
                          style={{
                            fontSize: "11px",
                            fontFamily: "monospace",
                          }}
                        >
                          {booking._id}
                        </div>
                      </td>

                      <td style={tdStyle}>
                        <div style={tbStyle}>{booking.journeyDate}</div>
                      </td>

                      <td style={tdStyle}>
                        <div style={tbStyle}>{booking.user?.name || "—"}</div>

                        <div
                          style={{
                            fontSize: "11px",
                            color: "#777",
                            marginTop: "2px",
                          }}
                        >
                          {booking.user?.email || "—"}
                        </div>
                      </td>

                      <td style={tdStyle}>
                        <div style={tbStyle}>
                          {booking.train?.trainNumber || "—"}
                        </div>

                        <div
                          style={{
                            fontSize: "11px",
                            color: "#777",
                            marginTop: "2px",
                          }}
                        >
                          {booking.train?.name || "—"}
                        </div>
                      </td>

                      <td style={tdStyle}>
                        <div style={tbStyle}>
                          {booking.fromStation?.stationCode || "—"} →{" "}
                          {booking.toStation?.stationCode || "—"}
                        </div>

                        <div
                          style={{
                            fontSize: "11px",
                            color: "#777",
                            marginTop: "2px",
                          }}
                        >
                          {booking.fromStation?.name || "—"} →{" "}
                          {booking.toStation?.name || "—"}
                        </div>
                      </td>

                      <td style={tdStyle}>{booking.seats}</td>

                      <td style={tdStyle}>
                        {booking.totalAmount !== undefined
                          ? `₹${booking.totalAmount}`
                          : "—"}
                      </td>

                      <td style={tdStyle}>{booking.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 16px",
                borderTop: "1px solid #ddd",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  color: "#666",
                }}
              >
                Showing {firstRow}–{lastRow} of {pagination.total} bookings
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <button
                  onClick={goToPreviousPage}
                  disabled={page <= 1 || loading}
                >
                  Previous
                </button>

                <span
                  style={{
                    fontSize: "13px",
                    color: "#555",
                  }}
                >
                  Page {page} of {pagination.totalPages}
                </span>

                <button
                  onClick={goToNextPage}
                  disabled={page >= pagination.totalPages || loading}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        padding: "14px 16px",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "0.08em",
          color: "#777",
          textTransform: "uppercase",
          marginBottom: "6px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "22px",
          fontWeight: 600,
        }}
      >
        {value}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "6px",
  fontSize: "13px",
  fontWeight: 500,
};

const thStyle: React.CSSProperties = {
  padding: "11px 12px",
  textAlign: "left",
  fontSize: "10px",
  fontWeight: 600,
  letterSpacing: "0.06em",
  color: "#666",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "12px",
  fontSize: "13px",
  verticalAlign: "middle",
  whiteSpace: "nowrap",
};

const tbStyle: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 500,
};

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
    borderRadius: "8px",
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
    outline: "none",
    width: "100%",
    height: "36px",
    padding: "0 10px",
    border: "1px solid #ccc",
    background: "#fff",
    fontSize: "13px",
    boxSizing: "border-box",
    borderRadius: "4px",
  },
};
