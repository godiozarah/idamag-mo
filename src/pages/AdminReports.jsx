import {
  useEffect,
  useState
} from "react";

import {
  collection,
  onSnapshot,
  updateDoc,
  doc
} from "firebase/firestore";

import { db } from "../firebase";

export default function AdminReports() {

  const [reports, setReports] =
    useState([]);

  const [solutions, setSolutions] =
    useState({});

  // LOAD REPORTS
  useEffect(() => {

    const unsubscribe =
      onSnapshot(
        collection(db, "reports"),
        (snapshot) => {

          const reportList =
            snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data()
            }));

          setReports(reportList);
        }
      );

    return () => unsubscribe();

  }, []);

  // UPDATE REPORT
  const updateReport = async (
    reportId,
    status
  ) => {

    try {

      const reportRef =
        doc(db, "reports", reportId);

      await updateDoc(reportRef, {

        status: status,

        adminSolution:
          solutions[reportId] ||
          "No response provided yet."
      });

    } catch (error) {

      console.error(error);
    }
  };

  return (

    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(to bottom, #f4f7f4, #e8f5e9)",
        padding: "40px",
        fontFamily:
          "'Segoe UI', sans-serif"
      }}
    >

      {/* HEADER */}

      <div
        style={{
          marginBottom: "35px"
        }}
      >

        <h1
          style={{
            color: "#1B5E20",
            fontSize: "38px",
            marginBottom: "10px",
            fontWeight: "700"
          }}
        >
          Report Management
        </h1>

        <p
          style={{
            color: "#555",
            fontSize: "16px"
          }}
        >
          Barangay Ucab Resident Reports
        </p>

      </div>

      {/* REPORTS */}

      {reports.length === 0 && (

        <div
          style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "20px",
            textAlign: "center",
            boxShadow:
              "0 8px 20px rgba(0,0,0,0.08)"
          }}
        >

          <h2
            style={{
              color: "#1B5E20"
            }}
          >
            No reports available.
          </h2>

        </div>

      )}

      {reports.map((report) => (

        <div
          key={report.id}
          style={{
            backgroundColor: "white",
            borderRadius: "25px",
            padding: "30px",
            marginBottom: "25px",
            boxShadow:
              "0 8px 20px rgba(0,0,0,0.08)"
          }}
        >

          {/* REPORT HEADER */}

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              marginBottom: "25px",
              flexWrap: "wrap",
              gap: "10px"
            }}
          >

            <div>

              <h2
                style={{
                  color: "#1B5E20",
                  marginBottom: "8px"
                }}
              >
                Resident Report
              </h2>

              <p
                style={{
                  color: "#666",
                  margin: 0
                }}
              >
                {report.reporterEmail}
              </p>

            </div>

            <div
              style={{
                backgroundColor:
                  report.status ===
                  "Resolved"
                    ? "#E8F5E9"
                    : "#FFF8E1",
                color:
                  report.status ===
                  "Resolved"
                    ? "#2E7D32"
                    : "#F57F17",
                padding:
                  "10px 18px",
                borderRadius: "30px",
                fontWeight: "600",
                fontSize: "14px"
              }}
            >
              {report.status || "Pending"}
            </div>

          </div>

          {/* CONCERN */}

          <div
            style={{
              marginBottom: "25px"
            }}
          >

            <h3
              style={{
                color: "#1B5E20",
                marginBottom: "10px"
              }}
            >
              Concern
            </h3>

            <div
              style={{
                backgroundColor:
                  "#f8f8f8",
                padding: "18px",
                borderRadius: "15px",
                lineHeight: "1.7",
                color: "#333"
              }}
            >
              {report.concern}
            </div>

          </div>

          {/* CURRENT RESPONSE */}

          {report.adminSolution && (

            <div
              style={{
                marginBottom: "25px"
              }}
            >

              <h3
                style={{
                  color: "#1B5E20",
                  marginBottom: "10px"
                }}
              >
                Current Response
              </h3>

              <div
                style={{
                  backgroundColor:
                    "#E8F5E9",
                  padding: "18px",
                  borderRadius: "15px",
                  lineHeight: "1.7",
                  color: "#1B5E20"
                }}
              >
                {report.adminSolution}
              </div>

            </div>

          )}

          {/* RESPONSE INPUT */}

          <div
            style={{
              marginBottom: "25px"
            }}
          >

            <h3
              style={{
                color: "#1B5E20",
                marginBottom: "10px"
              }}
            >
              Write Response
            </h3>

            <textarea
              placeholder="Write your response or solution here..."
              value={
                solutions[report.id] || ""
              }
              onChange={(e) =>
                setSolutions({
                  ...solutions,
                  [report.id]:
                    e.target.value
                })
              }
              style={{
                width: "100%",
                height: "120px",
                padding: "15px",
                borderRadius: "15px",
                border:
                  "1px solid #ccc",
                outline: "none",
                resize: "none",
                fontSize: "15px",
                fontFamily:
                  "'Segoe UI', sans-serif"
              }}
            />

          </div>

          {/* BUTTONS */}

          <div
            style={{
              display: "flex",
              gap: "15px",
              flexWrap: "wrap"
            }}
          >

            {/* PENDING */}

            <button
              onClick={() =>
                updateReport(
                  report.id,
                  "Pending"
                )
              }
              style={{
                padding:
                  "14px 25px",
                backgroundColor:
                  "#FFF8E1",
                color: "#F57F17",
                border: "none",
                borderRadius: "12px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "0.3s"
              }}
            >
              Set Pending
            </button>

            {/* RESOLVED */}

            <button
              onClick={() =>
                updateReport(
                  report.id,
                  "Resolved"
                )
              }
              style={{
                padding:
                  "14px 25px",
                background:
                  "linear-gradient(90deg,#1B5E20,#43A047)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "0.3s"
              }}
            >
              Resolve & Send
            </button>

          </div>

        </div>

      ))}

    </div>
  );
}