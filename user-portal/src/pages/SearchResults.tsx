import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import type { SearchSchedule, SearchState } from "../types";

function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();

  const results = (location.state?.results || []) as SearchSchedule[];
  const search = location.state?.search as SearchState | undefined;

  const [availability, setAvailability] = useState<Record<string, number | null>>({});
  const [availabilityLoading, setAvailabilityLoading] = useState(true);

  useEffect(() => {
    if (!search || results.length === 0) {
      setAvailabilityLoading(false);
      return;
    }

    const fetchAvailability = async () => {
      try {
        setAvailabilityLoading(true);

        const availabilityResults = await Promise.all(
          results.map(async (schedule) => {
            try {
              const response = await api.get("/booking/availability", {
                params: {
                  scheduleId: schedule.scheduleId,
                  fromStationId: schedule.from.stationId,
                  toStationId: schedule.to.stationId,
                  journeyDate: search.date,
                },
              });

              return {
                scheduleId: schedule.scheduleId,
                availableSeats: response.data.availableSeats,
              };
            } catch (error) {
              console.error(
                `Unable to fetch availability for schedule ${schedule.scheduleId}`,
                error,
              );

              return {
                scheduleId: schedule.scheduleId,
                availableSeats: null,
              };
            }
          }),
        );

        const availabilityMap: Record<string, number | null> = {};

        availabilityResults.forEach((item) => {
          availabilityMap[item.scheduleId] = item.availableSeats;
        });

        setAvailability(availabilityMap);
      } finally {
        setAvailabilityLoading(false);
      }
    };

    fetchAvailability();
  }, [results, search]);

  if (!search) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>No search performed</h2>

        <button onClick={() => navigate("/")}>Back to Search</button>
      </div>
    );
  }

  return (
    <div
      // style={{ padding: "0 20px" }}
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
        <div>
          <h2 style={{ margin: "0 0 6px" }}>
            {search.from} → {search.to}
          </h2>

          <div>{search.date}</div>
        </div>
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div>
          <p>No trains found for this journey.</p>
        </div>
      ) : (
        <div>
          {results.map((schedule) => {
            const availableSeats = availability[schedule.scheduleId];

            return (
              <div
                key={schedule.scheduleId}
                style={{
                  border: "1px solid #ccc",
                  marginBottom: "15px",
                }}
              >
                {/* Train Header */}
                <div
                  style={{
                    padding: "10px 12px",
                    borderBottom: "1px solid #ccc",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <strong>{schedule.train?.name || "Train"}</strong>
                  {schedule.train?.trainNumber && (
                    <span> # {schedule.train.trainNumber}</span>
                  )}

                  <span>Runs On: {}</span>
                  <button>View Schedule</button>
                </div>

                {/* Journey */}
                <div style={{ padding: "15px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {/* From */}
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: "20px" }}>
                        {schedule.from.departureTime}
                      </strong>

                      <span style={{ marginLeft: "6px" }}>
                        | {schedule.from.stationCode}
                      </span>

                      <div style={{ marginTop: "4px" }}>
                        {schedule.from.stationName}
                      </div>
                    </div>

                    {/* Middle */}
                    <div
                      style={{
                        flex: "0 0 180px",
                        textAlign: "center",
                      }}
                    >
                      <div>────────────</div>

                      <small>{schedule.direction || "Journey"}</small>
                    </div>

                    {/* To */}
                    <div
                      style={{
                        flex: 1,
                        textAlign: "right",
                      }}
                    >
                      <strong style={{ fontSize: "20px" }}>
                        {schedule.to.arrivalTime}
                      </strong>

                      <span style={{ marginLeft: "6px" }}>
                        | {schedule.to.stationCode}
                      </span>

                      <div style={{ marginTop: "4px" }}>
                        {schedule.to.stationName}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div
                    style={{
                      display: "flex",
                      // justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "15px",
                      gap: "10px",
                    }}
                  >
                    {/* Seat Availability */}
                    <div>
                      {availabilityLoading ? (
                        <small>Checking availability...</small>
                      ) : availableSeats === null ||
                        availableSeats === undefined ? (
                        <small>Availability unavailable</small>
                      ) : (
                        <small>
                          AVL
                          {availableSeats === 1 ? " seat" : " seats"}
                          {": "}
                          <strong>{availableSeats}</strong>
                        </small>
                      )}
                    </div>

                    {/* Book Ticket */}
                    <button
                      onClick={() =>
                        navigate("/booking", {
                          state: {
                            schedule,
                            search,
                          },
                        })
                      }
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SearchResults;
