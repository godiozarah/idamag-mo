import {
  useEffect,
  useState
} from "react";

import {
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";

import {
  db
} from "../firebase";

export default function AdminReports() {

  const [reports, setReports] =
    useState([]);

  const [responses, setResponses] =
    useState({});

  // DELETE MODAL
  const [
    showDeleteModal,
    setShowDeleteModal
  ] = useState(false);

  const [
    selectedReportId,
    setSelectedReportId
  ] = useState(null);

  // SUCCESS MODAL
  const [
    showSuccessModal,
    setShowSuccessModal
  ] = useState(false);

  const [
    successMessage,
    setSuccessMessage
  ] = useState("");

  // LOAD REPORTS
  useEffect(() => {

    const unsubscribe =
      onSnapshot(
        collection(db, "reports"),
        (snapshot) => {

          const allReports =
            snapshot.docs.map(
              (doc) => ({
                id: doc.id,
                ...doc.data()
              })
            );

          setReports(allReports);
        }
      );

    return () => unsubscribe();

  }, []);

  // SUBMIT RESPONSE
  const submitResponse = async (
    reportId
  ) => {

    try {

      await updateDoc(
        doc(
          db,
          "reports",
          reportId
        ),
        {
          adminSolution:
            responses[
              reportId
            ] || "",

          status:
            "Resolved"
        }
      );

      setSuccessMessage(
        "Response submitted successfully."
      );

      setShowSuccessModal(
        true
      );

    } catch (error) {

      console.error(error);
    }
  };

  // DELETE REPORT
  const deleteReport = async () => {

    try {

      await deleteDoc(
        doc(
          db,
          "reports",
          selectedReportId
        )
      );

      setShowDeleteModal(
        false
      );

      setSuccessMessage(
        "Report deleted successfully."
      );

      setShowSuccessModal(
        true
      );

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
            fontSize: "42px",
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

      {/* REPORT LIST */}

      {reports.length === 0 && (

        <div
          style={{
            backgroundColor:
              "white",
            padding: "30px",
            borderRadius: "25px",
            textAlign: "center"
          }}
        >

          <h2
            style={{
              color: "#1B5E20"
            }}
          >
            No reports submitted.
          </h2>

        </div>

      )}

      {reports.map((report) => (

        <div
          key={report.id}
          style={{
            backgroundColor:
              "white",
            padding: "30px",
            borderRadius: "25px",
            marginBottom: "25px",
            boxShadow:
              "0 8px 20px rgba(0,0,0,0.08)"
          }}
        >

          {/* HEADER */}

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
              flexWrap: "wrap",
              gap: "10px",
              marginBottom: "20px"
            }}
          >

            <div>

              <h2
                style={{
                  color:
                    "#1B5E20",
                  marginBottom:
                    "8px"
                }}
              >
                Resident Report
              </h2>

              <p
                style={{
                  color:
                    "#666",
                  margin: 0
                }}
              >
                {report.reporterEmail}
              </p>

            </div>

            {/* STATUS */}

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

                borderRadius:
                  "30px",

                fontWeight:
                  "600"
              }}
            >
              {report.status}
            </div>

          </div>

          {/* CATEGORY */}

          <h3
            style={{
              color: "#1B5E20",
              marginBottom: "10px"
            }}
          >
            {report.category}
          </h3>

          {/* CONCERN */}

          <div
            style={{
              backgroundColor:
                "#f8f8f8",
              padding: "20px",
              borderRadius:
                "18px",
              marginBottom: "25px"
            }}
          >

            <p
              style={{
                lineHeight:
                  "1.8",
                margin: 0
              }}
            >
              {report.concern}
            </p>

          </div>

          {/* RESPONSE SECTION */}

          <div
            style={{
              marginBottom: "20px"
            }}
          >

            <h3
              style={{
                color: "#1B5E20",
                marginBottom: "12px"
              }}
            >
              Write Response
            </h3>

            <textarea
              placeholder="Write your response or solution here..."
              value={
                responses[
                  report.id
                ] || ""
              }
              onChange={(e) =>
                setResponses({
                  ...responses,
                  [report.id]:
                    e.target.value
                })
              }
              style={{
                width: "100%",
                height: "140px",
                padding: "18px",
                borderRadius:
                  "15px",
                border:
                  "1px solid #ccc",
                marginBottom:
                  "15px",
                resize: "none",
                fontSize: "15px"
              }}
            />

            {/* BUTTONS */}

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap"
              }}
            >

              {/* SUBMIT */}

              <button
                onClick={() =>
                  submitResponse(
                    report.id
                  )
                }
                style={{
                  background:
                    "linear-gradient(90deg,#1B5E20,#43A047)",
                  color:
                    "white",
                  border: "none",
                  padding:
                    "12px 22px",
                  borderRadius:
                    "12px",
                  cursor:
                    "pointer",
                  fontWeight:
                    "600",
                  fontSize:
                    "15px"
                }}
              >
                Submit Response
              </button>

              {/* DELETE */}

              <button
                onClick={() => {

                  setSelectedReportId(
                    report.id
                  );

                  setShowDeleteModal(
                    true
                  );

                }}
                style={{
                  backgroundColor:
                    "#d32f2f",
                  color:
                    "white",
                  border:
                    "none",
                  padding:
                    "12px 22px",
                  borderRadius:
                    "12px",
                  cursor:
                    "pointer",
                  fontWeight:
                    "600",
                  fontSize:
                    "15px"
                }}
              >
                Delete Report
              </button>

            </div>

          </div>

          {/* EXISTING RESPONSE */}

          {report.adminSolution && (

            <div
              style={{
                backgroundColor:
                  "#E8F5E9",
                padding: "20px",
                borderRadius:
                  "18px",
                marginTop: "20px"
              }}
            >

              <h3
                style={{
                  color:
                    "#1B5E20",
                  marginBottom:
                    "10px"
                }}
              >
                Submitted Response
              </h3>

              <p
                style={{
                  margin: 0,
                  lineHeight:
                    "1.8"
                }}
              >
                {report.adminSolution}
              </p>

            </div>

          )}

        </div>

      ))}

      {/* DELETE MODAL */}

      {showDeleteModal && (

        <div
          style={{
            position:
              "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor:
              "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent:
              "center",
            alignItems:
              "center",
            zIndex: 9999
          }}
        >

          <div
            style={{
              backgroundColor:
                "white",
              padding: "35px",
              borderRadius:
                "25px",
              width: "400px",
              textAlign:
                "center",
              boxShadow:
                "0 10px 30px rgba(0,0,0,0.2)"
            }}
          >

            <h2
              style={{
                color:
                  "#1B5E20",
                marginBottom:
                  "15px"
              }}
            >
              Delete Report
            </h2>

            <p
              style={{
                color: "#555",
                marginBottom:
                  "30px",
                lineHeight:
                  "1.7"
              }}
            >
              Are you sure you want
              to permanently delete
              this report?
            </p>

            <div
              style={{
                display: "flex",
                justifyContent:
                  "center",
                gap: "15px"
              }}
            >

              {/* CANCEL */}

              <button
                onClick={() =>
                  setShowDeleteModal(
                    false
                  )
                }
                style={{
                  padding:
                    "12px 20px",
                  borderRadius:
                    "12px",
                  border:
                    "1px solid #ccc",
                  backgroundColor:
                    "white",
                  cursor:
                    "pointer",
                  fontWeight:
                    "600"
                }}
              >
                Cancel
              </button>

              {/* DELETE */}

              <button
                onClick={
                  deleteReport
                }
                style={{
                  padding:
                    "12px 20px",
                  borderRadius:
                    "12px",
                  border:
                    "none",
                  backgroundColor:
                    "#d32f2f",
                  color:
                    "white",
                  cursor:
                    "pointer",
                  fontWeight:
                    "600"
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
            position:
              "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor:
              "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent:
              "center",
            alignItems:
              "center",
            zIndex: 10000
          }}
        >

          <div
            style={{
              backgroundColor:
                "white",
              padding: "35px",
              borderRadius:
                "25px",
              width: "380px",
              textAlign:
                "center",
              boxShadow:
                "0 10px 30px rgba(0,0,0,0.2)"
            }}
          >

            {/* ICON */}

            <div
              style={{
                width: "80px",
                height: "80px",
                backgroundColor:
                  "#E8F5E9",
                borderRadius:
                  "50%",
                display: "flex",
                justifyContent:
                  "center",
                alignItems:
                  "center",
                margin:
                  "0 auto 20px auto",
                fontSize: "40px"
              }}
            >
              ✅
            </div>

            <h2
              style={{
                color:
                  "#1B5E20",
                marginBottom:
                  "12px"
              }}
            >
              Success
            </h2>

            <p
              style={{
                color:
                  "#555",
                marginBottom:
                  "25px",
                lineHeight:
                  "1.7"
              }}
            >
              {successMessage}
            </p>

            <button
              onClick={() =>
                setShowSuccessModal(
                  false
                )
              }
              style={{
                background:
                  "linear-gradient(90deg,#1B5E20,#43A047)",
                color:
                  "white",
                border:
                  "none",
                padding:
                  "12px 25px",
                borderRadius:
                  "12px",
                cursor:
                  "pointer",
                fontWeight:
                  "600"
              }}
            >
              Continue
            </button>

          </div>

        </div>

      )}

    </div>
  );
}