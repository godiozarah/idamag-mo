import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LabelList,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [userCount, setUserCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [reportCount, setReportCount] = useState(0);

  const [publishedCount, setPublishedCount] = useState(0);
  const [archivedCount, setArchivedCount] = useState(0);
  const [pinnedCount, setPinnedCount] = useState(0);

  const [reportData, setReportData] = useState([]);
  const [announcementData, setAnnouncementData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  const loadDashboard = async () => {
    try {
      // Users
      const usersSnapshot = await getDocs(collection(db, "users"));
      setUserCount(usersSnapshot.size);

      // Posts
      const postsSnapshot = await getDocs(collection(db, "posts"));
      setPostCount(postsSnapshot.size);

      // Reports
      const reportsSnapshot = await getDocs(collection(db, "reports"));
      setReportCount(reportsSnapshot.size);

      const reports = reportsSnapshot.docs.map((doc) => doc.data());

      // Report Categories
      const categoryCounts = {};

      reports.forEach((report) => {
        const category = report.category || "Others";
        categoryCounts[category] =
          (categoryCounts[category] || 0) + 1;
      });

      setReportData(
        Object.keys(categoryCounts).map((key) => ({
          category: key,
          reports: categoryCounts[key],
        }))
      );

      // Announcements
      const announcementSnapshot = await getDocs(
        collection(db, "announcements")
      );

      const announcements = announcementSnapshot.docs.map((doc) =>
        doc.data()
      );
            const published = announcements.filter(
        (item) => item.status === "Published"
      ).length;

      const archived = announcements.filter(
        (item) => item.status === "Archived"
      ).length;

      const pinned = announcements.filter(
        (item) => item.isPinned === true
      ).length;

      setPublishedCount(published);
      setArchivedCount(archived);
      setPinnedCount(pinned);

      setAnnouncementData([
        {
          name: "Published",
          value: published,
        },
        {
          name: "Archived",
          value: archived,
        },
      ]);

      // Monthly Reports
      const reportMonths = {};

      reports.forEach((report) => {
        if (!report.createdAt) return;

        let date;

        if (report.createdAt.toDate) {
          date = report.createdAt.toDate();
        } else {
          date = new Date(report.createdAt);
        }

        const month = date.toLocaleString("default", {
          month: "short",
        });

        reportMonths[month] =
          (reportMonths[month] || 0) + 1;
      });

      const monthOrder = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const monthlyChart = monthOrder
        .filter((month) => reportMonths[month] !== undefined)
        .map((month) => ({
          month,
          reports: reportMonths[month],
        }));

      setMonthlyData(monthlyChart);

    } catch (error) {
      console.error("Error loading dashboard:", error);
    }
  };
useEffect(() => {
  const fetchDashboard = async () => {
    await loadDashboard();
  };

  fetchDashboard();
}, []);
const exportPDF = () => {
  const doc = new jsPDF();

  // ===== Title =====
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Barangay Ucab Dashboard Report", 14, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(
    `Generated on: ${new Date().toLocaleString()}`,
    14,
    27
  );

  doc.text(
    "iDamag.mo Barangay Information System",
    14,
    34
  );

  // ===== Summary Table =====
  autoTable(doc, {
    startY: 45,
    head: [["Dashboard Statistics", "Value"]],
    body: [
      ["Total Residents", userCount],
      ["Community Posts", postCount],
      ["Total Reports", reportCount],
      ["Published Announcements", publishedCount],
      ["Archived Announcements", archivedCount],
      ["Pinned Announcements", pinnedCount],
    ],
    headStyles: {
      fillColor: [34, 139, 34],
      textColor: 255,
      halign: "center",
    },
    styles: {
      halign: "center",
      fontSize: 11,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  let finalY = doc.lastAutoTable.finalY + 15;

  // ===== Report Categories =====
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("Reports by Category", 14, finalY);

  autoTable(doc, {
    startY: finalY + 5,
    head: [["Category", "Reports"]],
    body: reportData.map((item) => [
      item.category,
      item.reports,
    ]),
    headStyles: {
      fillColor: [25, 118, 210],
      textColor: 255,
    },
  });

  finalY = doc.lastAutoTable.finalY + 15;

  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);

  doc.text(
    "Generated automatically by the iDamag.mo System",
    14,
    finalY
  );

  doc.save("Barangay_Ucab_Dashboard_Report.pdf");
};
const exportExcel = () => {
  const summary = [
    {
      "Dashboard Statistics": "Total Residents",
      Value: userCount,
    },
    {
      "Dashboard Statistics": "Community Posts",
      Value: postCount,
    },
    {
      "Dashboard Statistics": "Total Reports",
      Value: reportCount,
    },
    {
      "Dashboard Statistics": "Published Announcements",
      Value: publishedCount,
    },
    {
      "Dashboard Statistics": "Archived Announcements",
      Value: archivedCount,
    },
    {
      "Dashboard Statistics": "Pinned Announcements",
      Value: pinnedCount,
    },
  ];

  const summarySheet =
    XLSX.utils.json_to_sheet(summary);

  const categorySheet =
    XLSX.utils.json_to_sheet(reportData);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    summarySheet,
    "Dashboard Summary"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    categorySheet,
    "Reports by Category"
  );

  summarySheet["!cols"] = [
    { wch: 35 },
    { wch: 15 },
  ];

  categorySheet["!cols"] = [
    { wch: 30 },
    { wch: 15 },
  ];

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const file = new Blob([excelBuffer], {
    type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
  });

  saveAs(
    file,
    "Barangay_Ucab_Dashboard_Report.xlsx"
  );
};
  return (
        <div className="dashboard">

      {/* HEADER */}
      <div className="dashboard-header">

        <div>
          <h1 className="dashboard-title">
            Admin Dashboard
          </h1>

          <p className="dashboard-subtitle">
            Barangay Ucab Information System
          </p>
        </div>

        <div className="dashboard-date">
          <span>
            {new Date().toLocaleDateString("en-PH", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

      </div>

      {/* STATISTICS */}
      <div className="stats-grid">

        <div className="stat-card residents">
          <div className="stat-info">
            <h4>Total Residents</h4>
            <h2>{userCount}</h2>
          </div>
          <div className="stat-icon">👥</div>
        </div>

        <div className="stat-card posts">
          <div className="stat-info">
            <h4>Community Posts</h4>
            <h2>{postCount}</h2>
          </div>
          <div className="stat-icon">📝</div>
        </div>

        <div className="stat-card reports">
          <div className="stat-info">
            <h4>Total Reports</h4>
            <h2>{reportCount}</h2>
          </div>
          <div className="stat-icon">🚨</div>
        </div>

        <div className="stat-card published">
          <div className="stat-info">
            <h4>Published</h4>
            <h2>{publishedCount}</h2>
          </div>
          <div className="stat-icon">📢</div>
        </div>

        <div className="stat-card archived">
          <div className="stat-info">
            <h4>Archived</h4>
            <h2>{archivedCount}</h2>
          </div>
          <div className="stat-icon">📦</div>
        </div>

        <div className="stat-card pinned">
          <div className="stat-info">
            <h4>Pinned</h4>
            <h2>{pinnedCount}</h2>
          </div>
          <div className="stat-icon">📌</div>
        </div>

      </div>

      {/* REPORT CENTER */}
      <div className="report-center">

        <div>
          <h2>Reports Center</h2>
          <p>
            Generate printable reports and dashboard analytics.
          </p>
        </div>

        <div className="report-buttons">

          <button
  className="pdf-btn"
  onClick={exportPDF}
>
            📄 Export PDF
          </button>

          <button
  className="excel-btn"
  onClick={exportExcel}
>
            📊 Export Excel
          </button>

        </div>

      </div>

      {/* CHARTS */}
      <div className="charts-grid">
                {/* PIE CHART */}
        <div className="chart-card">
          <h3>Published vs Archived Announcements</h3>

          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={announcementData}
                cx="50%"
                cy="50%"
                outerRadius={110}
                dataKey="value"
                nameKey="name"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {announcementData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      entry.name === "Published"
                        ? "#4CAF50"
                        : "#F44336"
                    }
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value) => [
                  `${value} announcements`,
                  "Total",
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* BAR CHART */}
        <div className="chart-card">
          <h3>Reports by Category</h3>

          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={reportData}
              margin={{
                top: 20,
                right: 20,
                left: 0,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="category"
                interval={0}
                angle={-20}
                textAnchor="end"
                height={70}
                tick={{ fontSize: 13 }}
              />

              <YAxis
                allowDecimals={false}
                domain={[0, "dataMax + 1"]}
              />

              <Tooltip />

              <Bar
                dataKey="reports"
                radius={[8, 8, 0, 0]}
              >
                {reportData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={[
                      "#4CAF50",
                      "#2196F3",
                      "#FF9800",
                      "#9C27B0",
                      "#F44336",
                      "#00BCD4",
                      "#795548",
                      "#FFC107",
                    ][index % 8]}
                  />
                ))}

                <LabelList
                  dataKey="reports"
                  position="top"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
                {/* LINE CHART */}
        <div className="chart-card chart-full">
          <h3>Monthly Reports</h3>

          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="month" />

              <YAxis
                allowDecimals={false}
                domain={[0, "dataMax + 1"]}
              />

              <Tooltip />

              <Legend />

              <Line
                type="monotone"
                dataKey="reports"
                stroke="#2E7D32"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}