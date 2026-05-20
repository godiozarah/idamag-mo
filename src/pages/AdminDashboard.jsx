import { useEffect, useState } from "react";

import {
  collection,
  getDocs
} from "firebase/firestore";

import { db } from "../firebase";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

export default function AdminDashboard() {

  const [userCount, setUserCount] =
    useState(0);

  const [postCount, setPostCount] =
    useState(0);

  const [reportData, setReportData] =
    useState([]);

  useEffect(() => {

    const loadDashboard = async () => {

      // USERS
      const usersSnapshot =
        await getDocs(
          collection(db, "users")
        );

      setUserCount(usersSnapshot.size);

      // POSTS
      const postsSnapshot =
        await getDocs(
          collection(db, "posts")
        );

      setPostCount(postsSnapshot.size);

      // REPORTS
      const reportsSnapshot =
        await getDocs(
          collection(db, "reports")
        );

      const reports =
        reportsSnapshot.docs.map(
          (doc) => doc.data()
        );

      // COUNT REPORT CATEGORIES
      const categoryCounts = {};

      reports.forEach((report) => {

        const category =
          report.category || "Others";

        if (!categoryCounts[category]) {
          categoryCounts[category] = 0;
        }

        categoryCounts[category]++;
      });

      // CHART DATA
      const chartData =
        Object.keys(categoryCounts).map(
          (key) => ({
            category: key,
            reports: categoryCounts[key]
          })
        );

      setReportData(chartData);
    };

    loadDashboard();

  }, []);

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
          Admin Dashboard
        </h1>

        <p
          style={{
            color: "#555",
            fontSize: "16px"
          }}
        >
          Barangay Ucab Information System
        </p>

      </div>

      {/* STAT CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "25px",
          marginBottom: "40px"
        }}
      >

        {/* RESIDENTS */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "20px",
            padding: "30px",
            boxShadow:
              "0 8px 20px rgba(0,0,0,0.08)",
            borderLeft:
              "8px solid #2E7D32"
          }}
        >

          <h2
            style={{
              color: "#444",
              fontSize: "18px",
              marginBottom: "15px"
            }}
          >
            Total Residents
          </h2>

          <h1
            style={{
              color: "#1B5E20",
              fontSize: "42px",
              margin: 0
            }}
          >
            {userCount}
          </h1>

        </div>

        {/* POSTS */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "20px",
            padding: "30px",
            boxShadow:
              "0 8px 20px rgba(0,0,0,0.08)",
            borderLeft:
              "8px solid #43A047"
          }}
        >

          <h2
            style={{
              color: "#444",
              fontSize: "18px",
              marginBottom: "15px"
            }}
          >
            Community Posts
          </h2>

          <h1
            style={{
              color: "#1B5E20",
              fontSize: "42px",
              margin: 0
            }}
          >
            {postCount}
          </h1>

        </div>

      </div>

      {/* ANALYTICS */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "25px",
          padding: "30px",
          boxShadow:
            "0 8px 20px rgba(0,0,0,0.08)"
        }}
      >

        <h2
          style={{
            color: "#1B5E20",
            marginBottom: "30px",
            fontSize: "28px"
          }}
        >
          Reports Analytics
        </h2>

        <div
          style={{
            width: "100%",
            height: "400px"
          }}
        >

          <ResponsiveContainer>

            <BarChart
              data={reportData}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="category"
              />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="reports"
                fill="#2E7D32"
                radius={[8, 8, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

    </div>
  );
}