import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "../firebase";

export default function AdminReports() {

  const [reports, setReports] = useState([]);
  const [responses, setResponses] = useState({});

  // Pending & Resolved Reports
  const pendingReports = reports.filter(
    (report) => report.status !== "Resolved"
  );

  const resolvedReports = reports.filter(
    (report) => report.status === "Resolved"
  );

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [selectedReportId, setSelectedReportId] =
    useState(null);

  // Success Modal
  const [showSuccessModal, setShowSuccessModal] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  // ==========================
  // LOAD REPORTS
  // ==========================
  useEffect(() => {

    const unsubscribe = onSnapshot(

      collection(db, "reports"),

      (snapshot) => {

        const allReports = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setReports(allReports);

      }

    );

    return () => unsubscribe();

  }, []);
  // ==========================
// SUBMIT RESPONSE
// ==========================

const submitResponse = async (reportId) => {

  try {

    await updateDoc(
      doc(db, "reports", reportId),
      {
        adminSolution:
          responses[reportId] || "",

        status: "Resolved"
      }
    );

    setSuccessMessage(
      "Response submitted successfully."
    );

    setShowSuccessModal(true);

  } catch (error) {

    console.error(
      "Error submitting response:",
      error
    );

  }

};


// ==========================
// DELETE REPORT
// ==========================

const deleteReport = async () => {

  try {

    await deleteDoc(
      doc(
        db,
        "reports",
        selectedReportId
      )
    );

    setShowDeleteModal(false);

    setSelectedReportId(null);

    setSuccessMessage(
      "Report deleted successfully."
    );

    setShowSuccessModal(true);

  } catch (error) {

    console.error(
      "Error deleting report:",
      error
    );

  }

};
return (

  <div
    style={{
      minHeight: "100vh",
      background: "linear-gradient(to bottom, #f4f7f4, #e8f5e9)",
      padding: "40px",
      fontFamily: "'Segoe UI', sans-serif"
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
          fontSize: "42px",
          fontWeight: "700",
          marginBottom: "10px"
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
        Pending Resident Reports
      </p>
    </div>

    {pendingReports.length === 0 ? (

      <div
        style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "20px",
          textAlign: "center",
          boxShadow: "0 8px 20px rgba(0,0,0,.08)",
          marginBottom: "30px"
        }}
      >
        <h2 style={{ color: "#1B5E20" }}>
          No reports submitted.
        </h2>
      </div>

    ) : (

      pendingReports.map((report) => (

        <div
          key={report.id}
          style={{
            background: "#fff",
            borderRadius: "20px",
            padding: "30px",
            marginBottom: "30px",
            boxShadow: "0 8px 20px rgba(0,0,0,.08)"
          }}
        >

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: "20px"
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

              <p style={{ margin: 0 }}>
                Resident #
                {String(report.residentNumber || 0).padStart(4, "0")}
              </p>

              <p
                style={{
                  marginTop: "5px",
                  color: "#666",
                  fontSize: "13px"
                }}
              >
                Email: {report.reporterEmail}
              </p>

            </div>

            <div
              style={{
                background: "#FFF8E1",
                color: "#F57F17",
                padding: "10px 18px",
                borderRadius: "30px",
                fontWeight: "600"
              }}
            >
              {report.status}
            </div>

          </div>

          <h3
            style={{
              color: "#1B5E20",
              marginBottom: "10px"
            }}
          >
            {report.category}
          </h3>

          <div
            style={{
              background: "#f8f8f8",
              borderRadius: "15px",
              padding: "20px",
              marginBottom: "20px"
            }}
          >
            {report.concern}
          </div>

          <h3
            style={{
              color: "#1B5E20",
              marginBottom: "10px"
            }}
          >
            Write Response
          </h3>

          <textarea
            value={
              responses[report.id] ??
              report.adminSolution ??
              ""
            }
            onChange={(e) =>
              setResponses({
                ...responses,
                [report.id]: e.target.value
              })
            }
            placeholder="Write your response..."
            style={{
              width: "100%",
              height: "140px",
              padding: "18px",
              borderRadius: "12px",
              border: "1px solid #ccc",
              resize: "none",
              marginBottom: "20px"
            }}
          />

          <div
            style={{
              display: "flex",
              gap: "15px"
            }}
          >

            <button
              onClick={() => submitResponse(report.id)}
              style={{
                background: "#1B5E20",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "12px 22px",
                cursor: "pointer"
              }}
            >
              Submit Response
            </button>

            <button
              onClick={() => {
                setSelectedReportId(report.id);
                setShowDeleteModal(true);
              }}
              style={{
                background: "#d32f2f",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "12px 22px",
                cursor: "pointer"
              }}
            >
              Delete Report
            </button>

          </div>

        </div>

      ))

    )}
        {/* SUMMARY OF REPORTS */}

    <div
      style={{
        marginTop: "50px",
        marginBottom: "25px"
      }}
    >
      <h1
        style={{
          color: "#1B5E20",
          fontSize: "36px",
          fontWeight: "700",
          marginBottom: "10px"
        }}
      >
        Summary of Reports
      </h1>

      <p
        style={{
          color: "#555",
          fontSize: "16px"
        }}
      >
        Successfully resolved reports.
      </p>
    </div>

    {resolvedReports.length === 0 ? (

      <div
        style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "20px",
          textAlign: "center",
          boxShadow: "0 8px 20px rgba(0,0,0,.08)"
        }}
      >
        <h2
          style={{
            color: "#1B5E20"
          }}
        >
          No resolved reports yet.
        </h2>
      </div>

    ) : (

      resolvedReports.map((report) => (

        <div
          key={report.id}
          style={{
            background: "#fff",
            borderRadius: "20px",
            padding: "30px",
            marginBottom: "25px",
            boxShadow: "0 8px 20px rgba(0,0,0,.08)"
          }}
        >

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: "20px"
            }}
          >

            <div>

              <h2
                style={{
                  color: "#1B5E20",
                  marginBottom: "8px"
                }}
              >
                Resolved Report
              </h2>

              <p style={{ margin: 0 }}>
                Resident #
                {String(report.residentNumber || 0).padStart(4, "0")}
              </p>

              <p
                style={{
                  marginTop: "5px",
                  color: "#666",
                  fontSize: "13px"
                }}
              >
                Email: {report.reporterEmail}
              </p>

            </div>

            <div
              style={{
                background: "#E8F5E9",
                color: "#2E7D32",
                padding: "10px 18px",
                borderRadius: "30px",
                fontWeight: "600"
              }}
            >
              {report.status}
            </div>

          </div>

          <h3
            style={{
              color: "#1B5E20",
              marginBottom: "10px"
            }}
          >
            {report.category}
          </h3>

          <div
            style={{
              background: "#f8f8f8",
              borderRadius: "15px",
              padding: "20px",
              marginBottom: "20px"
            }}
          >
            {report.concern}
          </div>

          <h3
            style={{
              color: "#1B5E20",
              marginBottom: "10px"
            }}
          >
            Admin Response
          </h3>

          <div
            style={{
              background: "#E8F5E9",
              border: "1px solid #A5D6A7",
              borderRadius: "15px",
              padding: "20px",
              color: "#1B5E20",
              lineHeight: "1.7"
            }}
          >
            {report.adminSolution || "No response provided."}
          </div>

        </div>

      ))

    )}
        {/* DELETE CONFIRMATION MODAL */}

    {showDeleteModal && (

      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}
      >

        <div
          style={{
            background: "#fff",
            padding: "35px",
            borderRadius: "20px",
            width: "400px",
            maxWidth: "90%",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,.2)"
          }}
        >

          <h2
            style={{
              color: "#d32f2f",
              marginBottom: "15px"
            }}
          >
            Delete Report
          </h2>

          <p
            style={{
              color: "#555",
              marginBottom: "30px",
              lineHeight: "1.6"
            }}
          >
            Are you sure you want to permanently delete this report?
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "15px"
            }}
          >

            <button
              onClick={() => {

                setShowDeleteModal(false);
                setSelectedReportId(null);

              }}
              style={{
                padding: "12px 25px",
                border: "none",
                borderRadius: "10px",
                background: "#9E9E9E",
                color: "#fff",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>

            <button
              onClick={deleteReport}
              style={{
                padding: "12px 25px",
                border: "none",
                borderRadius: "10px",
                background: "#d32f2f",
                color: "#fff",
                cursor: "pointer"
              }}
            >
              Delete
            </button>

          </div>

        </div>

      </div>

    )}
        {/* SUCCESS MODAL */}

    {showSuccessModal && (

      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}
      >

        <div
          style={{
            background: "#fff",
            padding: "35px",
            borderRadius: "20px",
            width: "400px",
            maxWidth: "90%",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,.2)"
          }}
        >

          <div
            style={{
              fontSize: "55px",
              color: "#2E7D32",
              marginBottom: "15px"
            }}
          >
            ✓
          </div>

          <h2
            style={{
              color: "#1B5E20",
              marginBottom: "15px"
            }}
          >
            Success
          </h2>

          <p
            style={{
              color: "#555",
              marginBottom: "30px",
              lineHeight: "1.6"
            }}
          >
            {successMessage}
          </p>

          <button
            onClick={() => {

              setShowSuccessModal(false);
              setSuccessMessage("");

            }}
            style={{
              padding: "12px 30px",
              border: "none",
              borderRadius: "10px",
              background: "#1B5E20",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            OK
          </button>

        </div>

      </div>

    )}

  </div>

);

}