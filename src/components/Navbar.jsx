import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import barangayseal from "../assets/barangayseal.png";
import "./Navbar.css";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setIsAdmin(false);
        return;
      }

      try {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error(error);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <nav className="navbar">

      <div className="logo-section">
        <img
          src={barangayseal}
          alt="Barangay Seal"
          className="logo"
        />

        <div>
          <h2>idamag.mo</h2>
          <p>Barangay Ucab Portal</p>
        </div>
      </div>

      {/* Hamburger Button */}
      <button
        className="menu-btn"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>

      {/* Navigation */}
      <div className={`nav-links ${menuOpen ? "active" : ""}`}>

        {user && (
          <Link
            to="/"
            className="nav-link"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
        )}

        {isAdmin && (
          <>
            <Link
              to="/admin"
              className="nav-link"
              onClick={() => setMenuOpen(false)}
            >
              Dashboard
            </Link>

            <Link
              to="/admin-reports"
              className="nav-link"
              onClick={() => setMenuOpen(false)}
            >
              Admin Reports
            </Link>
          </>
        )}

        {!user && (
          <Link
            to="/login"
            className="nav-link"
            onClick={() => setMenuOpen(false)}
          >
            Login
          </Link>
        )}

        {!user && (
          <Link
            to="/register"
            className="nav-link"
            onClick={() => setMenuOpen(false)}
          >
            Register
          </Link>
        )}

        {user && (
          <button
            className="logout-btn"
            onClick={() => {
              logout();
              setMenuOpen(false);
            }}
          >
            Logout
          </button>
        )}

      </div>

    </nav>
  );
}