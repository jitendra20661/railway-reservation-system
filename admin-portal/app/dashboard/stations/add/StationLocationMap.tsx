"use client";

import { useEffect, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

type Location = {
  latitude: number;
  longitude: number;
};

type SearchResult = {
  lat: string;
  lon: string;
  display_name: string;
};

type Props = {
  value: Location | null;
  onChange: (location: Location) => void;
};

const DEFAULT_CENTER: LatLngExpression = [15.4909, 73.8278];
const DEFAULT_ZOOM = 9;

function MapClickHandler({
  onChange,
}: {
  onChange: (location: Location) => void;
}) {
  useMapEvents({
    click(event) {
      onChange({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  return null;
}

function MapController({ location }: { location: Location | null }) {
  const map = useMap();

  useEffect(() => {
    if (!location) {
      return;
    }

    map.flyTo(
      [location.latitude, location.longitude],
      Math.max(map.getZoom(), 13),
      {
        duration: 0.8,
      },
    );
  }, [location, map]);

  return null;
}

export default function StationLocationMap({ value, onChange }: Props) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const markerPosition: LatLngExpression | null = value
    ? [value.latitude, value.longitude]
    : null;

  const handleSearch = async () => {
    const query = search.trim();

    if (!query) {
      return;
    }

    try {
      setSearching(true);
      setSearchError("");
      setResults([]);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(
          query,
        )}`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data: SearchResult[] = await response.json();

      if (data.length === 0) {
        setSearchError("No locations found.");
        return;
      }

      setResults(data);
    } catch (error) {
      console.error("Location search failed:", error);
      setSearchError("Unable to search for this location.");
    } finally {
      setSearching(false);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    const latitude = Number(result.lat);
    const longitude = Number(result.lon);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return;
    }

    onChange({
      latitude,
      longitude,
    });

    setSearch(result.display_name);
    setResults([]);
    setSearchError("");
  };

  return (
    <div>
      {/* Search */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "10px",
        }}
      >
        <input
          type="text"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setResults([]);
            setSearchError("");
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSearch();
            }
          }}
          placeholder="Search location..."
          style={{
            flex: 1,
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            boxSizing: "border-box",
            fontSize: "14px",
          }}
        />

        <button
          type="button"
          onClick={handleSearch}
          disabled={searching || !search.trim()}
          style={{
            padding: "10px 16px",
            border: "1px solid #222",
            borderRadius: "4px",
            background: "#fff",
            cursor: searching || !search.trim() ? "not-allowed" : "pointer",
            fontSize: "14px",
          }}
        >
          {searching ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Search results */}
      {results.length > 0 && (
        <div
          style={{
            border: "1px solid #ccc",
            marginBottom: "10px",
            maxHeight: "180px",
            overflowY: "auto",
            background: "#fff",
          }}
        >
          {results.map((result, index) => (
            <button
              key={`${result.lat}-${result.lon}-${index}`}
              type="button"
              onClick={() => handleSelectResult(result)}
              style={{
                display: "block",
                width: "100%",
                padding: "10px",
                border: "none",
                borderBottom:
                  index < results.length - 1 ? "1px solid #eee" : "none",
                background: "#fff",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              {result.display_name}
            </button>
          ))}
        </div>
      )}

      {/* Search error */}
      {searchError && (
        <div
          style={{
            marginBottom: "10px",
            padding: "8px",
            border: "1px solid #ccc",
            fontSize: "13px",
          }}
        >
          {searchError}
        </div>
      )}

      {/* Map */}
      <div
        style={{
          width: "100%",
          height: "275px",
          border: "1px solid #ccc",
          overflow: "hidden",
        }}
      >
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={true}
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler onChange={onChange} />

          <MapController location={value} />

          {markerPosition && (
            <CircleMarker
              center={markerPosition}
              radius={8}
              pathOptions={{
                color: "#111",
                fillColor: "#fff",
                fillOpacity: 1,
                weight: 2,
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Instructions */}
      <p
        style={{
          marginTop: "8px",
          marginBottom: 0,
          fontSize: "12px",
          color: "#666",
        }}
      >
        Search for a location or click directly on the map to select the station
        location.
      </p>

      {/* Coordinates */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
          marginTop: "15px",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontSize: "13px",
              fontWeight: "500",
            }}
          >
            Latitude
          </label>

          <input
            type="text"
            value={value ? value.latitude.toFixed(6) : ""}
            placeholder="Select location"
            readOnly
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              boxSizing: "border-box",
              fontSize: "14px",
              background: "#f7f7f7",
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontSize: "13px",
              fontWeight: "500",
            }}
          >
            Longitude
          </label>

          <input
            type="text"
            value={value ? value.longitude.toFixed(6) : ""}
            placeholder="Select location"
            readOnly
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              boxSizing: "border-box",
              fontSize: "14px",
              background: "#f7f7f7",
            }}
          />
        </div>
      </div>
    </div>
  );
}
