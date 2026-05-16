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

  const handleRegister = async () => {

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

      alert("Registration successful!");

      window.location.href =
        "/login";

    } catch (error) {

      alert(error.message);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial"
      }}
    >

      <h1>Register</h1>

      <input
        type="email"
        placeholder="Email"
        onChange={(e) =>
          setEmail(e.target.value)
        }
        style={{
          display: "block",
          marginBottom: "10px",
          padding: "10px"
        }}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) =>
          setPassword(e.target.value)
        }
        style={{
          display: "block",
          marginBottom: "10px",
          padding: "10px"
        }}
      />

      <button
        onClick={handleRegister}
        style={{
          padding: "10px 20px"
        }}
      >
        Register
      </button>

    </div>
  );
}