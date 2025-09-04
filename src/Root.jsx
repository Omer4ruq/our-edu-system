import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import App from "./App";
import LeaveType from "./components/attendance/leave-type/LeaveType";
import Home from "./components/homePage/Home";
import EditInstituteInfo from "./components/instituteProfile/EditInstituteInfo";
import InstituteProfile from "./components/instituteProfile/InstituteProfile";
import Dummy from "./components/to-be-deleted (trash templates)/Dummy";
import ClassManagement from "./components/ClassManagement/ClassManagement";
import AddSection from "./components/ClassManagement/AddSection";
import AddClass from "./components/ClassManagement/AddClass";
import AddShift from "./components/ClassManagement/AddShift";
import AddClassConfig from "./components/ClassManagement/AddClassConfig.jsx";
import AddBehaviorType from "./components/behavior/AddBehaviorType";
import AddBehaviorMarks from "./components/behavior/AddBehaviorMarks";
import CleanReport from "./components/clean/CleanReport";
import AddExamTypes from "./components/exam/examType/AddExamTypes";
import AddMealsType from "./components/meals/AddMealsType";
import AddLeaveType from "./components/leave/AddLeaveType";
import AddLeaveRequest from "./components/leave/AddLeaveRequest";
import PerformanceType from "./components/performance/PerformanceType";
import TeacherPerformance from "./components/performance/TeacherPerformance";
import StaffRegistrationForm from "./components/users/staff-register/StaffRegistrationForm";
import StudentRegistrationForm from "./components/users/student-register/StudentRegistrationForm";
import AddFundsType from "./components/funds/AddFundsType";
import IncomeHead from "./components/income/IncomeHead";
import AddWaivers from "./components/waivers/AddWaivers";
import AddFeeHead from "./components/fees/AddFeeHead";
import IncomeItems from "./components/income/IncomeItems";
import ExpenseHead from "./components/expense/ExpenseHead";
import ExpenseItems from "./components/expense/ExpenseItems";
import StudentList from "./components/users/student-list/StudentList";
import StaffList from "./components/users/staff-list/StaffList";
import AddFeePackages from "./components/fees/AddFeePackages";
import AddFeesName from "./components/fees/AddFeesName";
import CurrentFees from "./components/fees/CurrentFees";
import DeleteStudentFees from "./components/fees/DeleteStudentFees";
import StudentAttendance from "./components/student-attendance/StudentAttendance";
import PreviousFees from "./components/fees/PreviousFees";
import MealItems from "./components/meals/MealItems";
import MealSetup from "./components/meals/MealSetup";
import MealStatus from "./components/meals/MealStatus";
import ClassSubject from "./components/SubjectManagement/ClassSubject";
import SentSms from "./components/Communication2/General-SMS/SendSms";
import SmsTemplate from "./components/Communication2/General-SMS/SmsTemplate";
import SentNotificationSMS from "./components/Communication2/Notification-SMS/SentNotificationSMS";
import SmsNotificationTemplate from "./components/Communication2/Notification-SMS/SmsNotificationTemplate";
import SubjectMarkConfigs from "./components/marks/SubjectMarkConfigs";
import SubjectMarks from "./components/marks/SubjectMarks";
import AttendanceSheet from "./components/layout/AttendanceSheet";
import ClassPeriodSetup from "./components/periods/ClassPeriodSetup";
import AdmitCard from "./components/admit-card/AdmitCard";
import SeatPlan from "./components/seat-plan/SeatPlan";
import TeacherSubjectAssign from "./components/teachers/TeacherSubjectAssign";
import SignatureSheet from "./components/signature-sheet/SignatureSheet";
import Event from "./components/event/Event";
import AddEvent from "./components/event/AddEvent";
import { ClassRoutine } from "./components/routine/routine-index";
import ExamRoutine from "./components/routine/exam-routine/ExamRoutine";
import BoardingFees from "./components/fees/BoardingFees";
import FeeSummary from "./components/fees/FeeSummary";
import RolePermissions from "./components/permission/RolePermissions";
import CleanType from "./components/clean/CleanType";
import ExpenseItemsList from "./components/expense/ExpenseItemsList";
import Login from "./components/Login/Login";
import IncomeItemsList from "./components/income/IncomeItemsList";
import AddRoleTypes from "./components/Roles/AddRoleTypes";
import Testimonial from "./components/testimonial/Testimonial";
import ResultSheet from "./components/results/ResultSheet";
import MarkSheet from "./components/results/MarkSheet";
import PersonalMarkSheet from "./components/results/PersonalMarkSheet";
import MeritList from "./components/results/MeritList";
import ResultConfig from "./components/results/ResultConfig";
import MutalayaReport from "./components/layout/MutalayaReport";
import PrivateRoute from "./PrivateRoute";
import { SuperAdminRoute } from "./SuperAdminRoute";
import UserProfile from "./components/user-profile/UserProfile";
import AddNotice from "./components/notice/AddNotice";

