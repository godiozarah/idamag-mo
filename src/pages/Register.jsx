import { useState } from "react";

import {
  createUserWithEmailAndPassword
} from "firebase/auth";

import {
  doc,
  setDoc
} from "firebase/firestore";

import {
  auth,
  db
} from "../firebase";

export default function Register() {

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const handleRegister = async (e) => {

    e.preventDefault();

    try {

      // CREATE ACCOUNT
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      const user =
        userCredential.user;

      // SAVE USER DATA
      await setDoc(
        doc(db, "users", user.uid),
        {
          email: email,
          role: "resident"
        }
      );

      window.location.href =
        "/login";

    } catch (error) {

      alert(error.message);
    }
  };

  return (

    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(to right, rgba(27,94,32,0.9), rgba(46,125,50,0.9))",
        padding: "20px"
      }}
    >

      <div
        style={{
          width: "100%",
          maxWidth: "1000px",
          backgroundColor: "white",
          borderRadius: "25px",
          overflow: "hidden",
          display: "flex",
          boxShadow: "0 10px 40px rgba(0,0,0,0.25)"
        }}
      >

        {/* LEFT SIDE */}

        <div
          style={{
            flex: 1,
            background:
              "linear-gradient(to bottom right, #1B5E20, #43A047)",
            color: "white",
            padding: "60px 40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}
        >

          <img
            src="/icons.svg"
            alt="Barangay Logo"
            style={{
              width: "120px",
              marginBottom: "25px"
            }}
          />

          <h1
            style={{
              fontSize: "48px",
              marginBottom: "15px",
              fontWeight: "bold"
            }}
          >
            Join Barangay Ucab
          </h1>

          <p
            style={{
              fontSize: "18px",
              lineHeight: "1.8"
            }}
          >
            Create your idamag.mo resident account and gain access to
            barangay announcements, reports, community updates,
            and AI-powered assistance for Barangay Ucab residents.
          </p>

        </div>

        {/* RIGHT SIDE */}

        <div
          style={{
            flex: 1,
            padding: "60px 40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}
        >

          <h2
            style={{
              fontSize: "40px",
              color: "#1B5E20",
              marginBottom: "10px"
            }}
          >
            Create Account
          </h2>

          <p
            style={{
              color: "gray",
              marginBottom: "35px"
            }}
          >
            Register to access your barangay portal.
          </p>

          <form onSubmit={handleRegister}>

            <div style={{ marginBottom: "20px" }}>

              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                  color: "#1B5E20"
                }}
              >
                Email Address
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "12px",
                  border: "1px solid #ccc",
                  fontSize: "16px",
                  outline: "none"
                }}
                required
              />

            </div>

            <div style={{ marginBottom: "25px" }}>

              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                  color: "#1B5E20"
                }}
              >
                Password
              </label>

              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "12px",
                  border: "1px solid #ccc",
                  fontSize: "16px",
                  outline: "none"
                }}
                required
              />

            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "15px",
                backgroundColor: "#1B5E20",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "17px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              Register
            </button>

          </form>

          <p
            style={{
              marginTop: "25px",
              textAlign: "center",
              color: "gray"
            }}
          >
            Powered by idamag.mo AI Assistance
          </p>

        </div>

      </div>

    </div>
  );
}