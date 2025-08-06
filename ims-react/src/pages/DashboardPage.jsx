import React, { useEffect, useState } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const DashboardPage = () => {
  const [message, setMessage] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedData, setSelectedData] = useState("amount");
  const [transactionData, setTransactionData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const transactionResponse = await ApiService.getAllTransactions();
        if (transactionResponse.status === 200) {
          setTransactionData(
            transformTransactionData(
              transactionResponse.transactions,
              selectedMonth,
              selectedYear
            )
          );
        }
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Error fetching transactions: " + error
        );
      }
    };
    fetchData();
  }, [selectedMonth, selectedYear, selectedData]);

  const transformTransactionData = (transactions, month, year) => {
    const dailyData = {};
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      dailyData[day] = {
        day,
        count: 0,
        quantity: 0,
        amount: 0,
      };
    }

    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.createdAt);
      const transactionMonth = transactionDate.getMonth() + 1;
      const transactionYear = transactionDate.getFullYear();

      if (transactionMonth === month && transactionYear === year) {
        const day = transactionDate.getDate();
        dailyData[day].count += 1;
        dailyData[day].quantity += Number(transaction.totalProducts) || 0;
        dailyData[day].amount += Number(transaction.totalPrice) || 0;
      }
    });

    return Object.values(dailyData).sort((a, b) => a.day - b.day);
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(parseInt(e.target.value, 10));
  };

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value, 10));
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  const formatCurrency = (value) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value}`;
  };

  return (
    <Layout>
      {message && <div className="message">{message}</div>}
      <div className="dashboard-page">
        <div className="button-group">
          <button onClick={() => setSelectedData("count")}>
            Total No Of Transactions
          </button>
          <button onClick={() => setSelectedData("quantity")}>
            Product Quantity
          </button>
          <button onClick={() => setSelectedData("amount")}>Amount</button>
        </div>

        <div className="dashboard-content">
          <div className="filter-section">
            <label htmlFor="month-select">Select Month:</label>
            <select id="month-select" value={selectedMonth} onChange={handleMonthChange}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>

            <label htmlFor="year-select">Select Year:</label>
            <select id="year-select" value={selectedYear} onChange={handleYearChange}>
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Chart Section */}
          <div className="chart-section">
            <div className="chart-container">
              <h3>Daily Transactions</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={transactionData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="day"
                    label={{ value: "Day", position: "insideBottomRight", offset: -5 }}
                    tick={{ fontSize: 12 }}
                    padding={{ left: 10, right: 10 }}
                    interval={0}
                    minTickGap={5}
                  />
                  <YAxis
                    tickFormatter={(value) =>
                      selectedData === "amount" ? formatCurrency(value) : value
                    }
                  />
                  <Tooltip
                    formatter={(value, name) =>
                      name === "amount"
                        ? [formatCurrency(value), "Amount"]
                        : [value, name === "count" ? "Transactions" : "Quantity"]
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey={selectedData}
                    stroke="#008080"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
