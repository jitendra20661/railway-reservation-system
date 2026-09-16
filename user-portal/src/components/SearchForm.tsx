import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import MapView from "./Map";

function StationInput({
  label,
  placeholder,
  value,
  stations,
  onChange,
  onSelect,
  onClear,
}) {
  const [open, setOpen] = useState(false);

  const filteredStations = stations.filter((station) => {
    const search = value.trim().toLowerCase();

    if (!search) {
      return false;
    }

    return (
      station.name.toLowerCase().includes(search) ||
      station.stationCode.toLowerCase().includes(search)
    );
  });

  return (
    <div
      style={{
        position: "relative",
        flex: 1,
      }}
    >
      <label
        style={{
          display: "block",
          marginBottom: "6px",
          fontSize: "14px",
          fontWeight: "500",
        }}
      >
        {label}
      </label>

      <input
        type="text"
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        onFocus={() => {
          if (value.trim()) {
            setOpen(true);
          }
        }}
        onChange={(e) => {
          onChange(e.target.value);
          onClear();
          setOpen(true);
        }}
        onBlur={() => {
          setTimeout(() => {
            setOpen(false);
          }, 150);
        }}
        style={{
          width: "100%",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          boxSizing: "border-box",
          fontSize: "14px",
        }}
      />

      {open && value.trim() && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1px solid #ccc",
            borderTop: "none",
            zIndex: 1000,
            maxHeight: "220px",
            overflowY: "auto",
          }}
        >
          {filteredStations.length > 0 ? (
            filteredStations.map((station) => (
              <div
                key={station._id}
                onMouseDown={() => {
                  onSelect(station);
                  setOpen(false);
                }}
                style={{
                  padding: "10px",
                  borderBottom: "1px solid #eee",
                  cursor: "pointer",
                  fontSize: "14px",
                  background: "#fff",
                }}
              >
                <div
                  style={{
                    fontWeight: "500",
                  }}
                >
                  {station.name}
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginTop: "2px",
                  }}
                >
                  {station.stationCode} · {station.distanceFromRoha} km
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                padding: "10px",
                fontSize: "14px",
                color: "#666",
              }}
            >
              No stations found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SearchForm() {
  const navigate = useNavigate();

  const [stations, setStations] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [fromStation, setFromStation] = useState(null);
  const [toStation, setToStation] = useState(null);

  const [date, setDate] = useState("");

  const [loadingStations, setLoadingStations] = useState(true);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  //  Fetch stations
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoadingStations(true);

        const response = await api.get("/station");

        setStations(response.data);
      } catch (error) {
        console.error("Failed to fetch stations:", error);

        setError("Unable to load stations.");
      } finally {
        setLoadingStations(false);
      }
    };

    fetchStations();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();

    setError("");

    /*
     * Make sure From was selected
     * from autocomplete.
     */

    if (!fromStation) {
      setError("Please select a departure station.");

      return;
    }

    /*
     * Make sure To was selected
     * from autocomplete.
     */

    if (!toStation) {
      setError("Please select an arrival station.");

      return;
    }

    /*
     * Same station validation.
     */

    if (fromStation._id === toStation._id) {
      setError("From and To stations cannot be the same.");

      return;
    }

    /*
     * Date validation.
     */

    if (!date) {
      setError("Please select a journey date.");

      return;
    }

    try {
      setLoading(true);

      /*
       * Your current backend search
       * expects station codes.
       */

      const response = await api.get("/schedule/search", {
        params: {
          from: fromStation.stationCode,
          to: toStation.stationCode,
          date,
        },
      });

      /*
       * Navigate to results page.
       */

      navigate("/search-results", {
        state: {
          results: response.data,

          search: {
            from: fromStation.name,
            to: toStation.name,

            fromStationId: fromStation._id,

            toStationId: toStation._id,

            date,
          },
        },
      });
    } catch (error) {
      console.error("Search failed:", error);

      setError(
        error?.response?.data?.message || "Unable to search for trains.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "50px",
      }}
    >
      {/* <h2
        style={{
          marginTop: 0,
          fontSize: "20px",
        }}
      >
        Search Trains
      </h2> */}

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "6px",
          padding: "20px",
          // maxWidth: "700px",
          margin: "40px auto",
          background: "#fff",
          display: "inline-block",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            fontSize: "20px",
          }}
        >
          Search Trains
        </h2>
        {loadingStations ? (
          <p
            style={{
              fontSize: "14px",
              color: "#666",
            }}
          >
            Loading stations...
          </p>
        ) : (
          <form onSubmit={handleSearch}>
            <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
              <StationInput
                label="From"
                placeholder="Departure station"
                value={from}
                stations={stations}
                onChange={setFrom}
                onSelect={(station) => {
                  setFromStation(station);
                  setFrom(station.name);
                }}
                onClear={() => {
                  setFromStation(null);
                }}
              />

              <StationInput
                label="To"
                placeholder="Arrival station"
                value={to}
                stations={stations}
                onChange={setTo}
                onSelect={(station) => {
                  setToStation(station);
                  setTo(station.name);
                }}
                onClear={() => {
                  setToStation(null);
                }}
              />
            </div>

            <div
              style={{
                marginBottom: "15px",
              }}
            >
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Journey Date
              </label>

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  boxSizing: "border-box",
                  fontSize: "14px",
                }}
              />
            </div>

            {error && (
              <div
                style={{
                  marginBottom: "15px",
                  padding: "8px",
                  border: "1px solid #ccc",
                  fontSize: "14px",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #222",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "14px",
              }}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>
        )}
      </div>

      {/* MAP area */}
      <div
        style={{
          minWidth: "700px",
          margin: "0 auto",
          display: "inline-block",
        }}
      >
        <MapView fromStation={fromStation} toStation={toStation} />
      </div>
    </div>
  );
}

export default SearchForm;
