import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Leaflet default marker icon
const defaultIcon = new L.Icon({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",

  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/*
  Automatically changes the map position
  when From / To stations change.
*/
function MapController({ fromStation, toStation }) {
  const map = useMap();

  useEffect(() => {
    const locations = [];

    if (fromStation?.geolocation) {
      locations.push([
        fromStation.geolocation.latitude,
        fromStation.geolocation.longitude,
      ]);
    }

    if (toStation?.geolocation) {
      locations.push([
        toStation.geolocation.latitude,
        toStation.geolocation.longitude,
      ]);
    }

    // No station selected
    if (locations.length === 0) {
      return;
    }

    // Only one station selected
    if (locations.length === 1) {
      map.setView(locations[0], 10);
      return;
    }

    // Both stations selected
    const bounds = L.latLngBounds(locations);

    map.fitBounds(bounds, {
      padding: [60, 60],
    });
  }, [fromStation, toStation, map]);

  return null;
}

function MapView({ fromStation, toStation }) {
  // Konkan region default position
  const defaultCenter = [17.5, 73.5];

  /*
    Google Maps URL
  */
  const getGoogleMapsUrl = (station) => {
    if (!station?.geolocation) {
      return "#";
    }

    const latitude = station.geolocation.latitude;
    const longitude = station.geolocation.longitude;

    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  };

  /*
    Coordinates displayed in tooltip
  */
  const getCoordinates = (station) => {
    if (!station?.geolocation) {
      return "";
    }

    return `${station.geolocation.latitude}, ${station.geolocation.longitude}`;
  };

  return (
    <div
      style={{
        width: "100%",
        height: "400px",
        marginTop: "20px",
        border: "1px solid #ddd",
        overflow: "hidden",
      }}
    >
      <MapContainer
        center={defaultCenter}
        zoom={7}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        {/* OpenStreetMap */}
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Automatically move/zoom map */}
        <MapController fromStation={fromStation} toStation={toStation} />

        {/* ================= FROM STATION ================= */}

        {fromStation?.geolocation && (
          <Marker
            position={[
              fromStation.geolocation.latitude,
              fromStation.geolocation.longitude,
            ]}
            icon={defaultIcon}
          >
            <Tooltip
              permanent
              direction="top"
              offset={[0, -35]}
              interactive={true}
            >
              <div
                style={{
                  textAlign: "center",
                  fontSize: "12px",
                  lineHeight: "1.5",
                }}
              >
                <strong>{fromStation.name}</strong>

                <br />

                {fromStation.stationCode}

                <br />

                {getCoordinates(fromStation)}

                <br />

                <a
                  href={getGoogleMapsUrl(fromStation)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                  style={{
                    color: "#000",
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  Open in Google Maps
                </a>
              </div>
            </Tooltip>

            {/* Interactive popup */}
            <Popup>
              <div
                style={{
                  minWidth: "160px",
                  fontSize: "13px",
                  lineHeight: "1.5",
                }}
              >
                <strong>From Station</strong>

                <br />

                {fromStation.name}

                <br />

                {fromStation.stationCode}

                <br />

                {getCoordinates(fromStation)}

                <br />

                <a
                  href={getGoogleMapsUrl(fromStation)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#000",
                    textDecoration: "underline",
                  }}
                >
                  Open in Google Maps
                </a>
              </div>
            </Popup>
          </Marker>
        )}

        {/* ================= TO STATION ================= */}

        {toStation?.geolocation && (
          <Marker
            position={[
              toStation.geolocation.latitude,
              toStation.geolocation.longitude,
            ]}
            icon={defaultIcon}
          >
            <Tooltip
              permanent
              direction="top"
              offset={[0, -35]}
              interactive={true}
            >
              <div
                style={{
                  textAlign: "center",
                  fontSize: "12px",
                  lineHeight: "1.5",
                }}
              >
                <strong>{toStation.name}</strong>

                <br />

                {toStation.stationCode}

                <br />

                {getCoordinates(toStation)}

                <br />

                <a
                  href={getGoogleMapsUrl(toStation)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                  style={{
                    color: "#000",
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  Open in Google Maps
                </a>
              </div>
            </Tooltip>

            {/* Interactive popup */}
            <Popup>
              <div
                style={{
                  minWidth: "160px",
                  fontSize: "13px",
                  lineHeight: "1.5",
                }}
              >
                <strong>To Station</strong>

                <br />

                {toStation.name}

                <br />

                {toStation.stationCode}

                <br />

                {getCoordinates(toStation)}

                <br />

                <a
                  href={getGoogleMapsUrl(toStation)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#000",
                    textDecoration: "underline",
                  }}
                >
                  Open in Google Maps
                </a>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

export default MapView;