import HostelPackages from "./components/hostel/HostelPackages";
import HostelRooms from "./components/hostel/HostelRooms";
import HostelAllocation from "./components/hostel/HostelAllocation";
import HostelNames from "./components/hostel/HostelNames";
import CoachingBatches from "./components/coaching/CoachingBatches";

import CoachingPackages from "./components/coaching/CoachingPackages";
import CoachingAllocation from "./components/coaching/CoachingAllocation";
import TransportPackages from "./components/services/transport/TransportPackages";
import TransportRoutes from "./components/services/transport/TransportRoutes";
import TransportAllocation from "./components/services/transport/TransportAllocation";
import ServiceFees from "./components/fees/serviceFees/ServiceFees";
import AddAddition from "./components/payroll/addition/AddAddition";
import AddDeduction from "./components/payroll/deduction/AddDeduction";
import EmployeesAdditions from "./components/payroll/addition/EmployeesAdditions";
import EmployeesDeductions from "./components/payroll/deduction/EmployeesDeductions";
import SalaryIncrements from "./components/payroll/salary-assign/SalaryIncrements";
import BasicSalary from "./components/payroll/salary-assign/BasicSalary";
import LedgerCreate from "./components/accounts/ledger-create/LedgerCreate";
import Payment from "./components/accounts/transaction/payment/Payment";
import Receive from "./components/accounts/transaction/recieve-transaction/Receive";
import Contra from "./components/accounts/transaction/contra/Contra";
import Journal from "./components/accounts/transaction/journal/Journals";
import SalaryAllocation from "./components/payroll/salary-assign/SalaryAllocation";
import SalaryProcess from "./components/payroll/salary-assign/SalaryProcess";
import ClassGroup from "./components/ClassManagement/ClassGroup";
import ClassGroupConfig from "./components/ClassManagement/ClassGroupConfig";
import AddSubjects from "./components/SubjectManagement/AddSubjects";
import SubjectAssign from "./components/SubjectManagement/SubjectAssign";
import AddMarksType from "./components/marks/AddMarksType";
import SetExamSchedules from "./components/exam/examType/SetExamSchedules";
import LayoutModel from "./components/layout/LayoutModel";
import AddLayoutName from "./components/layout/AddLayoutName";
import { BalanceSheet, CashSummary, IncomeStatement, LedgerSummary, TrialBalance, UserTransaction } from "./components/accounts/accounts-index";
import CashBankBook from "./components/accounts/CashBankBook";
import AccountStatement from "./components/accounts/AccountStatement";


