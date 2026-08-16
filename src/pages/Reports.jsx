import { useEffect, useState } from "react";

import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  getDoc,
  onSnapshot,
  deleteDoc,
  updateDoc,
  setDoc,
  increment,
} from "firebase/firestore";

import { auth, db, storage } from "../firebase";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import Swal from "sweetalert2";

import {
  FaFileAlt,
  FaClock,
  FaCheckCircle,
  FaSpinner,
  FaTrash,
  FaSearch,
  FaPaperPlane,
} from "react-icons/fa";

export default function Reports() {
  // ==========================
  // FORM STATES
  // ==========================

  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [category, setCategory] = useState("");
  const [concern, setConcern] = useState("");

  // ==========================
  // REPORT STATES
  // ==========================

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [userProfiles, setUserProfiles] = useState({});

  // ADMIN EMAIL
  const adminEmail = "admin@ucab.com";

  // ==========================
  // LOAD REPORTS
  // ==========================

  useEffect(() => {
    const reportsRef = collection(db, "reports");

    const unsubscribe = onSnapshot(
      reportsRef,
      (snapshot) => {
        const allReports = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

        setReports(allReports);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading reports:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // ==========================
  // LOAD USER PROFILES
  // ==========================

  useEffect(() => {
    const loadProfiles = async () => {
      const profiles = {};

      for (const report of reports) {
        if (!report.userId) continue;

        if (profiles[report.userId]) continue;

        try {
          const snap = await getDoc(
            doc(db, "users", report.userId)
          );

          if (snap.exists()) {
            profiles[report.userId] = snap.data();
          }
        } catch (error) {
          console.error(
            "Error loading profile:",
            error
          );
        }
      }

      setUserProfiles(profiles);
    };

    if (reports.length > 0) {
      loadProfiles();
    }
  }, [reports]);

  // ==========================
  // SUBMIT REPORT
  // ==========================

  const submitReport = async () => {
    if (
      title.trim() === "" ||
      category.trim() === "" ||
      concern.trim() === ""
    ) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Information",
        text: "Please fill in all required fields.",
        confirmButtonColor: "#1B5E20",
      });

      return;
    }

    const user = auth.currentUser;

    if (!user) {
      Swal.fire({
        icon: "error",
        title: "Not Logged In",
        text: "Please login first.",
        confirmButtonColor: "#1B5E20",
      });

      return;
    }

    // ==========================
    // DUPLICATE CHECK
    // ==========================

    const normalizedTitle = title
      .trim()
      .toLowerCase();

    const normalizedConcern = concern
      .trim()
      .toLowerCase();

    const possibleDuplicate = reports.some(
      (report) => {
        const sameCategory =
          report.category?.toLowerCase() ===
          category.toLowerCase();

        const existingTitle =
          report.title?.trim().toLowerCase() || "";

        const existingConcern =
          report.concern?.trim().toLowerCase() || "";

        const sameTitle =
          existingTitle === normalizedTitle;

        const sameConcern =
          existingConcern === normalizedConcern;

        const activeReport =
          report.status !== "Resolved" &&
          report.status !== "Declined";

        return (
          sameCategory &&
          (sameTitle || sameConcern) &&
          activeReport
        );
      }
    );

    if (possibleDuplicate) {
      const result = await Swal.fire({
        icon: "warning",
        title: "Possible Duplicate Report",
        text:
          "A similar concern has already been reported. Please check the existing reports before submitting another one.",
        showCancelButton: true,
        confirmButtonText: "Submit Anyway",
        cancelButtonText: "Review Reports",
        confirmButtonColor: "#1B5E20",
        cancelButtonColor: "#6C757D",
      });

      if (!result.isConfirmed) {
        return;
      }
    }

    try {
      let imageUrl = "";

      // ==========================
      // UPLOAD IMAGE
      // ==========================

      if (image) {
        const imageRef = ref(
          storage,
          `reports/${Date.now()}-${image.name}`
        );

        await uploadBytes(imageRef, image);

        imageUrl = await getDownloadURL(imageRef);
      }

      // ==========================
      // GET RESIDENT NUMBER
      // ==========================

      const userDoc = await getDoc(
        doc(db, "users", user.uid)
      );

      const userData = userDoc.exists()
        ? userDoc.data()
        : {};

      let residentNumber =
        userData.residentNumber;

      // ==========================
      // GENERATE RESIDENT NUMBER
      // ==========================

      if (residentNumber === undefined) {
        const counterRef = doc(
          db,
          "counters",
          "residentCounter"
        );

        const counterSnap = await getDoc(
          counterRef
        );

        if (counterSnap.exists()) {
          residentNumber =
            counterSnap.data().current + 1;

          await updateDoc(counterRef, {
            current: increment(1),
          });
        } else {
          residentNumber = 1;

          await setDoc(counterRef, {
            current: 1,
          });
        }

        await updateDoc(
          doc(db, "users", user.uid),
          {
            residentNumber,
          }
        );
      }

      // ==========================
      // SAVE REPORT
      // ==========================

      await addDoc(collection(db, "reports"), {
        title: title.trim(),
        category,
        concern: concern.trim(),

        status: "Pending",

        adminSolution: "",

        imageUrl,

        // Also save imageURL for compatibility
        imageURL: imageUrl,

        resolutionImageURL: "",

        residentNumber,

        reporterEmail: user.email,

        userId: user.uid,

        createdAt: serverTimestamp(),
      });

      // ==========================
      // RESET FORM
      // ==========================

      setTitle("");
      setCategory("");
      setConcern("");
      setImage(null);
      setImagePreview("");

      Swal.fire({
        icon: "success",
        title: "Report Submitted",
        text:
          "Your concern has been sent to the barangay.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Submit error:", error);

      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Unable to submit report.",
        confirmButtonColor: "#1B5E20",
      });
    }
  };

  // ==========================
  // DELETE REPORT
  // ==========================

  const deleteReport = async (reportId) => {
    const result = await Swal.fire({
      title: "Delete Report?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#D32F2F",
      cancelButtonColor: "#6C757D",
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteDoc(
        doc(db, "reports", reportId)
      );

      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Report removed successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: "Unable to delete report.",
        confirmButtonColor: "#1B5E20",
      });
    }
  };

  // ==========================
  // STATUS HELPERS
  // ==========================

  const getStatusStyle = (status) => {
    switch (status) {
      case "Resolved":
        return {
          background: "#E8F5E9",
          color: "#2E7D32",
          icon: "✓",
        };

      case "In Progress":
        return {
          background: "#E3F2FD",
          color: "#1565C0",
          icon: "↻",
        };

      case "Declined":
        return {
          background: "#FFEBEE",
          color: "#C62828",
          icon: "!",
        };

      default:
        return {
          background: "#FFF8E1",
          color: "#F57F17",
          icon: "!",
        };
    }
  };

  // ==========================
  // PROGRESS
  // ==========================

  const getProgressValue = (status) => {
    switch (status) {
      case "Resolved":
        return 100;

      case "In Progress":
        return 60;

      case "Declined":
        return 100;

      default:
        return 25;
    }
  };

  // ==========================
  // DATE FORMAT
  // ==========================

  const formatDate = (timestamp) => {
    if (!timestamp) {
      return "Just now";
    }

    try {
      return timestamp
        .toDate()
        .toLocaleDateString("en-PH", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
    } catch {
      return "Recently submitted";
    }
  };

  // ==========================
  // STATISTICS
  // ==========================

  const totalReports = reports.length;

  const pendingReports = reports.filter(
    (report) =>
      report.status === "Pending"
  ).length;

  const progressReports = reports.filter(
    (report) =>
      report.status === "In Progress"
  ).length;

  const resolvedReports = reports.filter(
    (report) =>
      report.status === "Resolved"
  ).length;

  // ==========================
  // FILTER REPORTS
  // ==========================

  const categories = [
    ...new Set(
      reports
        .map((report) => report.category)
        .filter(Boolean)
    ),
  ];

  const filteredReports = reports.filter((report) => {
    const searchText = search.toLowerCase().trim();

    const titleText = report.title?.toLowerCase() || "";
    const categoryText = report.category?.toLowerCase() || "";
    const concernText = report.concern?.toLowerCase() || "";
    const residentNumber = String(report.residentNumber || "").toLowerCase();
    const statusText = report.status?.toLowerCase() || "";

    const matchesSearch =
      searchText === "" ||
      titleText.includes(searchText) ||
      categoryText.includes(searchText) ||
      concernText.includes(searchText) ||
      residentNumber.includes(searchText) ||
      statusText.includes(searchText);

    const matchesStatus =
      statusFilter === "All" ||
      report.status === statusFilter;

    const matchesCategory =
      categoryFilter === "All" ||
      report.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f4f8f4 0%, #eef7ef 50%, #e8f5e9 100%)",
        padding: "35px 45px 60px",
        fontFamily: "'Segoe UI', sans-serif",
        color: "#263238",
      }}
    >
      {/* ==========================
          HEADER
      ========================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#E8F5E9",
              color: "#1B5E20",
              padding: "7px 14px",
              borderRadius: "30px",
              fontSize: "13px",
              fontWeight: "700",
              marginBottom: "12px",
            }}
          >
            BARANGAY UCAB
          </div>

          <h1
            style={{
              margin: 0,
              color: "#145A1A",
              fontSize: "38px",
              fontWeight: "800",
            }}
          >
            Community Reports
          </h1>

          <p
            style={{
              marginTop: "8px",
              marginBottom: 0,
              color: "#66736A",
              fontSize: "15px",
            }}
          >
            Check existing concerns before submitting a new report.
          </p>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "15px 22px",
            borderRadius: "16px",
            boxShadow:
              "0 5px 18px rgba(27,94,32,0.08)",
            border: "1px solid #E2ECE3",
            minWidth: "170px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: "#7A857D",
              marginBottom: "5px",
              fontWeight: "600",
            }}
          >
            TOTAL REPORTS
          </div>

          <div
            style={{
              fontSize: "28px",
              fontWeight: "800",
              color: "#1B5E20",
            }}
          >
            {totalReports}
          </div>
        </div>
      </div>

      {/* ==========================
          STATISTICS
      ========================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "18px",
          marginBottom: "35px",
        }}
      >
        {/* TOTAL */}

        <div
          style={{
            background: "#fff",
            borderRadius: "18px",
            padding: "20px",
            border: "1px solid #E1E9E2",
            boxShadow:
              "0 5px 18px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              width: "45px",
              height: "45px",
              borderRadius: "12px",
              background: "#E8F5E9",
              color: "#2E7D32",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "15px",
              fontSize: "19px",
            }}
          >
            <FaFileAlt />
          </div>

          <div
            style={{
              color: "#7A857D",
              fontSize: "12px",
              fontWeight: "700",
            }}
          >
            TOTAL REPORTS
          </div>

          <div
            style={{
              color: "#173F1A",
              fontSize: "28px",
              fontWeight: "800",
              marginTop: "4px",
            }}
          >
            {totalReports}
          </div>
        </div>

        {/* PENDING */}

        <div
          style={{
            background: "#fff",
            borderRadius: "18px",
            padding: "20px",
            border: "1px solid #E1E9E2",
            boxShadow:
              "0 5px 18px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              width: "45px",
              height: "45px",
              borderRadius: "12px",
              background: "#FFF8E1",
              color: "#F57F17",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "15px",
              fontSize: "19px",
            }}
          >
            <FaClock />
          </div>

          <div
            style={{
              color: "#7A857D",
              fontSize: "12px",
              fontWeight: "700",
            }}
          >
            PENDING
          </div>

          <div
            style={{
              color: "#173F1A",
              fontSize: "28px",
              fontWeight: "800",
              marginTop: "4px",
            }}
          >
            {pendingReports}
          </div>
        </div>

        {/* IN PROGRESS */}

        <div
          style={{
            background: "#fff",
            borderRadius: "18px",
            padding: "20px",
            border: "1px solid #E1E9E2",
            boxShadow:
              "0 5px 18px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              width: "45px",
              height: "45px",
              borderRadius: "12px",
              background: "#E3F2FD",
              color: "#1565C0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "15px",
              fontSize: "19px",
            }}
          >
            <FaSpinner />
          </div>

          <div
            style={{
              color: "#7A857D",
              fontSize: "12px",
              fontWeight: "700",
            }}
          >
            IN PROGRESS
          </div>

          <div
            style={{
              color: "#173F1A",
              fontSize: "28px",
              fontWeight: "800",
              marginTop: "4px",
            }}
          >
            {progressReports}
          </div>
        </div>

        {/* RESOLVED */}

        <div
          style={{
            background: "#fff",
            borderRadius: "18px",
            padding: "20px",
            border: "1px solid #E1E9E2",
            boxShadow:
              "0 5px 18px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              width: "45px",
              height: "45px",
              borderRadius: "12px",
              background: "#E8F5E9",
              color: "#2E7D32",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "15px",
              fontSize: "19px",
            }}
          >
            <FaCheckCircle />
          </div>

          <div
            style={{
              color: "#7A857D",
              fontSize: "12px",
              fontWeight: "700",
            }}
          >
            RESOLVED
          </div>

          <div
            style={{
              color: "#173F1A",
              fontSize: "28px",
              fontWeight: "800",
              marginTop: "4px",
            }}
          >
            {resolvedReports}
          </div>
        </div>
      </div>

      {/* ==========================
          DUPLICATE WARNING
      ========================== */}

      <div
        style={{
          background:
            "linear-gradient(135deg, #1B5E20, #2E7D32)",
          color: "#fff",
          borderRadius: "18px",
          padding: "20px 23px",
          marginBottom: "30px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          boxShadow:
            "0 7px 22px rgba(27,94,32,0.15)",
        }}
      >
        <div
          style={{
            width: "45px",
            height: "45px",
            minWidth: "45px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            fontWeight: "800",
          }}
        >
          i
        </div>

        <div>
          <div
            style={{
              fontWeight: "800",
              fontSize: "15px",
              marginBottom: "3px",
            }}
          >
            Check before you report
          </div>

          <div
            style={{
              fontSize: "13px",
              opacity: 0.9,
              lineHeight: "1.5",
            }}
          >
            Search the reports below first. If the same concern
            has already been reported, you do not need to submit
            another report.
          </div>
        </div>
      </div>

      {/* ==========================
          SUBMIT REPORT
      ========================== */}

      <div
        style={{
          marginTop: "50px",
          marginBottom: "18px",
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "#174E1B",
            fontSize: "25px",
            fontWeight: "800",
          }}
        >
          Submit a New Report
        </h2>

        <p
          style={{
            margin: "5px 0 0",
            color: "#7A857D",
            fontSize: "13px",
          }}
        >
          Only submit a new report if the concern has not already
          been reported.
        </p>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          padding: "28px",
          border:
            "1px solid #E1E9E2",
          boxShadow:
            "0 7px 25px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            display: "grid",
            gap: "20px",
          }}
        >
          {/* TITLE */}

          <div>
            <label
              style={{
                display: "block",
                color: "#1B5E20",
                fontWeight: "700",
                fontSize: "14px",
                marginBottom: "8px",
              }}
            >
              Report Title
            </label>

            <input
              type="text"
              placeholder="Example: Broken street light"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              style={{
                width: "100%",
                boxSizing: "border-box",
                border:
                  "1px solid #CDD7CF",
                borderRadius: "11px",
                padding: "13px 14px",
                outline: "none",
                fontSize: "14px",
              }}
            />
          </div>

          {/* CATEGORY */}

          <div>
            <label
              style={{
                display: "block",
                color: "#1B5E20",
                fontWeight: "700",
                fontSize: "14px",
                marginBottom: "8px",
              }}
            >
              Category
            </label>

            <select
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                boxSizing: "border-box",
                border:
                  "1px solid #CDD7CF",
                borderRadius: "11px",
                padding: "13px 14px",
                background: "#fff",
                color: "#344238",
                outline: "none",
                fontSize: "14px",
              }}
            >
              <option value="">
                Select Category
              </option>

              <option value="Garbage">
                Garbage
              </option>

              <option value="Road Damage">
                Road Damage
              </option>

              <option value="Damaged Infrastructure">
                Damaged Infrastructure
              </option>

              <option value="Public Safety">
                Public Safety
              </option>

              <option value="Waste Management">
                Waste Management
              </option>

              <option value="Drainage Problems">
                Drainage Problems
              </option>

              <option value="Street Lighting">
                Street Lighting
              </option>

              <option value="Others">
                Others
              </option>
            </select>
          </div>

          {/* CONCERN */}

          <div>
            <label
              style={{
                display: "block",
                color: "#1B5E20",
                fontWeight: "700",
                fontSize: "14px",
                marginBottom: "8px",
              }}
            >
              Concern Description
            </label>

            <textarea
              rows="5"
              placeholder="Describe your concern..."
              value={concern}
              onChange={(e) =>
                setConcern(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                boxSizing: "border-box",
                border:
                  "1px solid #CDD7CF",
                borderRadius: "11px",
                padding: "14px",
                resize: "vertical",
                outline: "none",
                fontFamily:
                  "inherit",
                fontSize: "14px",
              }}
            />
          </div>

          {/* IMAGE */}

          <div>
            <label
              style={{
                display: "block",
                color: "#1B5E20",
                fontWeight: "700",
                fontSize: "14px",
                marginBottom: "8px",
              }}
            >
              Attach Image
              <span
                style={{
                  color: "#89938B",
                  fontSize: "12px",
                  fontWeight: "400",
                  marginLeft: "6px",
                }}
              >
                Optional
              </span>
            </label>

            <div
              style={{
                border:
                  "2px dashed #C8D8CA",
                borderRadius: "13px",
                padding: "18px",
                background:
                  "#FAFCFA",
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file =
                    e.target.files?.[0];

                  setImage(file);

                  if (file) {
                    setImagePreview(
                      URL.createObjectURL(
                        file
                      )
                    );
                  } else {
                    setImagePreview(
                      ""
                    );
                  }
                }}
              />
            </div>
          </div>

          {/* PREVIEW */}

          {imagePreview && (
            <div>
              <label
                style={{
                  display: "block",
                  color: "#1B5E20",
                  fontWeight: "700",
                  fontSize: "14px",
                  marginBottom: "8px",
                }}
              >
                Image Preview
              </label>

              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  width: "240px",
                  height: "175px",
                  objectFit: "cover",
                  borderRadius: "14px",
                  border:
                    "1px solid #DDE5DE",
                }}
              />
            </div>
          )}

          {/* SUBMIT */}

          <div
            style={{
              paddingTop: "5px",
            }}
          >
            <button
              onClick={submitReport}
              style={{
                background:
                  "#1B5E20",
                color: "#fff",
                border: "none",
                borderRadius: "11px",
                padding:
                  "13px 22px",
                cursor:
                  "pointer",
                fontWeight:
                  "750",
                fontSize:
                  "13px",
                display:
                  "inline-flex",
                alignItems:
                  "center",
                gap: "8px",
              }}
            >
              <FaPaperPlane />
              Submit Report
            </button>
          </div>
        </div>
      </div>

      {/* ==========================
          SEARCH & FILTER
      ========================== */

      <div
        style={{
          background: "#fff",
          borderRadius: "18px",
          padding: "20px",
          border: "1px solid #E1E9E2",
          boxShadow: "0 5px 18px rgba(0,0,0,0.05)",
          marginBottom: "30px",
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(search.trim());
          }}
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(250px, 1fr) 160px 190px auto",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              border: "1px solid #CDD7CF",
              borderRadius: "11px",
              overflow: "hidden",
              background: "#fff",
              minHeight: "46px",
            }}
          >
            <div
              style={{
                padding: "0 14px",
                color: "#2E7D32",
                display: "flex",
                alignItems: "center",
              }}
            >
              <FaSearch />
            </div>

            <input
              type="text"
              placeholder="Search title, category, concern, or resident #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                padding: "13px 10px 13px 0",
                fontSize: "13px",
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              border: "1px solid #CDD7CF",
              borderRadius: "11px",
              padding: "13px 12px",
              background: "#fff",
              color: "#455248",
              outline: "none",
              fontSize: "13px",
              height: "46px",
            }}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Declined">Declined</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              border: "1px solid #CDD7CF",
              borderRadius: "11px",
              padding: "13px 12px",
              background: "#fff",
              color: "#455248",
              outline: "none",
              fontSize: "13px",
              height: "46px",
            }}
          >
            <option value="All">All Categories</option>

            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <button
            type="submit"
            style={{
              background: "#1B5E20",
              color: "#fff",
              border: "none",
              borderRadius: "11px",
              padding: "13px 20px",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "13px",
              height: "46px",
              whiteSpace: "nowrap",
            }}
          >
            <FaSearch style={{ marginRight: "7px" }} />
            Search
          </button>
        </form>

        {search.trim() !== "" && (
          <div
            style={{
              marginTop: "13px",
              paddingTop: "13px",
              borderTop: "1px solid #EDF1EE",
              color: "#66736A",
              fontSize: "13px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span>
              <strong style={{ color: "#1B5E20" }}>
                {filteredReports.length}
              </strong>{" "}
              report{filteredReports.length !== 1 ? "s" : ""} found for{" "}
              <strong style={{ color: "#263238" }}>
                "{search.trim()}"
              </strong>
            </span>

            <button
              type="button"
              onClick={() => setSearch("")}
              style={{
                background: "#F5F7F5",
                color: "#455248",
                border: "1px solid #D9E1DA",
                borderRadius: "9px",
                padding: "7px 12px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "12px",
              }}
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

      /* ==========================
          EXISTING REPORTS
      ========================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "15px",
          marginBottom: "18px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color: "#174E1B",
              fontSize: "25px",
              fontWeight: "800",
            }}
          >
            Existing Reports
          </h2>

          <p
            style={{
              margin: "5px 0 0",
              color: "#7A857D",
              fontSize: "13px",
            }}
          >
            View concerns already reported by the community.
          </p>
        </div>

        <div
          style={{
            background: "#E8F5E9",
            color: "#2E7D32",
            padding: "8px 13px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "700",
          }}
        >
          {filteredReports.length} Reports
        </div>
      </div>

      {/* ==========================
          LOADING
      ========================== */}

      {loading && (
        <div
          style={{
            background: "#fff",
            borderRadius: "18px",
            padding: "50px",
            textAlign: "center",
            marginBottom: "35px",
          }}
        >
          <div
            style={{
              width: "45px",
              height: "45px",
              border:
                "4px solid #E8F5E9",
              borderTop:
                "4px solid #2E7D32",
              borderRadius: "50%",
              margin: "0 auto 15px",
              animation:
                "spin 1s linear infinite",
            }}
          />

          <p
            style={{
              margin: 0,
              color: "#7A857D",
            }}
          >
            Loading community reports...
          </p>
        </div>
      )}

      {/* ==========================
          EMPTY
      ========================== */}

      {!loading &&
        filteredReports.length === 0 && (
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "50px 25px",
              textAlign: "center",
              border:
                "1px solid #E3EAE4",
              boxShadow:
                "0 5px 18px rgba(0,0,0,0.05)",
              marginBottom: "35px",
            }}
          >
            <div
              style={{
                width: "65px",
                height: "65px",
                borderRadius: "50%",
                background: "#E8F5E9",
                color: "#2E7D32",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 15px",
                fontSize: "27px",
              }}
            >
              <FaFileAlt />
            </div>

            <h3
              style={{
                color: "#1B5E20",
                marginBottom: "7px",
              }}
            >
              No Reports Found
            </h3>

            <p
              style={{
                color: "#7A857D",
                margin: 0,
                fontSize: "14px",
              }}
            >
              No reports match your current search or filters.
            </p>
          </div>
        )}

      {/* ==========================
          REPORT CARDS
      ========================== */}

      {!loading &&
        filteredReports.map((report) => {
          const status =
            report.status || "Pending";

          const statusStyle =
            getStatusStyle(status);

          const beforeImage =
            report.imageURL ||
            report.imageUrl;

          const avatar =
            userProfiles[report.userId]?.avatar ||
            "avatar1.png";

          return (
            <div
              key={report.id}
              style={{
                background: "#fff",
                borderRadius: "20px",
                padding: "28px",
                marginBottom: "22px",
                border:
                  "1px solid #E1E9E2",
                boxShadow:
                  "0 7px 25px rgba(0,0,0,0.06)",
              }}
            >
              {/* REPORT HEADER */}

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "flex-start",
                  flexWrap: "wrap",
                  gap: "20px",
                  paddingBottom: "20px",
                  borderBottom:
                    "1px solid #EDF1EE",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "inline-block",
                      background: "#E8F5E9",
                      color: "#1B5E20",
                      padding: "5px 10px",
                      borderRadius: "7px",
                      fontSize: "11px",
                      fontWeight: "700",
                      marginBottom: "9px",
                    }}
                  >
                    {report.category ||
                      "Others"}
                  </div>

                  <h2
                    style={{
                      margin: 0,
                      color: "#173F1A",
                      fontSize: "23px",
                      fontWeight: "800",
                    }}
                  >
                    {report.title ||
                      "Untitled Report"}
                  </h2>
                </div>

                <div
                  style={{
                    background:
                      statusStyle.background,
                    color:
                      statusStyle.color,
                    padding:
                      "9px 15px",
                    borderRadius: "30px",
                    fontWeight: "750",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>
                    {statusStyle.icon}
                  </span>

                  {status}
                </div>
              </div>

              {/* RESIDENT INFO */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "20px",
                  gap: "12px",
                }}
              >
                <img
                  src={`/${avatar}`}
                  alt="Resident"
                  style={{
                    width: "45px",
                    height: "45px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border:
                      "2px solid #C8DCCB",
                  }}
                />

                <div>
                  <div
                    style={{
                      fontWeight: "750",
                      color: "#344238",
                      fontSize: "13px",
                    }}
                  >
                    Resident #
                    {String(
                      report.residentNumber ||
                        0
                    ).padStart(4, "0")}
                  </div>

                  <div
                    style={{
                      color: "#7A857D",
                      fontSize: "11px",
                      marginTop: "3px",
                    }}
                  >
                    {formatDate(
                      report.createdAt
                    )}
                  </div>

                  {auth.currentUser
                    ?.email === adminEmail && (
                    <div
                      style={{
                        color: "#7A857D",
                        fontSize: "11px",
                        marginTop: "2px",
                      }}
                    >
                      {report.reporterEmail}
                    </div>
                  )}
                </div>
              </div>

              {/* CONCERN */}

              <div
                style={{
                  marginTop: "22px",
                }}
              >
                <h3
                  style={{
                    color: "#1B5E20",
                    margin:
                      "0 0 9px",
                    fontSize: "15px",
                  }}
                >
                  Concern
                </h3>

                <div
                  style={{
                    background:
                      "#F7F9F7",
                    border:
                      "1px solid #E8EDE8",
                    borderRadius: "12px",
                    padding: "16px",
                    color: "#455248",
                    lineHeight: "1.6",
                    fontSize: "14px",
                  }}
                >
                  {report.concern ||
                    "No concern description provided."}
                </div>
              </div>

              {/* BEFORE PHOTO */}

              {beforeImage && (
                <div
                  style={{
                    marginTop: "22px",
                  }}
                >
                  <h3
                    style={{
                      color: "#1B5E20",
                      margin:
                        "0 0 10px",
                      fontSize: "15px",
                    }}
                  >
                    Report Photo
                  </h3>

                  <img
                    src={beforeImage}
                    alt="Report"
                    style={{
                      width: "240px",
                      height: "175px",
                      objectFit:
                        "cover",
                      borderRadius:
                        "14px",
                      border:
                        "1px solid #DDE5DE",
                      display:
                        "block",
                    }}
                  />
                </div>
              )}

              {/* PROGRESS */}

              <div
                style={{
                  marginTop: "24px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    marginBottom:
                      "8px",
                  }}
                >
                  <span
                    style={{
                      color: "#455248",
                      fontWeight: "700",
                      fontSize: "12px",
                    }}
                  >
                    Report Progress
                  </span>

                  <span
                    style={{
                      color:
                        statusStyle.color,
                      fontWeight: "750",
                      fontSize: "12px",
                    }}
                  >
                    {getProgressValue(
                      status
                    )}
                    %
                  </span>
                </div>

                <div
                  style={{
                    height: "8px",
                    background:
                      "#E8EDE8",
                    borderRadius:
                      "20px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${getProgressValue(
                        status
                      )}%`,
                      height: "100%",
                      background:
                        status ===
                        "Resolved"
                          ? "#2E7D32"
                          : status ===
                            "In Progress"
                          ? "#1565C0"
                          : "#F9A825",
                      borderRadius:
                        "20px",
                      transition:
                        "width .3s ease",
                    }}
                  />
                </div>
              </div>

              {/* BARANGAY RESPONSE */}

              {report.adminSolution && (
                <div
                  style={{
                    marginTop: "24px",
                  }}
                >
                  <h3
                    style={{
                      color: "#1B5E20",
                      margin:
                        "0 0 9px",
                      fontSize: "15px",
                    }}
                  >
                    Action Taken
                  </h3>

                  <div
                    style={{
                      background:
                        "#F1F8F2",
                      border:
                        "1px solid #CDE5D0",
                      borderRadius:
                        "12px",
                      padding: "17px",
                      color:
                        "#245B2A",
                      lineHeight: "1.7",
                      fontSize: "14px",
                    }}
                  >
                    {report.adminSolution}
                  </div>
                </div>
              )}

              {/* RESOLUTION PHOTO */}

              {report.resolutionImageURL && (
                <div
                  style={{
                    marginTop: "20px",
                  }}
                >
                  <h3
                    style={{
                      color: "#1B5E20",
                      margin:
                        "0 0 10px",
                      fontSize: "15px",
                    }}
                  >
                    Resolution Photo
                  </h3>

                  <img
                    src={
                      report.resolutionImageURL
                    }
                    alt="Resolution"
                    style={{
                      width: "240px",
                      height: "175px",
                      objectFit:
                        "cover",
                      borderRadius:
                        "14px",
                      border:
                        "1px solid #CDE5D0",
                      display:
                        "block",
                    }}
                  />
                </div>
              )}

              {/* ADMIN DELETE */}

              {auth.currentUser
                ?.email === adminEmail && (
                <div
                  style={{
                    marginTop: "22px",
                    paddingTop: "20px",
                    borderTop:
                      "1px solid #EDF1EE",
                  }}
                >
                  <button
                    onClick={() =>
                      deleteReport(
                        report.id
                      )
                    }
                    style={{
                      background:
                        "#FFF1F0",
                      color:
                        "#C62828",
                      border:
                        "1px solid #FFD2CF",
                      borderRadius:
                        "10px",
                      padding:
                        "11px 18px",
                      cursor:
                        "pointer",
                      fontWeight:
                        "700",
                      fontSize:
                        "12px",
                    }}
                  >
                    <FaTrash
                      style={{
                        marginRight:
                          "7px",
                      }}
                    />
                    Delete Report
                  </button>
                </div>
              )}
            </div>
          );
        })}

      {/* ==========================
          ANIMATION
      ========================== */}

      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 900px) {
            .reports-filter-grid {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 768px) {
            body {
              overflow-x: hidden;
            }
          }
        `}
      </style>
    </div>
  );
}