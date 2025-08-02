import { Navigate, useNavigate } from "react-router-dom";
import AttendanceInfo from "./mainComponents/AttendanceInfo";
import ClassRoutine from "./mainComponents/ClassRoutine";
import Events from "./mainComponents/Events";
import ExpenseInfo from "./mainComponents/ExpenseInfo";
import FeeInfo from "./mainComponents/FeeInfo";
import FundInfo from "./mainComponents/FundInfo";
import GenderWise from "./mainComponents/GenderWise";
import LeaveAndSmsInfo from "./mainComponents/LeaveAndSmsInfo";
import Notices from "./mainComponents/Notices";
import Overview from "./mainComponents/Overview";
import PaymentStat from "./mainComponents/PaymentStat";
import ProfileInfo from "./mainComponents/ProfileInfo";
import SearchPayslip from "./mainComponents/SearchPayslip";
import SupportToken from "./mainComponents/SupportToken";
import SclCalender from "./mainComponents/SclCalender";
import StudentGenderChart from "./mainComponents/StudentGenderChart";
import IncomeChart from "./mainComponents/IncomeChart";
import { FaMoneyBillWave } from "react-icons/fa";
import ExpenseChart from "./mainComponents/ExpenseChart";
import ClassWiseChart from "./mainComponents/ClassWiseChart";

export default function Home() {
  const totalIncome = 2500000;
  const totalExpense = 123000;

  const toBengali = (num) =>
    num.toString().replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);

  const formatCurrency = (amount) => {
    if (amount >= 100000) {
      return `${toBengali((amount / 100000).toFixed(1))} লক্ষ`;
    } else if (amount >= 1000) {
      return `${toBengali((amount / 1000).toFixed(0))} হাজার`;
    }
    return toBengali(amount);
  };

  return (
    <div className="space-y-5 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Overview />
        </div>
        <div className="">
          <ProfileInfo />
        </div>
        {/* <SclCalender></SclCalender> */}
        <div className="">
          <Notices />
        </div>
        <div>
          <div>
            <div className="total-income-section animate-scaleIn animate-glow mb-3">
              <div className="total-label">
                <FaMoneyBillWave />
                মোট আয়
              </div>
              <div className="total-amount">৳{formatCurrency(totalIncome)}</div>
              <div style={{ color: "#fff", fontSize: "0.75rem", opacity: 0.7 }}>
                মোট আয়
              </div>
            </div>
          </div>
          <div>
            <StudentGenderChart></StudentGenderChart>
          </div>
        </div>
        <div className="col-span-2">
          <IncomeChart></IncomeChart>
        </div>
        <div className="col-span-2">
          <ExpenseChart></ExpenseChart>
        </div>
        <div className="row-span-2">
          <div>
            <div className="total-income-section animate-scaleIn animate-glow mb-3">
              <div className="total-label">
                <FaMoneyBillWave />
                মোট খরচ
              </div>
              <div className="total-amount">৳{formatCurrency(totalExpense)}</div>
              <div style={{ color: "#fff", fontSize: "0.75rem", opacity: 0.7 }}>
                মোট খরচ
              </div>
            </div>
          </div>
          <div>
            <ClassWiseChart></ClassWiseChart>
          </div>
        </div>
        
      </div>
      {/* profile info, attendace info, notices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* <StudentGenderChart></StudentGenderChart> */}
        {/* <AttendanceInfo /> */}
      </div>

      {/* Fees Info and Payment Statistics */}
      {/* <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <FeeInfo />
        <PaymentStat />
      </div> */}

      {/* Leave Info and SMS Info */}
      {/* <LeaveAndSmsInfo /> */}

      {/* payslip and routine */}
      {/* <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <SearchPayslip />
        <ClassRoutine />
      </div> */}

      {/* Events and gender wise teacher and student info */}
      {/* <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Events />
        <GenderWise />
      </div>

      {/* expense nad fund info */}
      {/* <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <ExpenseInfo />
        <FundInfo />
      </div> */}

      {/* support token and ads */}
      {/* <SupportToken /> */}
    </div>
  );
}
