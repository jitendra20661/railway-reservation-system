import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 24px",
        borderBottom: "1px solid #ddd",
        marginBottom: "24px",
      }}
    >
      {/* Brand */}
      <Link
        to="/"
        style={{
          textDecoration: "none",
          fontWeight: "bold",
          fontSize: "20px",
          color: "black",
        }}
      >
        Ticket Booking
      </Link>

      {/* Navigation */}
      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <Link to="/">Home</Link>
        <Link to="/my-bookings">My Bookings</Link>
        {/* <Link to="/profile">Profile</Link> */}

        <span>
          Hi, <strong>{user?.name}</strong>
        </span>

        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
