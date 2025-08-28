import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import "./finalaccount.scss";

const API = process.env.REACT_APP_API || "http://localhost:5000";

const FinalAccount = () => {
  const now = new Date();
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("monthly"); // daily, weekly, monthly, yearly

  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(now.getDate());

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        let url = `${API}/api/finalaccount/${period}`;

        if (period === "monthly") {
          url = `${API}/api/finalaccount/month/${selectedMonth}`;
        } else if (period === "daily") {
          url = `${API}/api/finalaccount/daily/${selectedYear}/${selectedMonth}/${selectedDay}`;
        } else if (period === "yearly") {
          url = `${API}/api/finalaccount/yearly/${selectedYear}`;
        }

        const res = await axios.get(url);
        setSummary(res.data || {});
      } catch (err) {
        console.error("Error fetching final account data:", err);
        alert("Failed to load account summary");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [period, selectedMonth, selectedDay, selectedYear]);

  // Data for cards
  const dataRows = [
    { label: "Total Stock Value", value: summary.totalStockValue },
    { label: "In-Hand Stock Value", value: summary.inStockValue },
    { label: "Stock Income", value: summary.stockIncome },
    { label: "Stock Profit", value: summary.stockProfit },
    { label: "Stock Returns (Cost)", value: summary.stockReturn || 0 },
    { label: "Repairing Income", value: summary.repairIncome },
    { label: "Repairing Return (Cost)", value: summary.repairReturn },
    { label: "Repairing Profit", value: summary.repairProfit },
    { label: "Total Income", value: summary.totalIncome },
    { label: "Total Profit", value: summary.totalProfit },
    { label: "Total Other Cost", value: summary.totalOtherCost },
    { label: "Other Cost This Period", value: summary.otherCostPeriod },
    { label: "Loans (This Period)", value: summary.loans || 0 }, // Loans for this period
  ];

  // Balance Sheet
  const assets = [
    { label: "Cash in Hand", value: summary.cashInHand },
    { label: "Bank Balance", value: summary.bankBalance },
    { label: "Stock Value (In-hand)", value: summary.inStockValue },
  ];

  const liabilities = [
    { label: "Loans", value: summary.loans || 0 }, // Total loans included
    { label: "Pending Supplier Payments", value: summary.pendingPayments || 0 },
    { label: "Other Liabilities", value: summary.otherLiabilities || 0 },
  ];

  const totalAssets = assets.reduce((sum, r) => sum + (Number(r.value) || 0), 0);
  const totalLiabilities = liabilities.reduce((sum, r) => sum + (Number(r.value) || 0), 0);

  return (
    <div className="final-account">
      <Sidebar />
      <div className="account-container">
        <Navbar />
        <h2 className="main-title">💰 Final Account Summary</h2>

        {/* Period Selector */}
        <div className="period-selector">
          <label>View Period: </label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>

          {(period === "daily" || period === "yearly") && (
            <>
              <label style={{ marginLeft: "1rem" }}>Select Year: </label>
              <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </>
          )}

          {(period === "monthly" || period === "daily") && (
            <>
              <label style={{ marginLeft: "1rem" }}>Select Month: </label>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
                {months.map((m, idx) => <option key={idx} value={idx}>{m}</option>)}
              </select>
            </>
          )}

          {period === "daily" && (
            <>
              <label style={{ marginLeft: "1rem" }}>Select Day: </label>
              <select value={selectedDay} onChange={(e) => setSelectedDay(Number(e.target.value))}>
                {days.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </>
          )}
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {/* Income & Profit Summary */}
            <div className="summary-cards">
              {dataRows.map((row, idx) => (
                <div key={idx} className={`card ${
                  row.label.toLowerCase().includes("profit") ||
                  row.label.toLowerCase().includes("returns")
                    ? "profit"
                    : "income"
                }`}>
                  <h4>{row.label}</h4>
                  <p>Rs. {Number(row.value || 0).toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Balance Sheet */}
            <div className="balance-sheet-container">
              <div className="balance-column">
                <h3 className="section-title">Assets</h3>
                <ul>
                  {assets.map((row, idx) => (
                    <li key={idx}>
                      <span>{row.label}</span>
                      <span>Rs. {Number(row.value || 0).toFixed(2)}</span>
                    </li>
                  ))}
                  <li className="total-row">
                    <strong>Total Assets</strong>
                    <strong>Rs. {totalAssets.toFixed(2)}</strong>
                  </li>
                </ul>
              </div>

              <div className="balance-column">
                <h3 className="section-title">Liabilities</h3>
                <ul>
                  {liabilities.map((row, idx) => (
                    <li key={idx}>
                      <span>{row.label}</span>
                      <span>Rs. {Number(row.value || 0).toFixed(2)}</span>
                    </li>
                  ))}
                  <li className="total-row">
                    <strong>Total Liabilities</strong>
                    <strong>Rs. {totalLiabilities.toFixed(2)}</strong>
                  </li>
                </ul>
              </div>
            </div>

            {/* Net Worth */}
            <div className="net-worth-card">
              <h3>Net Worth</h3>
              <p>Rs. {(totalAssets - totalLiabilities).toFixed(2)}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FinalAccount;