function Root() {
  const router = createBrowserRouter([
    {
      path: "login",
      element: <Login />,
    },
    {
      element: <PrivateRoute />,
      children: [
        {
          path: "/profile",
          element: <UserProfile />,
        },
        {
          path: "/",
          element: <App />,
          errorElement: <Dummy />,
          children: [
            {
              path: "/",
              element: <Navigate to="/login" replace />,
            },

            {
              path: "dashboard",
              element: <Home />,
            },
            {
              path: "institute-profile",
              element: <InstituteProfile />,
            },
            {
              path: "institute-profile/edit-info",
              element: <EditInstituteInfo />,
            },
            {
              path: "darul-iqam",
              children: [
                {
                  path: "settings",
                  children: [
                    {
                      index: true,
                      element: <AddBehaviorType />,
                    },
                    {
                      path: "leave-type",
                      element: <AddLeaveType />,
                    },

                    {
                      path: "performance-type",
                      element: <PerformanceType />,
                    },
                    {
                      path: "clean-type",
                      element: <CleanType />,
                    },
                  ],
                },
                {
                  path: "behavior-marks",
                  element: <AddBehaviorMarks />,
                },
                {
                  path: "clean-report",
                  element: <CleanReport />,
                },
                {
                  path: "leave-request",
                  element: <AddLeaveRequest />,
                },
                {
                  path: "teacher-performance",
                  element: <TeacherPerformance></TeacherPerformance>,
                },
              ],
            },
            {
              path: "talimat",
              children: [
                {
                  path: "settings",
                  element: <ClassManagement />,
                  children: [
                    {
                      index: true,
                      element: <AddClass />,
                    },
                    {
                      path: "add-section",
                      element: <AddSection />,
                    },
                    {
                      path: "add-shift",
                      element: <AddShift />,
                    },
                    {
                      path: "add-group",
                      element: <ClassGroup />,
                    },
                       {
                      path: "group-config",
                      element: <ClassGroupConfig />,
                    },
                          {
                      path: "add-config",
                      element: <AddClassConfig />,
                    },
                    {
                      path: "exam-type",
                      element: <AddExamTypes />,
                    },
                       {
                      path: "exam-config",
                      element: <SetExamSchedules />,
                    },
                    {
                      path: "event-type",
                      element: <AddEvent />,
                    },
                    {
                      path: "result-config",
                      element: <ResultConfig></ResultConfig>,
                    },
                      {
                      path: "add-markstype",
                      element: <AddMarksType></AddMarksType>,
                    },
                       {
                      path: "add-layout",
                      element: <AddLayoutName></AddLayoutName>,
                    },
                  ],
                },
                {
                  path: "subject-settings",
                  // element: <AddSubjects/>,
                  children: [
                    {
                      path: "class-subject",
                      element: <SubjectAssign />,
                    },
                       {
                      path: "add-subject",
                      element: <AddSubjects/>,
                    },
                       {
                      path: "teacher-subject-assign",
                      element: <TeacherSubjectAssign/>,
                    },
                      
                  ],
                },
                {
                  path: "marks-config",
                  children: [
                    {
                      index: true,
                      element: <SubjectMarkConfigs />,
                    },
                  ],
                },
                {
                  path: "admit-card",
                  element: <AdmitCard></AdmitCard>,
                },
                {
                  path: "seat-plan",
                  element: <SeatPlan></SeatPlan>,
                },
                {
                  path: "marks-given",
                  children: [
                    {
                      index: true,
                      element: <SubjectMarks />,
                    },
                  ],
                },
                {
                  path: "periods",
                  children: [
                    {
                      index: true,
                      element: <ClassPeriodSetup />,
                    },
                  ],
                },
                {
                  path: "teacher-subject-assign",
                  children: [
                    {
                      index: true,
                      element: <TeacherSubjectAssign />,
                    },
                  ],
                },
                {
                  path: "signature-sheet",
                  element: <SignatureSheet></SignatureSheet>,
                },
                {
                  path: "event",
                  element: <Event></Event>,
                },
                {
                  path: "notice",
                  element: <AddNotice />,
                },
                {
                  path: "routine",
                  element: <ClassRoutine></ClassRoutine>,
                },
                {
                  path: "exam-routine",
                  element: <ExamRoutine></ExamRoutine>,
                },
                {
                  path: "student-attendance",
                  element: <StudentAttendance></StudentAttendance>,
                },
                {
                  path: "testimonial",
                  element: <Testimonial></Testimonial>,
                },
                {
                  path: "result",
                  children: [
                    {
                      index: true,
                      element: <ResultSheet />,
                    },
                    {
                      path: "mark-sheet",
                      element: <MarkSheet></MarkSheet>,
                    },
                    {
                      path: "personal-mark-sheet",
                      element: <PersonalMarkSheet></PersonalMarkSheet>,
                    },
                    {
                      path: "merit-list",
                      element: <MeritList></MeritList>,
                    },
                  ],
                },
                  {
                  path: "layout-model",
                  element: <LayoutModel></LayoutModel>,
                },
              ],
            },
            {
              path: "accounts",
              children: [
                {
                  path: "settings",
                  children: [
                    {
                      index: true,
                      element: <AddFundsType />,
                    },
                    {
                      path: "income-heads",
                      element: <IncomeHead></IncomeHead>,
                    },
                    {
                      path: "expense-heads",
                      element: <ExpenseHead />,
                    },
                    {
                      path: "fee-heads",
                      element: <AddFeeHead />,
                    },
                  ],
                },
                {
                  path: "waivers",
                  element: <AddWaivers></AddWaivers>,
                },
                {
                  path: "income-list",
                  element: <IncomeItems />,
                },

                {
                  path: "expense-list",
                  element: <ExpenseItems />,
                },
                {
                  path: "fee-packages",
                  element: <AddFeePackages />,
                },
                {
                  path: "fee-name",
                  element: <AddFeesName />,
                },
                {
                  path: "fee-summary",
                  element: <FeeSummary></FeeSummary>,
                },
                // {
                //   path: "previous-fee",
                //   element: <PreviousFees />,
                // },
                {
                  path: "delete-fee",
                  element: <DeleteStudentFees />,
                },
                // {
                //   path: "boarding-fee",
                //   element: <BoardingFees />,
                // },
                {
                  path: "expense-items-list",
                  element: <ExpenseItemsList />,
                },
                {
                  path: "service-fees",
                  element: <ServiceFees />,
                },
                {
                  path: "income-items-list",
                  element: <IncomeItemsList />,
                },
              ],
            },
            {
              path: "boarding",
              children: [
                {
                  path: "settings",
                  children: [
                    {
                      index: true,
                      element: <AddMealsType />,
                    },
                    // {
                    //   path: "meal-type",
                    //   element: <AddMealsType />,
                    // },
                    {
                      path: "meal-items",
                      element: <MealItems />,
                    },
                    {
                      path: "meal-setup",
                      element: <MealSetup />,
                    },
                  ],
                },
                {
                  path: "meal-status",
                  element: <MealStatus />,
                },
                {
                  path: "boarding-fee",
                  element: <BoardingFees />,
                },
              ],
            },
            {
              path: "users",
              children: [
                {
                  path: "student",
                  children: [
                    {
                      index: true,
                      element: <StudentRegistrationForm />,
                    },
                    {
                      path: "student-list",
                      element: <StudentList />,
                    },
                  ],
                },
                {
                  path: "staff",
                  children: [
                    {
                      index: true,
                      element: <StaffRegistrationForm />,
                    },
                    {
                      path: "staff-list",
                      element: <StaffList />,
                    },
                  ],
                },
                {
                  path: "role-permission",
                  element: (
                    <SuperAdminRoute>
                      <RolePermissions />
                    </SuperAdminRoute>
                  ),
                },
                {
                  path: "role-types",
                  element: (
                    <SuperAdminRoute>
                      <AddRoleTypes />
                    </SuperAdminRoute>
                  ),
                },
              ],
            },
            {
              path: "communication",
              children: [
                {
                  path: "general-sms",
                  children: [
                    {
                      index: true,
                      element: <SentSms />,
                    },
                    {
                      path: "sms-template",
                      element: <SmsTemplate />,
                    },
                  ],
                },
                {
                  path: "notification-sms",
                  children: [
                    {
                      index: true,
                      // element: <SentNotificationSMS />,
                      element: <SentSms />,
                    },
                    {
                      path: "sms-notification-template",
                      // element: <SmsNotificationTemplate />,
                      element: <SmsTemplate />,
                    },
                  ],
                },
              ],
            },
            {
              path: "layout",
              children: [
                {
                  path: "attendance-sheet",
                  element: <AttendanceSheet />,
                },
                {
                  path: "mutalaya-report",
                  element: <MutalayaReport></MutalayaReport>,
                },
              ],
            },
            {
              path: "services",
              children: [
                {
                  path: "settings",
                  children: [
                    {
                      index:true,
                      element: <HostelPackages></HostelPackages>,
                    },
                    {
                      path: "hostel-room",
                      element: <HostelRooms></HostelRooms>,
                    },
                    {
                      path: "hostel-name",
                      element: <HostelNames />,
                    },
                  ]
                },
                {
                  path: "hostel-allocation",
                  element: <HostelAllocation></HostelAllocation>
                },
                {
                  path: "coaching-settings",
                  children: [
                    {
                      index:true,
                      element: <CoachingBatches></CoachingBatches>,
                    },
                    {
                      path: "coaching-packages",
                      element: <CoachingPackages></CoachingPackages>,
                    },

                  ]
                },
                {
                  path: "coaching-allocation",
                  element: <CoachingAllocation></CoachingAllocation>
                },
                {
                  path: "transport-settings",
                  children: [
                    {
                      index:true,
                      element: <TransportRoutes></TransportRoutes>,
                    },
                    {
                      path: "transport-packages",
                      element: <TransportPackages></TransportPackages>,
                    },

                  ]
                },
                {
                  path: "transport-allocation",
                  element: <TransportAllocation />
                },
              ],

            },
             {
              path: "payroll",
              children: [
                {
                  path: "settings",
                  children: [
                    {
                     index:true,
                      element: <AddAddition></AddAddition>,
                    },
                      {
                      path: "deduction-types",
                      element: <AddDeduction></AddDeduction>,
                    },
                        {
                      path: "employees-additions",
                      element: <EmployeesAdditions/>,
                    },
                        {
                      path: "employees-deductions",
                      element: <EmployeesDeductions/>,
                    },
                       {
                      path: "salary-increments",
                      element: <SalaryIncrements/>,
                    },
                      {
                      path: "basic-salary",
                      element: <BasicSalary/>,
                    },
                        {
                      path: "salary-allocation",
                      element: <SalaryAllocation/>,
                    },
                       {
                      path: "salary-process",
                      element: <SalaryProcess/>,
                    },
                  ]
                }
              ]
            },
              {
              path: "accounting",
              children: [
                {
                  path: "ledger-create",
                  element: <LedgerCreate />,
                },
                 {
                  path: "payment",
                  element: <Payment/>,
                },
                 {
                  path: "receive",
                  element: <Receive />,
                },
                  {
                  path: "contra",
                  element: <Contra />,
                },
                   {
                  path: "journals",
                  element: <Journal />,
                },
              
              ],
            },
  {
              path: "accounting-report",
              children: [
                {
                  path: "trial-balance",
                  element: <TrialBalance />,
                },
                 {
                  path: "income-statement",
                  element: <IncomeStatement/>,
                },
                 {
                  path: "account-statement",
                  element: <AccountStatement/>,
                },
                 {
                  path: "balance-sheet",
                  element: <BalanceSheet />,
                },
                  {
                  path: "cash-summary",
                  element: <CashSummary />,
                },
                   {
                  path: "ledger-summary",
                  element: <LedgerSummary />,
                },
                   {
                  path: "user-transactions",
                  element: <UserTransaction />,
                },
                   {
                  path: "cash-bankbook",
                  element: <CashBankBook />,
                },
              
              ],
            },
          ],
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default Root;
