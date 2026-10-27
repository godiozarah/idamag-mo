import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import { db } from "../firebase";

const storage = getStorage();

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [responses, setResponses] = useState({});
  const [statuses, setStatuses] = useState({});
  const [resolutionImages, setResolutionImages] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // ==========================
  // LOAD REPORTS
  // ==========================
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "reports"),
      (snapshot) => {
        const allReports = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

        setReports(allReports);

        const statusMap = {};

        allReports.forEach((report) => {
          statusMap[report.id] = report.status === "Resolved" ? "Resolved" : "Pending";
        });

        setStatuses(statusMap);
      }
    );

    return () => unsubscribe();
  }, []);

  // ==========================
  // GROUP REPORTS BY CATEGORY
  // ==========================
  const groupedReports = reports.reduce((groups, report) => {
    const category = report.category || "Others";

    if (!groups[category]) {
      groups[category] = [];
    }

    groups[category].push(report);

    return groups;
  }, {});

  // ==========================
  // REPORT FILTERS
  // ==========================
  const pendingReports = reports.filter(
    (report) => report.status !== "Resolved"
  );

  const resolvedReports = reports.filter(
    (report) => report.status === "Resolved"
  );

  const filteredPendingReports = pendingReports.filter(
    (report) =>
      selectedCategory === null ||
      report.category === selectedCategory
  );

  const filteredResolvedReports = resolvedReports.filter(
    (report) =>
      selectedCategory === null ||
      report.category === selectedCategory
  );

  // ==========================
  // STATUS COUNT
  // ==========================
  const getStatusCount = (categoryReports, status) => {
    if (status === "Pending") {
      return categoryReports.filter(
        (report) => report.status !== "Resolved"
      ).length;
    }

    if (status === "Resolved") {
      return categoryReports.filter(
        (report) => report.status === "Resolved"
      ).length;
    }

    return 0;
  };

  // ==========================
  // UPLOAD RESOLUTION PHOTO
  // ==========================
  const uploadResolutionPhoto = async (reportId) => {
    try {
      const file = resolutionImages[reportId];

      if (!file) {
        return null;
      }

      const storageRef = ref(
        storage,
        `resolutionPhotos/${reportId}_${Date.now()}`
      );

      await uploadBytes(storageRef, file);

      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Error uploading resolution photo:", error);
      return null;
    }
  };

  // ==========================
  // SAVE REPORT
  // ==========================
  const submitResponse = async (reportId) => {
    try {
      const resolutionImageURL =
        await uploadResolutionPhoto(reportId);

      const updateData = {
        adminSolution: responses[reportId] || "",
        status: statuses[reportId] || "Pending",
      };

      if (resolutionImageURL) {
        updateData.resolutionImageURL = resolutionImageURL;
      }

      await updateDoc(
        doc(db, "reports", reportId),
        updateData
      );

      setSuccessMessage("Report updated successfully.");
      setShowSuccessModal(true);

      setResolutionImages((previous) => ({
        ...previous,
        [reportId]: null,
      }));
    } catch (error) {
      console.error("Error updating report:", error);
      setSuccessMessage(
        "Something went wrong while updating the report."
      );
      setShowSuccessModal(true);
    }
  };

  // ==========================
  // DELETE REPORT
  // ==========================
  const deleteReport = async () => {
    try {
      await deleteDoc(
        doc(db, "reports", selectedReportId)
      );

      setShowDeleteModal(false);
      setSelectedReportId(null);

      setSuccessMessage("Report deleted successfully.");
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error deleting report:", error);

      setSuccessMessage(
        "Something went wrong while deleting the report."
      );
      setShowSuccessModal(true);
    }
  };

  // ==========================
  // STATUS STYLE
  // ==========================
  const getStatusStyle = (status) => {
    if (status === "Resolved") {
      return {
        background: "#E8F5E9",
        color: "#2E7D32",
        icon: "✓",
      };
    }


    return {
      background: "#FFF8E1",
      color: "#F57F17",
      icon: "!",
    };
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F6F8F6",
        padding: "clamp(20px, 3vw, 42px)",
        fontFamily: "Inter, 'Segoe UI', sans-serif",
        color: "#263238",
        boxSizing: "border-box",
      }}
    >
      {/* ==========================
          PAGE HEADER
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
            REPORT MANAGEMENT
          </div>

          <h1
            style={{
              margin: 0,
              color: "#145A1A",
              fontSize: "clamp(30px, 3vw, 42px)",
              fontWeight: "800",
              letterSpacing: "-1.2px",
              lineHeight: 1.12,
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
            Review, manage, and resolve resident concerns.
          </p>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "15px 22px",
            borderRadius: "16px",
            boxShadow: "0 5px 18px rgba(27,94,32,0.08)",
            border: "1px solid #E2ECE3",
            minWidth: "170px",
            boxSizing: "border-box",
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
            {reports.length}
          </div>
        </div>
      </div>

      {/* ==========================
          CATEGORY CARDS
      ========================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 245px), 1fr))",
          gap: "20px",
          marginBottom: "38px",
        }}
      >
        {Object.entries(groupedReports).map(
          ([category, categoryReports]) => {
            const pendingCount = getStatusCount(
              categoryReports,
              "Pending"
            );

            const resolvedCount = getStatusCount(
              categoryReports,
              "Resolved"
            );

            const isSelected =
              selectedCategory === category;

            return (
              <div
                key={category}
                onClick={() =>
                  setSelectedCategory(
                    isSelected ? null : category
                  )
                }
                style={{
                  background: "#fff",
                  borderRadius: "20px",
                  padding: "24px",
                  minHeight: "190px",
                  boxSizing: "border-box",
                  cursor: "pointer",
                  border: isSelected
                    ? "2px solid #2E7D32"
                    : "1px solid #E1E9E2",
                  boxShadow: isSelected
                    ? "0 8px 24px rgba(46,125,50,0.16)"
                    : "0 8px 26px rgba(20,60,25,0.045)",
                  transition: "all .2s ease",
                  transform: isSelected
                    ? "translateY(-2px)"
                    : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "10px",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      color: "#1B5E20",
                      fontSize: "18px",
                      fontWeight: "750",
                      lineHeight: "1.25",
                    }}
                  >
                    {category}
                  </h3>

                  <span
                    style={{
                      background: "#E8F5E9",
                      color: "#2E7D32",
                      borderRadius: "20px",
                      padding: "5px 9px",
                      fontSize: "11px",
                      fontWeight: "700",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {categoryReports.length}
                  </span>
                </div>

                <p
                  style={{
                    margin: "8px 0 15px",
                    color: "#7A857D",
                    fontSize: "12px",
                  }}
                >
                  {categoryReports.length === 1
                    ? "1 report"
                    : `${categoryReports.length} reports`}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                    marginTop: "4px",
                  }}
                >
                  <span
                    style={{
                      background: "#FFF8E1",
                      color: "#F57F17",
                      padding: "7px 10px",
                      borderRadius: "9px",
                      fontSize: "11px",
                      fontWeight: "700",
                    }}
                  >
                    {pendingCount} Pending
                  </span>


                  <span
                    style={{
                      background: "#E8F5E9",
                      color: "#2E7D32",
                      padding: "7px 10px",
                      borderRadius: "9px",
                      fontSize: "11px",
                      fontWeight: "700",
                    }}
                  >
                    {resolvedCount} Resolved
                  </span>
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* ==========================
          SELECTED CATEGORY
      ========================== */}

      {selectedCategory && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "15px",
            background: "#1B5E20",
            color: "#fff",
            borderRadius: "16px",
            padding: "18px 22px",
            marginBottom: "25px",
            boxShadow: "0 6px 18px rgba(27,94,32,0.15)",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "11px",
                opacity: 0.75,
                fontWeight: "700",
                letterSpacing: "0.5px",
              }}
            >
              FILTERED CATEGORY
            </div>

            <div
              style={{
                fontSize: "21px",
                fontWeight: "750",
                marginTop: "3px",
              }}
            >
              {selectedCategory}
            </div>
          </div>

          <button
            onClick={() => setSelectedCategory(null)}
            style={{
              background: "#fff",
              color: "#1B5E20",
              border: "none",
              borderRadius: "10px",
              padding: "10px 16px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Show All Categories
          </button>
        </div>
      )}

      {/* ==========================
          PENDING / ACTIVE REPORTS
      ========================== */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
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
            {selectedCategory
              ? `${selectedCategory} Reports`
              : "Active Reports"}
          </h2>

          <p
            style={{
              margin: "5px 0 0",
              color: "#7A857D",
              fontSize: "13px",
            }}
          >
            Resident concerns awaiting action
          </p>
        </div>

        <div
          style={{
            background: "#FFF8E1",
            color: "#F57F17",
            padding: "8px 13px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "700",
          }}
        >
          {filteredPendingReports.length} Active
        </div>
      </div>

      {filteredPendingReports.length === 0 ? (
        <div
          style={{
            background: "#fff",
            borderRadius: "20px",
            padding: "50px 25px",
            textAlign: "center",
            boxShadow: "0 5px 18px rgba(0,0,0,0.05)",
            border: "1px solid #E3EAE4",
            marginBottom: "45px",
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
              fontSize: "30px",
            }}
          >
            ✓
          </div>

          <h3
            style={{
              color: "#1B5E20",
              marginBottom: "7px",
            }}
          >
            No active reports
          </h3>

          <p
            style={{
              color: "#7A857D",
              margin: 0,
              fontSize: "14px",
            }}
          >
            There are currently no pending reports.
          </p>
        </div>
      ) : (
        <div style={{ marginBottom: "50px" }}>
          {filteredPendingReports.map((report) => {
            const status = statuses[report.id] || "Pending";
            const statusStyle = getStatusStyle(status);

            return (
              <div
                key={report.id}
                style={{
                  background: "#fff",
                  borderRadius: "20px",
                  padding: "28px",
                  marginBottom: "22px",
                  boxShadow: "0 7px 25px rgba(0,0,0,0.06)",
                  border: "1px solid #E2E9E3",
                }}
              >
                {/* REPORT HEADER */}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "20px",
                    flexWrap: "wrap",
                    paddingBottom: "20px",
                    borderBottom: "1px solid #EDF1EE",
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
                      {report.category || "Others"}
                    </div>

                    <h2
                      style={{
                        margin: 0,
                        color: "#173F1A",
                        fontSize: "24px",
                        fontWeight: "800",
                      }}
                    >
                      {report.title || report.category || "Resident Report"}
                    </h2>

                    <p
                      style={{
                        margin: "8px 0 0",
                        color: "#7A857D",
                        fontSize: "12px",
                      }}
                    >
                      Resident #
                      {String(
                        report.residentNumber || 0
                      ).padStart(4, "0")}
                    </p>
                  </div>

                  <div
                    style={{
                      background: statusStyle.background,
                      color: statusStyle.color,
                      padding: "9px 15px",
                      borderRadius: "30px",
                      fontWeight: "750",
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span>{statusStyle.icon}</span>
                    {status}
                  </div>
                </div>

                {/* CONCERN */}

                <div style={{ marginTop: "22px" }}>
                  <h3
                    style={{
                      color: "#1B5E20",
                      margin: "0 0 9px",
                      fontSize: "15px",
                    }}
                  >
                    Concern
                  </h3>

                  <div
                    style={{
                      background: "#F7F9F7",
                      border: "1px solid #E8EDE8",
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

                {/* RESIDENT PHOTO */}

                {report.imageURL && (
                  <div style={{ marginTop: "22px" }}>
                    <h3
                      style={{
                        color: "#1B5E20",
                        margin: "0 0 10px",
                        fontSize: "15px",
                      }}
                    >
                      Resident Photo
                    </h3>

                    <img
                      src={report.imageURL}
                      alt="Resident report"
                      style={{
                        width: "240px",
                        height: "170px",
                        objectFit: "cover",
                        borderRadius: "14px",
                        border: "1px solid #DDE5DE",
                        display: "block",
                      }}
                    />
                  </div>
                )}

                {/* STATUS */}

                <div style={{ marginTop: "24px" }}>
                  <h3
                    style={{
                      color: "#1B5E20",
                      margin: "0 0 9px",
                      fontSize: "15px",
                    }}
                  >
                    Update Status
                  </h3>

                  <select
                    value={status}
                    onChange={(e) =>
                      setStatuses({
                        ...statuses,
                        [report.id]: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "13px 14px",
                      borderRadius: "11px",
                      border: "1px solid #CDD7CF",
                      background: "#fff",
                      color: "#344238",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  >
                    <option value="Pending">
                      Pending
                    </option>


                    <option value="Resolved">
                      Resolved
                    </option>
                  </select>
                </div>

                {/* ACTION TAKEN */}

                <div style={{ marginTop: "22px" }}>
                  <h3
                    style={{
                      color: "#1B5E20",
                      margin: "0 0 9px",
                      fontSize: "15px",
                    }}
                  >
                    Action Taken
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
                        [report.id]: e.target.value,
                      })
                    }
                    placeholder="Describe the action taken..."
                    style={{
                      width: "100%",
                      minHeight: "120px",
                      padding: "15px",
                      borderRadius: "12px",
                      border: "1px solid #CDD7CF",
                      resize: "vertical",
                      fontFamily: "inherit",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      outline: "none",
                      color: "#344238",
                    }}
                  />
                </div>

                {/* RESOLUTION PHOTO */}

                <div style={{ marginTop: "22px" }}>
                  <h3
                    style={{
                      color: "#1B5E20",
                      margin: "0 0 9px",
                      fontSize: "15px",
                    }}
                  >
                    Resolution Photo
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
                  </h3>

                  <div
                    style={{
                      border: "2px dashed #C8D8CA",
                      borderRadius: "13px",
                      padding: "18px",
                      background: "#FAFCFA",
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setResolutionImages({
                          ...resolutionImages,
                          [report.id]:
                            e.target.files?.[0] || null,
                        })
                      }
                    />

                    {resolutionImages[report.id] && (
                      <p
                        style={{
                          margin: "10px 0 0",
                          color: "#2E7D32",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        ✓{" "}
                        {resolutionImages[report.id].name}
                      </p>
                    )}
                  </div>
                </div>

                {/* ACTION BUTTONS */}

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginTop: "24px",
                    paddingTop: "20px",
                    borderTop: "1px solid #EDF1EE",
                  }}
                >
                  <button
                    onClick={() =>
                      submitResponse(report.id)
                    }
                    style={{
                      background: "#1B5E20",
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      padding: "12px 20px",
                      cursor: "pointer",
                      fontWeight: "700",
                      fontSize: "13px",
                    }}
                  >
                    Save Changes
                  </button>

                  <button
                    onClick={() => {
                      setSelectedReportId(report.id);
                      setShowDeleteModal(true);
                    }}
                    style={{
                      background: "#FFF1F0",
                      color: "#C62828",
                      border: "1px solid #FFD2CF",
                      borderRadius: "10px",
                      padding: "12px 20px",
                      cursor: "pointer",
                      fontWeight: "700",
                      fontSize: "13px",
                    }}
                  >
                    Delete Report
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==========================
          RESOLVED REPORTS
      ========================== */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
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
            Resolved Reports
          </h2>

          <p
            style={{
              margin: "5px 0 0",
              color: "#7A857D",
              fontSize: "13px",
            }}
          >
            Completed resident concerns and actions taken
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
          {filteredResolvedReports.length} Resolved
        </div>
      </div>

      {filteredResolvedReports.length === 0 ? (
        <div
          style={{
            background: "#fff",
            borderRadius: "20px",
            padding: "50px 25px",
            textAlign: "center",
            boxShadow: "0 5px 18px rgba(0,0,0,0.05)",
            border: "1px solid #E3EAE4",
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
              fontSize: "30px",
            }}
          >
            ✓
          </div>

          <h3
            style={{
              color: "#1B5E20",
              marginBottom: "7px",
            }}
          >
            No resolved reports yet
          </h3>

          <p
            style={{
              color: "#7A857D",
              margin: 0,
              fontSize: "14px",
            }}
          >
            Resolved reports will appear here.
          </p>
        </div>
      ) : (
        <div>
          {filteredResolvedReports.map((report) => (
            <div
              key={report.id}
              style={{
                background: "#fff",
                borderRadius: "20px",
                padding: "28px",
                marginBottom: "22px",
                boxShadow:
                  "0 7px 25px rgba(0,0,0,0.06)",
                border: "1px solid #DDE9DF",
              }}
            >
              {/* RESOLVED HEADER */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "20px",
                  flexWrap: "wrap",
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
                    {report.category || "Others"}
                  </div>

                  <h2
                    style={{
                      margin: 0,
                      color: "#173F1A",
                      fontSize: "24px",
                      fontWeight: "800",
                    }}
                  >
                    {report.title ||
                      report.category ||
                      "Resolved Report"}
                  </h2>

                  <p
                    style={{
                      margin: "8px 0 0",
                      color: "#7A857D",
                      fontSize: "12px",
                    }}
                  >
                    Resident #
                    {String(
                      report.residentNumber || 0
                    ).padStart(4, "0")}
                  </p>
                </div>

                <div
                  style={{
                    background: "#E8F5E9",
                    color: "#2E7D32",
                    padding: "9px 15px",
                    borderRadius: "30px",
                    fontWeight: "750",
                    fontSize: "12px",
                  }}
                >
                  ✓ Resolved
                </div>
              </div>

              {/* CATEGORY */}

              <div style={{ marginTop: "22px" }}>
                <h3
                  style={{
                    color: "#1B5E20",
                    margin: "0 0 9px",
                    fontSize: "15px",
                  }}
                >
                  Category
                </h3>

                <div
                  style={{
                    background: "#F7F9F7",
                    border:
                      "1px solid #E8EDE8",
                    borderRadius: "12px",
                    padding: "14px 16px",
                    color: "#455248",
                    fontSize: "14px",
                  }}
                >
                  {report.category ||
                    "Others"}
                </div>
              </div>

              {/* CONCERN */}

              <div style={{ marginTop: "20px" }}>
                <h3
                  style={{
                    color: "#1B5E20",
                    margin: "0 0 9px",
                    fontSize: "15px",
                  }}
                >
                  Concern
                </h3>

                <div
                  style={{
                    background: "#F7F9F7",
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

              {/* BEFORE / AFTER */}

              {(report.imageURL ||
                report.resolutionImageURL) && (
                <div
                  style={{
                    marginTop: "24px",
                  }}
                >
                  <h3
                    style={{
                      color: "#1B5E20",
                      margin: "0 0 12px",
                      fontSize: "15px",
                    }}
                  >
                    Resolution Evidence
                  </h3>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "18px",
                    }}
                  >
                    {report.imageURL && (
                      <div
                        style={{
                          border:
                            "1px solid #E0E7E1",
                          borderRadius: "15px",
                          padding: "12px",
                          background: "#FAFCFA",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "700",
                            color: "#455248",
                            fontSize: "13px",
                            marginBottom: "9px",
                          }}
                        >
                          Before
                        </div>

                        <img
                          src={report.imageURL}
                          alt="Before"
                          style={{
                            width: "100%",
                            height: "190px",
                            objectFit: "cover",
                            borderRadius: "10px",
                            display: "block",
                          }}
                        />
                      </div>
                    )}

                    {report.resolutionImageURL && (
                      <div
                        style={{
                          border:
                            "1px solid #CDE5D0",
                          borderRadius: "15px",
                          padding: "12px",
                          background: "#F6FBF7",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "700",
                            color: "#2E7D32",
                            fontSize: "13px",
                            marginBottom: "9px",
                          }}
                        >
                          After
                        </div>

                        <img
                          src={
                            report.resolutionImageURL
                          }
                          alt="After"
                          style={{
                            width: "100%",
                            height: "190px",
                            objectFit: "cover",
                            borderRadius: "10px",
                            display: "block",
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ACTION TAKEN */}

              <div style={{ marginTop: "24px" }}>
                <h3
                  style={{
                    color: "#1B5E20",
                    margin: "0 0 9px",
                    fontSize: "15px",
                  }}
                >
                  Action Taken
                </h3>

                <div
                  style={{
                    background: "#F1F8F2",
                    border:
                      "1px solid #CDE5D0",
                    borderRadius: "12px",
                    padding: "17px",
                    color: "#245B2A",
                    lineHeight: "1.7",
                    fontSize: "14px",
                  }}
                >
                  {report.adminSolution ||
                    "No action description provided."}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ==========================
          DELETE MODAL
      ========================== */}

      {showDeleteModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,35,18,0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "32px",
              borderRadius: "20px",
              width: "400px",
              maxWidth: "100%",
              textAlign: "center",
              boxShadow:
                "0 20px 50px rgba(0,0,0,.2)",
            }}
          >
            <div
              style={{
                width: "55px",
                height: "55px",
                borderRadius: "50%",
                background: "#FFF1F0",
                color: "#D32F2F",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 15px",
                fontSize: "25px",
                fontWeight: "800",
              }}
            >
              !
            </div>

            <h2
              style={{
                color: "#C62828",
                margin: "0 0 10px",
              }}
            >
              Delete Report
            </h2>

            <p
              style={{
                color: "#66736A",
                margin: "0 0 25px",
                lineHeight: "1.6",
                fontSize: "14px",
              }}
            >
              Are you sure you want to permanently
              delete this report?
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedReportId(null);
                }}
                style={{
                  padding: "11px 22px",
                  border: "1px solid #D8E0D9",
                  borderRadius: "10px",
                  background: "#fff",
                  color: "#455248",
                  cursor: "pointer",
                  fontWeight: "700",
                }}
              >
                Cancel
              </button>

              <button
                onClick={deleteReport}
                style={{
                  padding: "11px 22px",
                  border: "none",
                  borderRadius: "10px",
                  background: "#D32F2F",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: "700",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================
          SUCCESS MODAL
      ========================== */}

      {showSuccessModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,35,18,0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "35px",
              borderRadius: "20px",
              width: "400px",
              maxWidth: "100%",
              textAlign: "center",
              boxShadow:
                "0 20px 50px rgba(0,0,0,.2)",
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
                fontSize: "32px",
                fontWeight: "800",
              }}
            >
              ✓
            </div>

            <h2
              style={{
                color: "#1B5E20",
                margin: "0 0 10px",
              }}
            >
              Success
            </h2>

            <p
              style={{
                color: "#66736A",
                margin: "0 0 25px",
                lineHeight: "1.6",
                fontSize: "14px",
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
                padding: "11px 30px",
                border: "none",
                borderRadius: "10px",
                background: "#1B5E20",
                color: "#fff",
                cursor: "pointer",
                fontWeight: "700",
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