export interface Station {
  _id: string;
  name: string;
  stationCode: string;
  distanceFromRoha: number;
}

export interface SearchSchedule {
  scheduleId: string;
  train?: { name?: string; trainNumber?: string; number?: string };
  from: { stationId: string; stationCode: string; stationName: string; departureTime?: string };
  to: { stationId: string; stationCode: string; stationName: string; arrivalTime?: string };
  direction?: string;
  [key: string]: unknown;
}

export interface SearchState {
  from: string;
  to: string;
  fromStationId: string;
  toStationId: string;
  date: string;
}

export interface BookingAvailability {
  availableSeats: number;
}

export interface BookingRecord {
  _id: string;
  scheduleId?: { trainId?: { name?: string; trainNumber?: string; trainNumberCode?: string } | null } | null;
  fromStationId?: { stationCode?: string; name?: string } | null;
  toStationId?: { stationCode?: string; name?: string } | null;
  journeyDate: string;
  seats: number;
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
}
