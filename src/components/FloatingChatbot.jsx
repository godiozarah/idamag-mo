import { useState } from "react";

import Chatbot from "../pages/Chatbot";

import ucabai from "../assets/ucab-ai.png";

export default function FloatingChatbot() {

  const [open, setOpen] =
    useState(false);

  return (
    <>

      {/* FLOATING AI HEAD */}
      <div
        onClick={() =>
          setOpen(!open)
        }
        style={{
          position: "fixed",
          bottom: "25px",
          right: "25px",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          overflow: "hidden",
          cursor: "pointer",
          zIndex: "9999",
          boxShadow:
            "0 8px 25px rgba(0,0,0,0.35)",
          transition: "0.3s"
        }}
      >

        <img
          src={ucabai}
          alt="Barangay AI"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
        />

      </div>

      {/* CHAT WINDOW */}
      {open && (

        <div
          style={{
            position: "fixed",
            bottom: "120px",
            right: "25px",
            width: "380px",
            height: "520px",
            backgroundColor: "white",
            borderRadius: "25px",
            overflow: "hidden",
            zIndex: "9999",
            boxShadow:
              "0 10px 35px rgba(0,0,0,0.35)"
          }}
        >

          {/* HEADER */}
          <div
            style={{
              background:
                "linear-gradient(90deg,#1B5E20,#43A047)",
              color: "white",
              padding: "15px",
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center"
            }}
          >

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}
            >

              <img
                src={ucabai}
                alt="AI"
                style={{
                  width: "45px",
                  height: "45px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  backgroundColor:
                    "white"
                }}
              />

              <div>

                <h3
                  style={{
                    margin: 0
                  }}
                >
                  Barangay Ucab AI
                </h3>

                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    color: "#d9ffd9"
                  }}
                >
                  Your trusted assistant
                </p>

              </div>

            </div>

            {/* CLOSE */}
            <button
              onClick={() =>
                setOpen(false)
              }
              style={{
                background: "none",
                border: "none",
                color: "white",
                fontSize: "26px",
                cursor: "pointer"
              }}
            >
              ×
            </button>

          </div>

          {/* CHATBOT */}
          <div
            style={{
              height: "calc(100% - 75px)"
            }}
          >

            <Chatbot />

          </div>

        </div>

      )}

    </>
  );
}