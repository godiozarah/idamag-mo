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
  CartesianGrid
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

      // COUNT CATEGORIES
      const categoryCounts = {};

      reports.forEach((report) => {

        const category =
          report.category;

        if (!categoryCounts[category]) {
          categoryCounts[category] = 0;
        }

        categoryCounts[category]++;
      });

      // CONVERT FOR CHART
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
        padding: "20px",
        fontFamily: "Arial"
      }}
    >

      <h1>📊 Admin Dashboard</h1>

      {/* STATS */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "30px"
        }}
      >

        {/* USERS */}
        <div
          style={{
            border: "1px solid #ccc",
            padding: "20px",
            borderRadius: "10px",
            width: "200px"
          }}
        >

          <h2>👥 Residents</h2>

          <p>{userCount}</p>

        </div>

        {/* POSTS */}
        <div
          style={{
            border: "1px solid #ccc",
            padding: "20px",
            borderRadius: "10px",
            width: "200px"
          }}
        >

          <h2>📝 Posts</h2>

          <p>{postCount}</p>

        </div>

      </div>

      {/* CHART */}
      <h2>🚨 Reports Analytics</h2>

      <BarChart
        width={700}
        height={300}
        data={reportData}
      >

        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="category" />

        <YAxis />

        <Tooltip />

        <Bar
          dataKey="reports"
          fill="#1877f2"
        />

      </BarChart>

    </div>
  );
}