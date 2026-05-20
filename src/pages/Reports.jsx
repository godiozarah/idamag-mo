import {
  useEffect,
  useState
} from "react";

import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  doc
} from "firebase/firestore";

import {
  auth,
  db
} from "../firebase";

export default function Reports() {

  const [category, setCategory] =
    useState("");

  const [details, setDetails] =
    useState("");

  const [reports, setReports] =
    useState([]);

  // ADMIN EMAIL
  const adminEmail =
    "admin@ucab.com";

  // LOAD REPORTS
  useEffect(() => {

    const user = auth.currentUser;

    if (!user) return;

    const unsubscribe =
      onSnapshot(
        collection(db, "reports"),
        (snapshot) => {

          const allReports =
            snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data()
            }));

          const isAdmin =
            user.email === adminEmail;

          setReports(

            isAdmin
              ? allReports
              : allReports.filter(
                  (report) =>
                    report.userId ===
                    user.uid
                )

          );
        }
      );

    return () => unsubscribe();

  }, []);

  // SUBMIT REPORT
  const submitReport = async () => {

    if (
      category.trim() === "" ||
      details.trim() === ""
    ) {

      return;
    }

    const user = auth.currentUser;

    if (!user) return;

    try {

      await addDoc(
        collection(db, "reports"),
        {
          reporterEmail:
            user.email,

          userId:
            user.uid,

          category:
            category,

          concern:
            details,

          status:
            "Pending",

          adminSolution:
            "",

          createdAt:
            serverTimestamp()
        }
      );

      setCategory("");
      setDetails("");

    } catch (error) {

      console.error(error);
    }
  };

  // DELETE REPORT
  const deleteReport = async (
    reportId
  ) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this report?"
      );

    if (!confirmDelete) return;

    try {

      await deleteDoc(
        doc(db, "reports", reportId)
      );

      alert(
        "Report deleted successfully."
      );

    } catch (error) {

      console.error(error);

      alert(
        "Failed to delete report."
      );
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
          Resident Reports
        </h1>

        <p
          style={{
            color: "#555",
            fontSize: "16px"
          }}
        >
          Submit concerns and track barangay responses.
        </p>

      </div>

      {/* REPORT FORM */}

      <div
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "25px",
          marginBottom: "35px",
          boxShadow:
            "0 8px 20px rgba(0,0,0,0.08)"
        }}
      >

        <h2
          style={{
            color: "#1B5E20",
            marginBottom: "25px"
          }}
        >
          Submit New Report
        </h2>

        {/* CATEGORY */}

        <select
          value={category}
          onChange={(e) =>
            setCategory(
              e.target.value
            )
          }
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: "15px",
            border:
              "1px solid #ccc",
            marginBottom: "20px",
            fontSize: "15px"
          }}
        >

          <option value="">
            Select Concern Type
          </option>

          <option value="Garbage">
            Garbage
          </option>

          <option value="Road Damage">
            Road Damage
          </option>

          <option value="Noise Complaint">
            Noise Complaint
          </option>

          <option value="Water Problem">
            Water Problem
          </option>

          <option value="Emergency">
            Emergency
          </option>

          <option value="Others">
            Others
          </option>

        </select>

        {/* DETAILS */}

        <textarea
          placeholder="Explain your concern in detail..."
          value={details}
          onChange={(e) =>
            setDetails(
              e.target.value
            )
          }
          style={{
            width: "100%",
            height: "150px",
            padding: "18px",
            borderRadius: "15px",
            border:
              "1px solid #ccc",
            marginBottom: "20px",
            resize: "none",
            fontSize: "15px"
          }}
        />

        {/* SUBMIT */}

        <button
          onClick={submitReport}
          style={{
            background:
              "linear-gradient(90deg,#1B5E20,#43A047)",
            color: "white",
            border: "none",
            padding: "14px 28px",
            borderRadius: "14px",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          Submit Report
        </button>

      </div>

      {/* REPORT LIST */}

      <div>

        <h2
          style={{
            color: "#1B5E20",
            marginBottom: "25px"
          }}
        >
          Submitted Reports
        </h2>

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

            <h3
              style={{
                color: "#1B5E20"
              }}
            >
              No reports available.
            </h3>

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
                alignItems: "center",
                marginBottom: "20px",
                flexWrap: "wrap",
                gap: "10px"
              }}
            >

              <h2
                style={{
                  color: "#1B5E20",
                  margin: 0
                }}
              >
                {report.category}
              </h2>

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

                  fontWeight: "600"
                }}
              >
                {report.status}
              </div>

            </div>

            {/* REPORTER */}

            <p
              style={{
                color: "#777",
                marginBottom: "15px"
              }}
            >
              Reporter:
              {" "}
              {report.reporterEmail}
            </p>

            {/* CONCERN */}

            <div
              style={{
                backgroundColor:
                  "#f8f8f8",
                padding: "20px",
                borderRadius: "18px",
                marginBottom: "20px"
              }}
            >

              <p
                style={{
                  lineHeight: "1.8",
                  margin: 0
                }}
              >
                {report.concern}
              </p>

            </div>

            {/* ADMIN DELETE */}

            {auth.currentUser?.email ===
              adminEmail && (

              <button
                onClick={() =>
                  deleteReport(
                    report.id
                  )
                }
                style={{
                  backgroundColor:
                    "#d32f2f",
                  color: "white",
                  border: "none",
                  padding:
                    "12px 20px",
                  borderRadius:
                    "12px",
                  cursor: "pointer",
                  marginBottom:
                    "20px",
                  fontWeight: "600"
                }}
              >
                Delete Report
              </button>

            )}

            {/* RESPONSE */}

            {report.adminSolution && (

              <div
                style={{
                  backgroundColor:
                    "#E8F5E9",
                  padding: "20px",
                  borderRadius: "18px"
                }}
              >

                <h3
                  style={{
                    color: "#1B5E20"
                  }}
                >
                  Barangay Response
                </h3>

                <p>
                  {report.adminSolution}
                </p>

              </div>

            )}

          </div>

        ))}

      </div>

    </div>
  );
}