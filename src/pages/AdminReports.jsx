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
          "No solution provided yet."
      });

      alert("Report updated!");

    } catch (error) {

      console.error(error);
    }
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "20px auto",
        fontFamily: "Arial"
      }}
    >

      <h1>
        🛠 Admin Report Management
      </h1>

      {reports.map((report) => (

        <div
          key={report.id}
          style={{
            border: "1px solid #ccc",
            borderRadius: "10px",
            padding: "15px",
            marginBottom: "20px"
          }}
        >

          {/* REPORTER */}
          <h3>
            Reporter:
          </h3>

          <p>
            {report.reporterEmail}
          </p>

          {/* CONCERN */}
          <h3>
            Concern:
          </h3>

          <p>
            {report.concern}
          </p>

          {/* STATUS */}
          <p>
            <strong>Status:</strong>
            {" "}
            {report.status}
          </p>

          {/* CURRENT SOLUTION */}
          {report.adminSolution && (

            <div
              style={{
                backgroundColor: "#f5f5f5",
                padding: "10px",
                borderRadius: "8px",
                marginBottom: "10px"
              }}
            >

              <strong>
                Current Solution:
              </strong>

              <p>
                {report.adminSolution}
              </p>

            </div>

          )}

          {/* SOLUTION INPUT */}
          <textarea
            placeholder="Write a solution or response..."
            value={
              solutions[report.id] || ""
            }
            onChange={(e) =>
              setSolutions({
                ...solutions,
                [report.id]: e.target.value
              })
            }
            style={{
              width: "100%",
              height: "80px",
              padding: "10px",
              marginBottom: "10px"
            }}
          />

          {/* BUTTONS */}
          <div
            style={{
              display: "flex",
              gap: "10px"
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
                padding: "10px 20px"
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
                padding: "10px 20px"
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