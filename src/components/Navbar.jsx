import { Link } from "react-router-dom";

import {
  useEffect,
  useState
} from "react";

import {
  signOut,
  onAuthStateChanged
} from "firebase/auth";

import {
  doc,
  getDoc
} from "firebase/firestore";

import {
  auth,
  db
} from "../firebase";

import barangayseal from "../assets/barangayseal.png";

export default function Navbar() {

  const [user, setUser] =
    useState(null);

  const [isAdmin, setIsAdmin] =
    useState(false);

  // CHECK ROLE
  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (currentUser) => {

          setUser(currentUser);

          if (!currentUser) {

            setIsAdmin(false);

            return;
          }

          try {

            const docRef =
              doc(
                db,
                "users",
                currentUser.uid
              );

            const docSnap =
              await getDoc(docRef);

            if (
              docSnap.exists() &&
              docSnap.data().role === "admin"
            ) {

              setIsAdmin(true);

            } else {

              setIsAdmin(false);
            }

          } catch (error) {

            console.error(error);
          }
        }
      );

    return () => unsubscribe();

  }, []);

  // LOGOUT
  const logout = async () => {

    await signOut(auth);

    window.location.href = "/login";
  };

  return (
    <div
      style={{
        background:
          "linear-gradient(90deg,#1B5E20,#43A047)",
        padding: "18px 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "white",
        position: "sticky",
        top: "0",
        zIndex: "999",
        boxShadow:
          "0 4px 10px rgba(0,0,0,0.2)"
      }}
    >

      {/* LOGO */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}
      >

        {/* BARANGAY SEAL */}
        <img
          src={barangayseal}
          alt="Barangay Seal"
          style={{
            width: "55px",
            height: "55px",
            borderRadius: "50%",
            objectFit: "cover",
            backgroundColor: "white",
            padding: "3px",
            boxShadow:
              "0 4px 10px rgba(0,0,0,0.3)"
          }}
        />

        {/* TITLE */}
        <div>

          <h2
            style={{
              margin: "0",
              fontSize: "30px",
              fontWeight: "bold"
            }}
          >
            idamag.mo
          </h2>

          <p
            style={{
              margin: "0",
              fontSize: "12px",
              color: "#d9ffd9",
              letterSpacing: "1px"
            }}
          >
            Barangay Ucab Portal
          </p>

        </div>

      </div>

      {/* NAVIGATION */}
      <div
        style={{
          display: "flex",
          gap: "18px",
          alignItems: "center",
          flexWrap: "wrap"
        }}
      >

        {/* HOME */}
        {user && (
          <Link
            to="/"
            style={navStyle}
          >
            Home
          </Link>
        )}

      

        {/* ADMIN */}
        {isAdmin && (
          <>
            <Link
              to="/admin"
              style={navStyle}
            >
              Dashboard
            </Link>

            <Link
              to="/admin-reports"
              style={navStyle}
            >
              Admin Reports
            </Link>
          </>
        )}

        {/* LOGIN */}
        {!user && (
          <Link
            to="/login"
            style={navStyle}
          >
            Login
          </Link>
        )}

        {/* REGISTER */}
        {!user && (
          <Link
            to="/register"
            style={navStyle}
          >
            Register
          </Link>
        )}

        {/* LOGOUT */}
        {user && (
          <button
            onClick={logout}
            style={{
              backgroundColor: "white",
              color: "#1B5E20",
              border: "none",
              padding: "10px 18px",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "0.3s",
              boxShadow:
                "0 4px 10px rgba(0,0,0,0.2)"
            }}
          >
            Logout
          </button>
        )}

      </div>

    </div>
  );
}

// NAV LINK STYLE
const navStyle = {
  color: "white",
  textDecoration: "none",
  fontWeight: "bold",
  fontSize: "16px"
};