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
import { FaGraduationCap, FaChartPie, FaUsers } from "react-icons/fa";
import { primaryColor, secondaryColor } from "../../../utilitis/getTheme";

const ClassWiseChart = () => {
  // Demo data for class-wise students
  const classData = [
    { name: "প্রথম শ্রেণী", value: 85, color: primaryColor, shortName: "১ম" },
    { name: "দ্বিতীয় শ্রেণী", value: 92, color: secondaryColor, shortName: "২য়" },
    { name: "তৃতীয় শ্রেণী", value: 78, color: "#ddd", shortName: "৩য়" },
    { name: "চতুর্থ শ্রেণী", value: 95, color: primaryColor, shortName: "৪র্থ" },
    { name: "পঞ্চম শ্রেণী", value: 88, color: secondaryColor, shortName: "৫ম" },
    { name: "ষষ্ঠ শ্রেণী", value: 102, color: "#ddd", shortName: "৬ষ্ঠ" },
    { name: "সপ্তম শ্রেণী", value: 97, color: primaryColor, shortName: "৭ম" },
    { name: "অষ্টম শ্রেণী", value: 89, color: secondaryColor, shortName: "৮ম" },
    { name: "নবম শ্রেণী", value: 104, color: "#ddd", shortName: "৯ম" },
    { name: "দশম শ্রেণী", value: 90, color: primaryColor, shortName: "১০ম" },
  ];

  const totalStudents = classData.reduce((sum, item) => sum + item.value, 0);

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
          <p className="tooltip-value">শিক্ষার্থী: {toBengali(data.value)} জন</p>
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
    payload,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show label if percentage is above 3%
    if (percent < 0.03) return null;

    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="pie-label"
        fontWeight="bold"
        fontSize="10"
      >
        {payload.shortName}
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
                        font-size: 14px;
                    }
                    
                    .chart-title {
                        color: #fff;
                        font-size: 0.875rem;
                        font-weight: 600;
                        text-align: center;
                        // margin-bottom: 0.75rem;
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
                        color: #fff;
                        font-weight: 600;
                        margin-bottom: 0.25rem;
                        font-size: 0.875rem;
                    }
                    
                    .tooltip-value, .tooltip-percentage {
                        color: #fff;
                        font-size: 0.75rem;
                        margin: 0.125rem 0;
                        opacity: 0.8;
                    }
                    
                    .pie-label {
                        filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.8));
                    }
                    
                    .legend-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
                        gap: 0.5rem;
                        margin-top: 1rem;
                        padding: 0 1rem;
                    }
                    
                    .legend-item {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        padding: 0.5rem;
                        background: rgba(255, 255, 255, 0.03);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 8px;
                        transition: all 0.3s ease;
                    }
                    
                    .legend-item:hover {
                        background: rgba(255, 255, 255, 0.08);
                        transform: translateY(-1px);
                    }
                    
                    .legend-color {
                        width: 12px;
                        height: 12px;
                        border-radius: 50%;
                        flex-shrink: 0;
                    }
                    
                    .legend-text {
                        color: #fff;
                        font-size: 0.7rem;
                        font-weight: 500;
                    }
                    
                    .legend-count {
                        color: #fff;
                        font-size: 0.65rem;
                        opacity: 0.8;
                        margin-left: auto;
                    }
                    
                    /* Recharts custom styling */
                    .recharts-cartesian-axis-tick-value {
                        fill: #fff !important;
                        font-weight: 500;
                        font-size: 10px;
                        opacity: 0.7;
                    }
                    
                    .recharts-cartesian-grid-horizontal line,
                    .recharts-cartesian-grid-vertical line {
                        stroke: rgba(255, 255, 255, 0.1) !important;
                    }
                `}
      </style>

      {/* Header - Same style as other components */}
      <div className="chart-header">
        <div className="animate-pulse-custom">
          <FaGraduationCap />
        </div>
        <h3 className="font-bold">শ্রেণী ভিত্তিক শিক্ষার্থী</h3>
      </div>

      {/* Chart Container */}
      <div className="p-5 pb-2 pt-0">
        {/* Pie Chart */}
        <div className="animate-scaleIn" style={{ animationDelay: "0.3s" }}>
          <h4 className="chart-title">
            <FaChartPie className="text-sm" />
            শ্রেণী বিতরণ
          </h4>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie
                data={classData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                innerRadius={40}
                fill="#8884d8"
                dataKey="value"
                animationBegin={500}
                animationDuration={1000}
              >
                {classData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend Grid */}
        {/* <div className="legend-grid">
          {classData.map((item, idx) => (
            <div key={idx} className="legend-item animate-slideInLeft" style={{ animationDelay: `${idx * 0.05}s` }}>
              <span
                className="legend-color"
                style={{ backgroundColor: item.color }}
              ></span>
              <span className="legend-text">{item.shortName}</span>
              <span className="legend-count">{toBengali(item.value)}</span>
            </div>
          ))}
        </div> */}

        {/* Summary */}
        <div className="text-center mt-4">
          <div className="inline-flex items-center gap-2">
            <FaUsers style={{ color: primaryColor }} />
            <span className="text-white font-semibold text-sm">
              মোট: {toBengali(totalStudents)} জন শিক্ষার্থী
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassWiseChart;