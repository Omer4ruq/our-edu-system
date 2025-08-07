import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { FaUsers, FaMars, FaVenus, FaChartPie } from "react-icons/fa";
import { primaryColor, secondaryColor } from "../../../utilitis/getTheme";

const StudentGenderChart = () => {
  // Demo data
  const genderData = [
    { name: "ছেলে", value: 450, color: primaryColor, icon: "♂" },
    { name: "মেয়ে", value: 380, color: secondaryColor, icon: "♀" },
  ];

  const totalStudents = genderData.reduce((sum, item) => sum + item.value, 0);

  // Convert to Bengali numbers
  const toBengali = (num) =>
    num.toString().replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / totalStudents) * 100).toFixed(1);
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{data.payload.name}</p>
          <p className="tooltip-value">সংখ্যা: {toBengali(data.value)} জন</p>
          <p className="tooltip-percentage">শতাংশ: {toBengali(percentage)}%</p>
        </div>
      );
    }
    return null;
  };

  // Custom label for pie chart
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#441a05"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="pie-label"
        fontWeight="bold"
        fontSize="12"
      >
        {`${toBengali((percent * 100).toFixed(1))}%`}
      </text>
    );
  };

  return (
    <div className="glass-card bg-white/5 border border-white/10 rounded-2xl relative shadow-xl animate-fadeIn transition-all duration-500">
      <style>
        {`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes scaleIn {
                        from { transform: scale(0.95); opacity: 0; }
                        to { transform: scale(1); opacity: 1; }
                    }
                    @keyframes slideInLeft {
                        from { opacity: 0; transform: translateX(-30px); }
                        to { opacity: 1; transform: translateX(0); }
                    }
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.05); }
                    }
                    
                    .animate-fadeIn {
                        animation: fadeIn 0.6s ease-out forwards;
                    }
                    .animate-scaleIn {
                        animation: scaleIn 0.4s ease-out forwards;
                    }
                    .animate-slideInLeft {
                        animation: slideInLeft 0.6s ease-out forwards;
                    }
                    .animate-pulse-custom {
                        animation: pulse 2s ease-in-out infinite;
                    }
                    
                    .glass-card {
                        backdrop-filter: blur(25px);
                        position: relative;
                        overflow: hidden;
                    }
                    .glass-card::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: -100%;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
                        transition: left 0.8s;
                    }
                    .glass-card:hover::before {
                        left: 100%;
                    }
                    .glass-card:hover {
                        transform: translateY(-5px) scale(1.02);
                    }
                    
                    .chart-header {
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        color: ${primaryColor};
                        padding: 1rem;
                        font-weight: 600;
                        font-size:14px;
                    }
                    
                    .stats-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                        gap: 1rem;
                        padding: 0 1rem;
                        margin-bottom: 1rem;
                    }
                    
                    .stat-item {
                        background: rgba(255, 255, 255, 0.03);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 12px;
                        padding: 0.75rem;
                        text-align: center;
                        transition: all 0.3s ease;
                        position: relative;
                        overflow: hidden;
                    }
                    
                    .stat-item::before {
                        content: '';
                        position: absolute;
                        left: 0;
                        top: 0;
                        bottom: 0;
                        width: 3px;
                        background: ${primaryColor};
                        opacity: 0;
                        transition: opacity 0.3s ease;
                    }
                    
                    .stat-item:hover {
                        background: rgba(255, 255, 255, 0.08);
                        border-color: ${primaryColor};
                        transform: translateX(3px);
                    }
                    
                    .stat-item:hover::before {
                        opacity: 1;
                    }
                    
                    .stat-icon {
                        font-size: 1.5rem;
                        margin-bottom: 0.5rem;
                        color: ${primaryColor};
                    }
                    
                    .stat-number {
                        font-size: 1.25rem;
                        font-weight: bold;
                        color: #441a05;
                        margin-bottom: 0.25rem;
                    }
                    
                    .stat-label {
                        font-size: 0.7rem;
                        color: #94a3b8;
                        font-weight: 500;
                    }
                    
                    .charts-container {
                        padding: 1rem;
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 1rem;
                    }
                    
                    @media (max-width: 768px) {
                        .charts-container {
                            grid-template-columns: 1fr;
                        }
                    }
                    
                    .chart-section {
                        background: rgba(255, 255, 255, 0.03);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 12px;
                        padding: 1rem;
                    }
                    
                    .chart-title {
                        color: #441a05;
                        font-size: 0.875rem;
                        font-weight: 600;
                        text-align: center;
                        margin-bottom: 0.75rem;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 0.5rem;
                    }
                    
                    .custom-tooltip {
                        background: rgba(15, 23, 42, 0.95);
                        border: 1px solid ${primaryColor};
                        border-radius: 8px;
                        padding: 0.75rem;
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                        backdrop-filter: blur(10px);
                    }
                    
                    .tooltip-label {
                        color: #441a05;
                        font-weight: 600;
                        margin-bottom: 0.25rem;
                        font-size: 0.875rem;
                    }
                    
                    .tooltip-value, .tooltip-percentage {
                        color: #94a3b8;
                        font-size: 0.75rem;
                        margin: 0.125rem 0;
                    }
                    
                    .pie-label {
                        filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.8));
                    }
                    
                    /* Recharts custom styling */
                    .recharts-cartesian-axis-tick-value {
                        fill: #94a3b8 !important;
                        font-weight: 500;
                        font-size: 11px;
                    }
                    
                    .recharts-cartesian-grid-horizontal line,
                    .recharts-cartesian-grid-vertical line {
                        stroke: rgba(148, 163, 184, 0.1) !important;
                    }
                `}
      </style>

      {/* Header - Same style as other components */}
      <div className="chart-header">
        <div className="animate-pulse-custom">
          <FaChartPie />
        </div>
        <h3 className="font-bold">শিক্ষার্থীদের লিঙ্গ ভিত্তিক তথ্য</h3>
      </div>

      {/* Charts Container */}
      <div className="p-5 pt-0">
        {/* Pie Chart */}
        <div className="animate-scaleIn" style={{ animationDelay: "0.3s" }}>
          <h4 className="chart-title">
            <FaChartPie className="text-sm" />
            অনুপাত
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={90}
                innerRadius={30}
                fill="#8884d8"
                dataKey="value"
                animationBegin={500}
                animationDuration={1000}
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-4">
          {genderData.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span
                className="inline-block w-4 h-4 rounded-full"
                style={{ backgroundColor: item.color }}
              ></span>
              <span className="text-[#441a05]text-sm font-medium">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentGenderChart;
