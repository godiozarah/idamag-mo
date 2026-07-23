/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import "./Profile.css";

import { auth, db } from "../firebase";

import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import {
  updatePassword,
  signOut,
} from "firebase/auth";

import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function Profile() {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  // User Information
  const [email, setEmail] = useState("");
  const [residentNumber, setResidentNumber] = useState("");
  const [avatar, setAvatar] = useState("avatar1.png");
  const [notifications, setNotifications] = useState(true);
  const [joinedDate, setJoinedDate] = useState("");

  // Password
  const [newPassword, setNewPassword] = useState("");

  // Report Statistics
  const [totalReports, setTotalReports] = useState(0);
  const [pendingReports, setPendingReports] = useState(0);
  const [progressReports, setProgressReports] = useState(0);
  const [resolvedReports, setResolvedReports] = useState(0);
   const loadProfile = useCallback(async () => {
  try {
    const user = auth.currentUser;

    if (!user) {
      navigate("/login");
      return;
    }

    // ==========================
    // Load User Information
    // ==========================
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    console.log("User Data:", userSnap.data());
    console.log("Resident Number:", userSnap.data().residentNumber);

    if (userSnap.exists()) {
      const data = userSnap.data();
      console.log("User Data:", data);
      console.log("Resident Number from Firestore:", data.residentNumber);

      setEmail(data.email || "");
      setResidentNumber(data.residentNumber || "");
      console.log("State value being set:", data.residentNumber);
      setAvatar(data.avatar || "avatar1.png");
      setNotifications(data.notifications ?? true);

      if (data.createdAt?.toDate) {
        setJoinedDate(
          data.createdAt.toDate().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        );
      }
    }

    // ==========================
    // Load Report Statistics
    // ==========================
    const reportsRef = collection(db, "reports");

    const reportQuery = query(
      reportsRef,
      where("userId", "==", user.uid)
    );

    const reportSnap = await getDocs(reportQuery);

    let total = 0;
    let pending = 0;
    let progress = 0;
    let resolved = 0;

    reportSnap.forEach((report) => {
      total++;

      switch (report.data().status) {
        case "Pending":
          pending++;
          break;

        case "In Progress":
          progress++;
          break;

        case "Resolved":
          resolved++;
          break;

        default:
          break;
      }
    });

    setTotalReports(total);
    setPendingReports(pending);
    setProgressReports(progress);
    setResolvedReports(resolved);

  } catch (error) {
    console.error(error);

    Swal.fire({
      icon: "error",
      title: "Unable to load profile.",
      text: error.message,
    });

  } finally {
    setLoading(false);
  }

}, [navigate]);

useEffect(() => {
  loadProfile();
}, [loadProfile]);
  async function saveAvatar(selectedAvatar) {

    try {

      await updateDoc(
        doc(db, "users", auth.currentUser.uid),
        {
          avatar: selectedAvatar,
        }
      );

      setAvatar(selectedAvatar);

      Swal.fire({
        icon: "success",
        title: "Avatar Updated!",
        timer: 1500,
        showConfirmButton: false,
      });

    } catch (error) {

      Swal.fire({
        icon: "error",
        title: "Failed to update avatar",
        text: error.message,
      });

    }

  }

  async function toggleNotifications() {

    try {

      const newValue = !notifications;

      await updateDoc(
        doc(db, "users", auth.currentUser.uid),
        {
          notifications: newValue,
        }
      );

      setNotifications(newValue);

      Swal.fire({
        icon: "success",
        title: "Notification preference updated.",
        timer: 1200,
        showConfirmButton: false,
      });

    } catch (error) {

      Swal.fire({
        icon: "error",
        title: "Unable to update notifications.",
        text: error.message,
      });

    }

  }

  async function changePassword() {

    if (newPassword.trim().length < 6) {

      return Swal.fire({
        icon: "warning",
        title: "Password must be at least 6 characters.",
      });

    }

    try {

      await updatePassword(
        auth.currentUser,
        newPassword
      );

      setNewPassword("");

      Swal.fire({
        icon: "success",
        title: "Password updated successfully!",
      });

    } catch (error) {

      Swal.fire({
        icon: "error",
        title: "Unable to update password.",
        text: error.message,
      });

    }

  }

  async function logout() {

    const result = await Swal.fire({
      title: "Logout",
      text: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#198754",
      cancelButtonColor: "#dc3545",
      confirmButtonText: "Logout",
    });

    if (!result.isConfirmed) return;

    await signOut(auth);

    navigate("/login", {
      replace: true,
    });

  }
    if (loading) {
    return (
      <div className="container py-5 text-center">
        <div
          className="spinner-border text-success"
          role="status"
        >
          <span className="visually-hidden">
            Loading...
          </span>
        </div>

        <h4 className="mt-3">
          Loading your profile...
        </h4>
      </div>
    );
  }
console.log("residentNumber state:", residentNumber);
  return (
    <div className="container py-5">

      <div className="row justify-content-center">

        <div className="col-lg-10">

          <div className="card profile-card shadow-lg border-0">

            <div className="card-body p-5">

              {/* Profile Header */}

              <div className="text-center">

                <img
                  src={`/${avatar}`}
                  alt="Avatar"
                  className="profile-avatar mb-3"
                />

<h2 className="fw-bold text-success">
  Resident #{String(residentNumber || "").padStart(4, "0")}
</h2>
                <span className="badge bg-success px-3 py-2">
                  Resident
                </span>

                <p className="text-muted mt-3">
                  Your identity remains anonymous when submitting reports.
                </p>

              </div>

              <hr className="my-5" />

              {/* Information Cards */}

              <div className="row g-4">

                <div className="col-md-6">

                  <div className="card h-100 info-card">

                    <div className="card-body">

                      <h5 className="text-success fw-bold mb-3">
                        Personal Information
                      </h5>

                      <p>
                        <strong>Email</strong>
                        <br />
                        {email}
                      </p>

                      <p>
                        <strong>Member Since</strong>
                        <br />
                        {joinedDate || "N/A"}
                      </p>

                      <p className="mb-0">
                        <strong>Resident Number</strong>
                        <br />
                    Resident #{residentNumber}
                      </p>

                    </div>

                  </div>

                </div>

                <div className="col-md-6">

                  <div className="card h-100 info-card">

                    <div className="card-body">

                      <h5 className="text-success fw-bold mb-3">
                        Notifications
                      </h5>

                      <div className="form-check form-switch fs-5">

                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={notifications}
                          onChange={toggleNotifications}
                        />

                        <label className="form-check-label">
                          Receive Barangay Notifications
                        </label>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

              <hr className="my-5" />
                            {/* Report Statistics */}

              <h3 className="text-success fw-bold text-center mb-4">
                My Report Activity
              </h3>

              <div className="row g-4">

                <div className="col-md-3">

                  <div className="card bg-success text-white text-center shadow-sm">

                    <div className="card-body">

                      <h6>Total Reports</h6>

                      <h2 className="fw-bold">
                        {totalReports}
                      </h2>

                    </div>

                  </div>

                </div>

                <div className="col-md-3">

                  <div className="card bg-warning text-dark text-center shadow-sm">

                    <div className="card-body">

                      <h6>Pending</h6>

                      <h2 className="fw-bold">
                        {pendingReports}
                      </h2>

                    </div>

                  </div>

                </div>

                <div className="col-md-3">

                  <div className="card bg-info text-white text-center shadow-sm">

                    <div className="card-body">

                      <h6>In Progress</h6>

                      <h2 className="fw-bold">
                        {progressReports}
                      </h2>

                    </div>

                  </div>

                </div>

                <div className="col-md-3">

                  <div className="card bg-primary text-white text-center shadow-sm">

                    <div className="card-body">

                      <h6>Resolved</h6>

                      <h2 className="fw-bold">
                        {resolvedReports}
                      </h2>

                    </div>

                  </div>

                </div>

              </div>

              <hr className="my-5" />

              {/* Avatar Selection */}

              <h3 className="text-success fw-bold mb-4">
                Choose Your Avatar
              </h3>

              <div className="d-flex flex-wrap justify-content-center gap-3">

                {[
                  "avatar1.png",
                  "avatar2.png",
                  "avatar3.png",
                  "avatar4.png",
                ].map((item) => (

                  <button
                    key={item}
                    type="button"
                    onClick={() => saveAvatar(item)}
                    className={`btn p-1 rounded-circle ${
  avatar === item
    ? "border-4 border-success"
    : "border"
}`}
                  >

                    <img
                      src={`/${item}`}
                      alt={item}
                      className="rounded-circle"
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                      }}
                    />

                  </button>

                ))}

              </div>

              <hr className="my-5" />
                            {/* Change Password */}

              <h3 className="text-success fw-bold mb-4">
                Change Password
              </h3>

              <div className="row g-3">

                <div className="col-md-8">

                  <input
                    type="password"
                    className="form-control form-control-lg"
                    placeholder="Enter New Password"
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(e.target.value)
                    }
                  />

                </div>

                <div className="col-md-4">

                  <button
                    className="btn btn-success btn-lg w-100"
                    onClick={changePassword}
                  >
                    Update Password
                  </button>

                </div>

              </div>

              <hr className="my-5" />

              {/* Logout */}

              <div className="text-center">

                <button
                  className="btn btn-danger btn-lg px-5"
                  onClick={logout}
                >
                  Logout
                </button>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );

}