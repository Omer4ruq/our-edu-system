import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { FaMoneyBillWave, FaCalendarAlt } from 'react-icons/fa';
import { primaryColor } from '../../../utilitis/getTheme';
import { FaChartArea } from 'react-icons/fa6';

const IncomeChart = () => {
    // Demo data for last 7 days
    const thisMonth = [
        { day: 'শনি', income: 15000, date: '২৭/০৭' },
        { day: 'রবি', income: 22000, date: '২৮/০৭' },
        { day: 'সোম', income: 18000, date: '২৯/০৭' },
        { day: 'মঙ্গল', income: 25000, date: '৩০/০৭' },
        { day: 'বুধ', income: 19000, date: '৩১/০৭' },
        { day: 'বৃহঃ', income: 23000, date: '০১/০৮' },
        { day: 'শুক্র', income: 28000, date: '০২/০৮' },
        { day: 'শনি', income: 15000, date: '২৭/০৭' },
        { day: 'রবি', income: 22000, date: '২৮/০৭' },
        { day: 'সোম', income: 18000, date: '২৯/০৭' },
        { day: 'মঙ্গল', income: 25000, date: '৩০/০৭' },
        { day: 'বুধ', income: 19000, date: '৩১/০৭' },
        { day: 'বৃহঃ', income: 23000, date: '০১/০৮' },
        { day: 'শুক্র', income: 28000, date: '০২/০৮' },
        { day: 'শনি', income: 15000, date: '২৭/০৭' },
        { day: 'রবি', income: 22000, date: '২৮/০৭' },
        { day: 'সোম', income: 18000, date: '২৯/০৭' },
        { day: 'মঙ্গল', income: 25000, date: '৩০/০৭' },
        { day: 'বুধ', income: 19000, date: '৩১/০৭' },
        { day: 'বৃহঃ', income: 23000, date: '০১/০৮' },
        { day: 'শুক্র', income: 28000, date: '০২/০৮' },
        { day: 'শনি', income: 15000, date: '২৭/০৭' },
        { day: 'রবি', income: 22000, date: '২৮/০৭' },
        { day: 'সোম', income: 18000, date: '২৯/০৭' },
        { day: 'মঙ্গল', income: 25000, date: '৩০/০৭' },
        { day: 'বুধ', income: 19000, date: '৩১/০৭' },
        { day: 'বৃহঃ', income: 23000, date: '০১/০৮' },
        { day: 'শুক্র', income: 28000, date: '০২/০৮' },
    ];

    // Calculate total income
    const totalIncome = 2500000; // Demo total income
    const weeklyIncome = thisMonth.reduce((sum, day) => sum + day.income, 0);
    const dailyAverage = Math.round(weeklyIncome / 30);

    // Convert to Bengali numbers
    const toBengali = (num) => num.toString().replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);

    // Format currency in Bengali
    const formatCurrency = (amount) => {
        if (amount >= 100000) {
            return `${toBengali((amount / 100000).toFixed(1))} লক্ষ`;
        } else if (amount >= 1000) {
            return `${toBengali((amount / 1000).toFixed(0))} হাজার`;
        }
        return toBengali(amount);
    };

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-label">{label}</p>
                    <p className="tooltip-value">
                        আয়: ৳{toBengali(data.value.toLocaleString())}
                    </p>
                    <p className="tooltip-date">
                        তারিখ: {data.payload.date}
                    </p>
                </div>
            );
        }
        return null;
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
                    @keyframes glow {
                        0%, 100% { box-shadow: 0 0 10px ${primaryColor}33; }
                        50% { box-shadow: 0 0 10px ${primaryColor}99; }
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
                    .animate-glow {
                        animation: glow 3s ease-in-out infinite;
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
                    
                    .income-header {
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        padding: 1rem;
                        font-weight: 600;
                        font-size: 14px;
                    }
                    
                    .total-income-section {
                        padding: 1rem;
                        text-align: center;
                        background: ${primaryColor}1A;
                        border: 1px solid ${primaryColor}33;
                        border-radius: 16px;
                        // margin: 0 0 16px 0;
                        position: relative;
                        overflow: hidden;
                    }
                    
                    .total-income-section::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: -100%;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(90deg, transparent, ${primaryColor}1A, transparent);
                        transition: left 0.6s;
                    }
                    
                    .total-income-section:hover::before {
                        left: 100%;
                    }
                    
                    .total-amount {
                        font-size: 2rem;
                        font-weight: bold;
                        color: #441a05;
                        margin: 0.5rem 0;
                        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                    }
                    
                    .total-label {
                        color: ${primaryColor};
                        font-size: 1rem;
                        font-weight: 600;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 0.5rem;
                    }
                    
                    .stats-row {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
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
                    
                    .stat-item:hover {
                        background: rgba(255, 255, 255, 0.08);
                        transform: translateY(-2px);
                    }
                    
                    .stat-value {
                        font-size: 1.125rem;
                        font-weight: bold;
                        color: #441a05;
                        margin-bottom: 0.25rem;
                    }
                    
                    .stat-label {
                        font-size: 0.75rem;
                        color: #441a05;
                        font-weight: 500;
                        opacity: 0.7;
                    }
                    
                    .chart-section {
                        padding: 1rem;
                        background: rgba(255, 255, 255, 0.03);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 12px;
                        margin: 1rem;
                    }
                    
                    .chart-title {
                        color: #441a05;
                        font-size: 0.875rem;
                        font-weight: 600;
                        text-align: center;
                        margin-bottom: 1rem;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 0.5rem;
                    }
                    
                    .custom-tooltip {
                        background: rgba(15, 23, 42, 0.95);
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
                    
                    .tooltip-value, .tooltip-date {
                        color: #441a05;
                        font-size: 0.75rem;
                        margin: 0.125rem 0;
                        opacity: 0.8;
                    }
                    
                    /* Recharts custom styling */
                    .recharts-cartesian-axis-tick-value {
                        fill: #441a05 !important;
                        font-weight: 500;
                        font-size: 11px;
                        opacity: 0.7;
                    }
                    
                    .recharts-cartesian-grid-horizontal line,
                    .recharts-cartesian-grid-vertical line {
                        stroke: rgba(255, 255, 255, 0.1) !important;
                    }
                    
                    .recharts-line {
                        filter: drop-shadow(0 2px 4px ${primaryColor}4D);
                    }
                `}
            </style>

            {/* Header */}
            <div className="income-header">
                <div className="animate-pulse-custom" style={{ color: primaryColor }}>
                    <FaMoneyBillWave />
                </div>
                <h3 className="font-bold" style={{ color: primaryColor }}>আয়ের তথ্য</h3>
            </div>

            {/* Total Income Section */}
            {/* <div className="total-income-section animate-scaleIn animate-glow">
                <div className="total-label">
                    <FaMoneyBillWave />
                    মোট আয়
                </div>
                <div className="total-amount">
                    ৳{formatCurrency(totalIncome)}
                </div>
                <div style={{ color: '#441a05', fontSize: '0.75rem', opacity: 0.7 }}>
                    মোট আয়
                </div>
            </div> */}

            {/* Quick Stats */}
            <div className="stats-row">
                <div className="stat-item animate-slideInLeft" style={{ animationDelay: '0.1s' }}>
                    <div className="stat-value">৳{formatCurrency(weeklyIncome)}</div>
                    <div className="stat-label">মোট মাসিক আয়</div>
                </div>
                <div className="stat-item animate-slideInLeft" style={{ animationDelay: '0.2s' }}>
                    <div className="stat-value">৳{formatCurrency(dailyAverage)}</div>
                    <div className="stat-label">দৈনিক গড়</div>
                </div>
            </div>

            {/* Chart Section */}
            <div className="p-3 pl-0 animate-scaleIn" style={{ animationDelay: '0.3s' }}>
                <h4 className="chart-title">
                    <FaChartArea style={{ color: primaryColor }} />
                    গত মাসের আয়
                </h4>
                <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={thisMonth} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                        <defs>
                            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="day" 
                            tick={{ fill: '#441a05', fontSize: 11, fontWeight: 500, opacity: 0.7 }}
                        />
                        <YAxis 
                            tick={{ fill: '#441a05', fontSize: 10, opacity: 0.7 }}
                            tickFormatter={(value) => `${formatCurrency(value)}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="income"
                            stroke={primaryColor}
                            strokeWidth={3}
                            fill="url(#incomeGradient)"
                            dot={{ fill: primaryColor, strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, fill: primaryColor, stroke: '#441a05', strokeWidth: 2 }}
                            animationBegin={500}
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>

                {/* Chart Footer */}
                <div style={{ 
                    textAlign: 'center', 
                    // marginTop: '1rem', 
                    color: '#441a05', 
                    fontSize: '10px',
                    opacity: 0.7,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                }}>
                    <FaCalendarAlt />
                    <span>গত মাসের আয়ের চার্ট</span>
                </div>
            </div>
        </div>
    );
};

export default IncomeChart;