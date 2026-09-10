import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Home from "./pages/Home";
import SearchResults from "./pages/SearchResults";

import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Booking from "./pages/Booking";
import MyBookings from "./pages/MyBookings";
import Register from "./pages/Register";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Home />
              </>
            </ProtectedRoute>
          }
        />

        <Route
          path="/search-results"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <SearchResults />
              </>
            </ProtectedRoute>
          }
        />

        <Route
          path="/booking"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Booking />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <MyBookings />
              </>
            </ProtectedRoute>
          }
        ></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
