import {
  useEffect,
  useState
} from "react";

import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp
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

  // LOAD USER REPORTS
  useEffect(() => {

    const user = auth.currentUser;

    if (!user) return;

    const unsubscribe =
      onSnapshot(
        collection(db, "reports"),
        (snapshot) => {

          const reportList =
            snapshot.docs
              .map((doc) => ({
                id: doc.id,
                ...doc.data()
              }))
              .filter(
                (report) =>
                  report.userId === user.uid
              );

          setReports(reportList);
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
      alert(
        "Please complete all fields."
      );

      return;
    }

    const user = auth.currentUser;

    if (!user) return;

    try {

      await addDoc(
        collection(db, "reports"),
        {
          reporterEmail: user.email,

          userId: user.uid,

          category: category,

          concern: details,

          status: "Pending",

          adminSolution: "",

          createdAt: serverTimestamp()
        }
      );

      alert("Report submitted!");

      setCategory("");
      setDetails("");

    } catch (error) {

      console.error(error);
    }
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "20px auto",
        fontFamily: "Arial"
      }}
    >

      <h1>
        📋 Resident Reports
      </h1>

      {/* REPORT FORM */}
      <div
        style={{
          marginBottom: "20px"
        }}
      >

        {/* CATEGORY */}
        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px"
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
            setDetails(e.target.value)
          }
          style={{
            width: "100%",
            height: "120px",
            padding: "10px",
            marginBottom: "10px"
          }}
        />

        {/* SUBMIT */}
        <button
          onClick={submitReport}
          style={{
            padding: "10px 20px"
          }}
        >
          Submit Report
        </button>

      </div>

      {/* REPORT LIST */}
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

          {/* CATEGORY */}
          <h3>
            🚨 {report.category}
          </h3>

          {/* CONCERN */}
          <p>
            {report.concern}
          </p>

          {/* STATUS */}
          <p>
            <strong>Status:</strong>
            {" "}
            {report.status}
          </p>

          {/* ADMIN RESPONSE */}
          {report.adminSolution && (

            <div
              style={{
                marginTop: "10px",
                backgroundColor: "#f5f5f5",
                padding: "10px",
                borderRadius: "8px"
              }}
            >

              <strong>
                Barangay Response:
              </strong>

              <p>
                {report.adminSolution}
              </p>

            </div>

          )}

        </div>

      ))}

    </div>
  );
}