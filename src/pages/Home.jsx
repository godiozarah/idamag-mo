import { useNavigate } from "react-router-dom";

import officials1 from "../assets/officials1.png";
import barangayseal from "../assets/barangayseal.png";
import reportsIcon from "../assets/reports.png";
import announcementIcon from "../assets/announcement.png";
import ucabai from "../assets/ucab-ai.png";

export default function Home() {

  const navigate = useNavigate();

  const services = [

    {
      title: "Community Reports",
      description:
        "Report community concerns and track barangay responses in real time.",
      image: reportsIcon,
      action: () => navigate("/reports"),
    },

    {
      title: "Barangay AI",
      description:
        "AI-powered assistant for Barangay Ucab residents.",
      image: ucabai,
      action: () => navigate("/chatbot"),
    },

    {
      title: "News & Updates",
      description:
        "Latest barangay announcements and updates.",
      image: announcementIcon,
      action: () => navigate("/announcements"),
    },

  ];

  return (

    <div
      style={{
        backgroundColor: "#f5f7f5",
        minHeight: "100vh",
        fontFamily: "Arial",
      }}
    >

      {/* HERO SECTION */}

      <div
        style={{
          position: "relative",
          height: "100vh",
          overflow: "hidden",
          color: "white",
        }}
      >

        {/* VIDEO BACKGROUND */}

        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
          }}
        >

          <source
            src="/videos/ucab.mp4"
            type="video/mp4"
          />

        </video>

        {/* DARK OVERLAY */}

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.65), rgba(0,0,0,0.45))",
            zIndex: 1,
          }}
        />

        {/* HERO CONTENT */}

        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "1200px",
            margin: "0 auto",
            height: "100%",
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
          }}
        >

          <div>

            <h1
              style={{
                fontSize: "85px",
                marginBottom: "20px",
                fontWeight: "bold",
                textShadow:
                  "0 4px 12px rgba(0,0,0,0.5)",
              }}
            >
              Idamag.mo
            </h1>

            <p
              style={{
                fontSize: "26px",
                lineHeight: "1.7",
                marginBottom: "35px",
                maxWidth: "700px",
                textShadow:
                  "0 2px 8px rgba(0,0,0,0.5)",
              }}
            >
              Smart Barangay Information
              System with AI Assistance
              for Barangay Ucab,
              Itogon, Benguet.
            </p>

            {/* BUTTONS */}

            <div
              style={{
                display: "flex",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >

              {/* EXPLORE SERVICES */}

              <button
                onClick={() => {

                  document
                    .getElementById(
                      "services"
                    )
                    ?.scrollIntoView({
                      behavior:
                        "smooth"
                    });

                }}
                style={{
                  backgroundColor:
                    "white",
                  color:
                    "#1B5E20",
                  border: "none",
                  padding:
                    "16px 30px",
                  borderRadius:
                    "15px",
                  cursor:
                    "pointer",
                  fontWeight:
                    "bold",
                  fontSize:
                    "16px",
                  boxShadow:
                    "0 4px 10px rgba(0,0,0,0.3)",
                }}
              >
                Explore Services
              </button>

              {/* COMMUNITY FEED */}

              <button
                onClick={() =>
                  navigate("/announcements")
                }
                style={{
                  backgroundColor:
                    "transparent",
                  color: "white",
                  border:
                    "2px solid white",
                  padding:
                    "16px 30px",
                  borderRadius:
                    "15px",
                  cursor:
                    "pointer",
                  fontWeight:
                    "bold",
                  fontSize:
                    "16px",
                  backdropFilter:
                    "blur(5px)",
                }}
              >
                View Announcements
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* DIGITAL SERVICES */}

      <div
        id="services"
        style={{
          padding: "90px 20px",
          backgroundColor: "#f5f7f5",
        }}
      >

        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >

          <div
            style={{
              textAlign: "center",
              marginBottom: "60px",
            }}
          >

            <h2
              style={{
                fontSize: "65px",
                color: "#1B5E20",
                marginBottom: "15px",
              }}
            >
              Digital Services
            </h2>

            <p
              style={{
                fontSize: "24px",
                color: "#555",
              }}
            >
              Online services and
              resources for Barangay
              Ucab residents.
            </p>

          </div>

          {/* SERVICE CARDS */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(340px,1fr))",
              gap: "35px",
            }}
          >

            {services.map(
              (service, index) => (

                <div
                  key={index}
                  onClick={
                    service.action
                  }
                  style={{
                    backgroundColor:
                      "white",
                    borderRadius:
                      "30px",
                    padding: "40px",
                    cursor:
                      "pointer",
                    transition:
                      "0.3s",
                    boxShadow:
                      "0 8px 25px rgba(0,0,0,0.08)",
                    textAlign:
                      "center",
                  }}
                >

                  <div
                    style={{
                      width: "140px",
                      height:
                        "140px",
                      margin:
                        "0 auto 25px auto",
                      borderRadius:
                        "50%",
                      overflow:
                        "hidden",
                      backgroundColor:
                        "#edf7ed",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                    }}
                  >

                    <img
                      src={
                        service.image
                      }
                      alt={
                        service.title
                      }
                      style={{
                        width:
                          "100%",
                        height:
                          "100%",
                        objectFit:
                          "cover",
                      }}
                    />

                  </div>

                  <h3
                    style={{
                      fontSize:
                        "30px",
                      color:
                        "#1B5E20",
                      marginBottom:
                        "15px",
                    }}
                  >
                    {service.title}
                  </h3>

                  <p
                    style={{
                      fontSize:
                        "20px",
                      lineHeight:
                        "1.7",
                      color:
                        "#444",
                    }}
                  >
                    {
                      service.description
                    }
                  </p>

                </div>

              )
            )}

          </div>

        </div>

      </div>

      {/* OFFICIALS */}

      <div
        style={{
          background:
            "linear-gradient(135deg,#1B5E20,#2E7D32)",
          padding:
            "90px 20px",
          color: "white",
        }}
      >

        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >

          <h2
            style={{
              fontSize: "55px",
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            Barangay Officials
          </h2>

          <img
            src={officials1}
            alt="Officials"
            style={{
              width: "100%",
              borderRadius:
                "30px",
              boxShadow:
                "0 10px 30px rgba(0,0,0,0.3)",
            }}
          />

        </div>

      </div>

      {/* FOOTER */}

      <div
        style={{
          backgroundColor:
            "#111",
          color: "white",
          padding: "50px 20px",
        }}
      >

        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >

          <img
            src={barangayseal}
            alt="Barangay Seal"
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              backgroundColor:
                "white",
              padding: "4px",
            }}
          />

          <div>

            <h2>
              Idamag.mo
            </h2>

            <p
              style={{
                color: "#aaa"
              }}
            >
              Official Digital Platform
              of Barangay Ucab,
              Itogon, Benguet.
            </p>

          </div>

        </div>

      </div>

    </div>

  );
}