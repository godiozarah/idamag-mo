import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import {
  FiEye,
  FiTrash2,
  FiX,
  FiMail,
  FiUser,
  FiHash,
  FiCalendar,
} from "react-icons/fi";
import { db } from "../firebase";

import "./AdminSettings.css";

export default function AdminSettings() {
  const [residents, setResidents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResident, setSelectedResident] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function fetchResidents() {
      try {
        const q = query(
          collection(db, "users"),
          where("role", "==", "resident")
        );

        const snapshot = await getDocs(q);

        const residentList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        residentList.sort(
          (a, b) =>
            (a.residentNumber || 0) -
            (b.residentNumber || 0)
        );

        setResidents(residentList);
      } catch (error) {
        console.error("Error loading residents:", error);
      }
    }

    fetchResidents();
  }, []);

  const filteredResidents = residents.filter((resident) => {
    const residentNo = resident.residentNumber
      ? resident.residentNumber.toString()
      : "";

    return (
      resident.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      residentNo.includes(searchTerm)
    );
  });

  return (
    <div className="settings-container">
      <h1>⚙️ Settings</h1>

      <div className="settings-card">
        <h2>Resident Accounts</h2>

        <div className="search-container">
          <input
            type="text"
            placeholder="🔍 Search by email or resident number..."
            className="search-input"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />
        </div>

        <table className="resident-table">
          <thead>
            <tr>
              <th>Resident No.</th>
              <th>Email</th>
              <th>Role</th>
              <th>Date Registered</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredResidents.length > 0 ? (
              filteredResidents.map((resident) => (
                <tr key={resident.id}>
                  <td>{resident.residentNumber || "N/A"}</td>

                  <td>{resident.email}</td>

                  <td>
                    <span className="role-badge">
                      {resident.role}
                    </span>
                  </td>

                  <td>
                    {resident.createdAt?.toDate
                      ? resident.createdAt
                          .toDate()
                          .toLocaleDateString()
                      : "N/A"}
                  </td>

                  <td className="action-buttons">
                    <button
                      className="view-btn"
                      onClick={() => {
                        setSelectedResident(resident);
                        setShowModal(true);
                      }}
                    >
                      <FiEye />
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        alert(
                          "Delete feature will be added next."
                        )
                      }
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">
                  No resident accounts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && selectedResident && (
        <div
          className="modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="resident-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>👤 Resident Information</h2>

              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              <div className="info-item">
                <FiMail />
                <div>
                  <span>Email</span>
                  <p>{selectedResident.email}</p>
                </div>
              </div>

              <div className="info-item">
                <FiHash />
                <div>
                  <span>Resident Number</span>
                  <p>
                    {selectedResident.residentNumber ||
                      "Not Assigned"}
                  </p>
                </div>
              </div>

              <div className="info-item">
                <FiUser />
                <div>
                  <span>Role</span>
                  <p style={{ textTransform: "capitalize" }}>
                    {selectedResident.role}
                  </p>
                </div>
              </div>

              <div className="info-item">
                <FiCalendar />
                <div>
                  <span>Date Registered</span>
                  <p>
                    {selectedResident.createdAt?.toDate
                      ? selectedResident.createdAt
                          .toDate()
                          .toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="modal-close-button"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}