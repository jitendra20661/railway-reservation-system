import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function SearchForm() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();

    setError("");

    if (from === to) {
      setError("From and To stations cannot be the same.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.get("/schedule/search", {
        params: {
          from,
          to,
          date,
        },
      });

      navigate("/search-results", {
        state: {
          results: response.data,
          search: {
            from,
            to,
            date,
          },
        },
      });
    } catch (error) {
      console.error(error);

      setError(error.response?.data?.message || "Unable to search for trains.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "20px",
        maxWidth: "700px",
      }}
    >
      <h3 style={{ marginTop: 0 }}>Search Trains</h3>

      <form onSubmit={handleSearch}>
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "end",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: "180px" }}>
            <label>From</label>
            <input
              type="text"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="Departure station"
              required
              style={{
                width: "100%",
                padding: "8px",
                marginTop: "5px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ flex: 1, minWidth: "180px" }}>
            <label>To</label>
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Destination station"
              required
              style={{
                width: "100%",
                padding: "8px",
                marginTop: "5px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              style={{
                padding: "8px",
                marginTop: "5px",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "9px 16px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {error && <p style={{ marginBottom: 0 }}>{error}</p>}
      </form>
    </div>
  );
}

export default SearchForm;
