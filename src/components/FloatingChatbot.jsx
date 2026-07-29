import { useState } from "react";
import Chatbot from "../pages/Chatbot";
import ucabai from "../assets/ucab-ai.png";

export default function FloatingChatbot() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ANIMATIONS */}
      <style>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: .75;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes float {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
          100% {
            transform: translateY(0);
          }
        }

        @media (max-width:768px){
          .barangay-ai-label{
            display:none;
          }
        }
      `}</style>

      {/* FLOATING BUTTON */}
      <div
        style={{
          position: "fixed",
          bottom: "25px",
          right: "25px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          zIndex: "9999",
        }}
      >
        {/* LABEL */}
        {!open && (
          <div
            className="barangay-ai-label"
            style={{
              background: "white",
              color: "#1B5E20",
              padding: "12px 18px",
              borderRadius: "999px",
              fontWeight: "600",
              fontSize: "15px",
              boxShadow: "0 8px 20px rgba(0,0,0,.18)",
              animation: "pulse 2s infinite",
              whiteSpace: "nowrap",
              userSelect: "none",
            }}
          >
             Ask Barangay AI
          </div>
        )}

        {/* AI ICON */}
        <div
          onClick={() => setOpen(!open)}
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            overflow: "hidden",
            cursor: "pointer",
            boxShadow: "0 8px 25px rgba(0,0,0,0.35)",
            transition: ".3s",
            animation: open ? "none" : "float 3s ease-in-out infinite",
          }}
        >
          <img
            src={ucabai}
            alt="Barangay AI"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
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
            boxShadow: "0 10px 35px rgba(0,0,0,.35)",
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
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <img
                src={ucabai}
                alt="Barangay AI"
                style={{
                  width: "45px",
                  height: "45px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  background: "white",
                }}
              />

              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "18px",
                    fontWeight: "700",
                  }}
                >
                  Barangay AI
                </h3>

                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    color: "#d9ffd9",
                  }}
                >
                  Official AI Assistant
                </p>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "white",
                fontSize: "28px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              ×
            </button>
          </div>

          {/* CHATBOT */}
          <div
            style={{
              height: "calc(100% - 75px)",
            }}
          >
            <Chatbot />
          </div>
        </div>
      )}
    </>
  );
}