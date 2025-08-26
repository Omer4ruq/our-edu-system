// import { languageCode } from "../utilitis/getTheme";

import { languageCode } from "../utilitis/getTheme";

// const mainMenu = [
//   {
//     id: "01",
//     title: "প্রোফাইল",
//     icon: false,
//     link: "/profile",
//   },
//   {
//     id: "02",
//     title: `${languageCode == 'bn' ? "ড্যাশবোর্ড" : "Dashboard"}`,
//     icon: "RiDashboardHorizontalFill",
//     link: "/dashboard",
//   },
//   {
//     id: "03",
//     title: "প্রতিষ্ঠানের তথ্য",
//     icon: "HiOutlineBuildingStorefront",
//     link: "/institute-profile",
//   },
//   {
//     id: "04",
//     title: "দারুল ইকামা",
//     icon: "HiOutlineHomeModern",
//     link: "/darul-iqam",
//     children: [
//       {
//         id: "04/01",
//         title: "সেটিং",
//         link: "/darul-iqam/settings",
//         children: [
//           {
//             id: "04/01/01",
//             title: "আচরন ধরন",
//             link: "/darul-iqam/settings",
//           },
//           {
//             id: "04/01/02",
//             title: "ছুটির ধরন",
//             link: "/darul-iqam/settings/leave-type",
//           },

//           {
//             id: "04/01/03",
//             title: "শিক্ষকের পারফরমেন্সের ধরন",
//             link: "/darul-iqam/settings/performance-type",
//           },
//           {
//             id: "04/01/04",
//             title: "পরিছন্নতার ধরন",
//             link: "/darul-iqam/settings/clean-type",
//           },
//         ],
//       },
//       {
//         id: "04/02",
//         title: "আচরন মার্কস",
//         link: "/darul-iqam/behavior-marks",
//       },
//       {
//         id: "04/03",
//         title: "পরিছন্নতার রিপোর্ট",
//         link: "/darul-iqam/clean-report",
//       },
//       {
//         id: "04/04",
//         title: "ছুটির আবেদন",
//         link: "/darul-iqam/leave-request",
//       },
//       {
//         id: "04/05",
//         title: "শিক্ষকের পারফরমেন্স",
//         link: "/darul-iqam/teacher-performance",
//       },
//     ],
//   },
//   {
//     id: "05",
//     title: "তালিমাত",
//     icon: "HiOutlineBuildingStorefront",
//     link: "/talimat",
//     children: [
//       {
//         id: "05/01",
//         title: "সেটিং",
//         link: "/talimat/settings",
//         children: [
//           {
//             id: "05/01/01",
//             title: "শ্রেনী সংযোজন",
//             link: "/talimat/settings",
//           },
//           {
//             id: "05/01/02",
//             title: "সেকশন সংযোজন",
//             link: "/talimat/settings/add-section",
//           },
//           {
//             id: "05/01/03",
//             title: "শিফট সংযোজন",
//             link: "/talimat/settings/add-shift",
//           },
//           {
//             id: "05/01/04",
//             title: "ক্লাস কনফিগারেশন",
//             link: "/talimat/settings/add-config",
//           },
//           {
//             id: "05/01/05",
//             title: "পরীক্ষার ধরন",
//             link: "/talimat/settings/exam-type",
//           },
//           {
//             id: "05/01/06",
//             title: "ইভেন্ট তৈরি",
//             link: "/talimat/settings/event-type",
//           },
//           {
//             id: "05/01/07",
//             title: "গ্রেড কনফিগারেশন",
//             link: "/talimat/settings/result-config",
//           },
//         ],
//       },
//       {
//         id: "05/02",
//         title: "সাবজেক্ট",
//         link: "/talimat/class-subject",
//         children: [
//           {
//             id: "05/02/01",
//             title: "সাবজেক্ট নির্বাচন",
//             link: "/talimat/class-subject",
//           },
//         ],
//       },
//       {
//         id: "05/03",
//         title: "মার্কস কনফিগার",
//         link: "/talimat/marks-config",
//         children: [
//           {
//             id: "05/03/01",
//             title: "marks-config",
//             link: "/talimat/marks-config",
//           },
//         ],
//       },
//       {
//         id: "05/04",
//         title: "প্রবেশপত্র",
//         link: "/talimat/admit-card",
//       },
//       {
//         id: "05/05",
//         title: "সিট প্ল্যান",
//         link: "/talimat/seat-plan",
//       },
//       {
//         id: "05/06",
//         title: "প্রাপ্তনম্বর",
//         link: "/talimat/marks-given",
//         children: [
//           {
//             id: "05/06/01",
//             title: "মার্ক্স প্রদান",
//             link: "/talimat/marks-given",
//           },
//         ],
//       },
//       {
//         id: "05/07",
//         title: "জামাত ঘন্টা",
//         link: "/talimat/periods",
//         children: [
//           {
//             id: "05/07/01",
//             title: "জামাত ঘন্টা",
//             link: "/talimat/periods",
//           },
//         ],
//       },
//       {
//         id: "05/08",
//         title: "শিক্ষকের সাবজেক্ট",
//         link: "/talimat/teacher-subject-assign",
//         children: [
//           {
//             id: "05/08/01",
//             title: "বিষয় অ্যাসাইনমেন্ট",
//             link: "/talimat/teacher-subject-assign",
//           },
//         ],
//       },
//       {
//         id: "05/09",
//         title: "স্বাক্ষর পত্র",
//         link: "/talimat/signature-sheet",
//       },
//       {
//         id: "05/10",
//         title: "ইভেন্ট ক্যালেন্ডার",
//         link: "/talimat/event",
//       },
//       {
//         id: "05/11",
//         title: "নোটিশ",
//         link: "/talimat/notice",
//       },
//       {
//         id: "05/12",
//         title: "রুটিন",
//         link: "/talimat/routine",
//       },
//       {
//         id: "05/13",
//         title: "পরীক্ষার রুটিন",
//         link: "/talimat/exam-routine",
//       },
//       {
//         id: "05/14",
//         title: "ছাত্রের উপস্থিতি",
//         link: "/talimat/student-attendance",
//       },
//       {
//         id: "05/15",
//         title: "প্রত্যয়ন পত্র",
//         link: "/talimat/testimonial",
//       },
//       {
//         id: "05/16",
//         title: "রেজাল্ট",
//         link: "/talimat/result",
//         children: [
//           {
//             id: "05/16/01",
//             title: "ফলাফল পত্র",
//             link: "/talimat/result",
//           },
//           {
//             id: "05/16/02",
//             title: "নম্বরপত্র",
//             link: "/talimat/result/mark-sheet",
//           },
//           {
//             id: "05/16/03",
//             title: "ব্যক্তিগত নম্বরপত্র",
//             link: "/talimat/result/personal-mark-sheet",
//           },
//           {
//             id: "05/16/04",
//             title: "মেধা স্থান",
//             link: "/talimat/result/merit-list",
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "06",
//     title: "অ্যাপস এবং পেজ",
//     icon: false,
//   },
//   {
//     id: "07",
//     title: "হিসাব বিভাগ",
//     icon: "HiOutlineCalculator",
//     link: "/accounts",
//     children: [
//       {
//         id: "07/01",
//         title: "সেটিং",
//         link: "/accounts/settings",
//         children: [
//           {
//             id: "07/01/01",
//             title: "ফান্ডের ধরন",
//             link: "/accounts/settings",
//           },
//           {
//             id: "07/01/02",
//             title: "আয়ের খাতসমূহ",
//             link: "/accounts/settings/income-heads",
//           },
//           {
//             id: "07/01/03",
//             title: "ব্যয়ের ধরন",
//             link: "/accounts/settings/expense-heads",
//           },
//           {
//             id: "07/01/04",
//             title: "ফিসের ধরন",
//             link: "/accounts/settings/fee-heads",
//           },
//         ],
//       },
//       {
//         id: "07/02",
//         title: "বৃত্তি প্রদান",
//         link: "/accounts/waivers",
//       },
//       {
//         id: "07/03",
//         title: "আয়ের লিস্ট",
//         link: "/accounts/income-list",
//       },
//       {
//         id: "07/04",
//         title: "ব্যয়ের লিস্ট",
//         link: "/accounts/expense-list",
//       },
//       {
//         id: "07/05",
//         title: "ফি প্যাকেজ",
//         link: "/accounts/fee-packages",
//       },
//       {
//         id: "07/06",
//         title: "ফি নাম",
//         link: "/accounts/fee-name",
//       },
//       {
//         id: "07/07",
//         title: "সম্মিলিত ফি",
//         link: "/accounts/fee-summary",
//       },
//       // {
//       //   id: "07/08",
//       //   title: "পূর্বের - ফি",
//       //   link: "/accounts/previous-fee",
//       // },
//       {
//         id: "07/09",
//         title: "ডিলিট - ফি",
//         link: "/accounts/delete-fee",
//       },
//       {
//         id: "07/10",
//         title: "রিপোর্ট",
//         link: "/accounts/expense-items-list",
//         children: [
//           {
//             id: "07/10/01",
//             title: "ব্যয়ের ধরন",
//             link: "/accounts/expense-items-list",
//           },
//           {
//             id: "07/10/02",
//             title: "আয়ের ধরন",
//             link: "/accounts/income-items-list",
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "08",
//     title: "ইউজারস",
//     icon: "HiOutlineCalculator",
//     link: "/users",
//     children: [
//       {
//         id: "08/01",
//         title: "ছাত্র",
//         link: "/users/student",
//         children: [
//           {
//             id: "08/01/01",
//             title: "ছাত্র নিবন্ধন",
//             link: "/users/student",
//           },
//           {
//             id: "08/01/02",
//             title: "ছাত্রদের তালিকা",
//             link: "/users/student/student-list",
//           },
//         ],
//       },
//       {
//         id: "08/02",
//         title: "কর্মকর্তা",
//         link: "/users/staff",
//         children: [
//           {
//             id: "08/02/01",
//             title: "কর্মকর্তা নিবন্ধন",
//             link: "/users/staff",
//           },
//           {
//             id: "08/02/02",
//             title: "কর্মকর্তাদের তালিকা",
//             link: "/users/staff/staff-list",
//           },
//         ],
//       },
//       {
//         id: "08/03",
//         title: "ভূমিকা-ভিত্তিক অনুমতি",
//         link: "/users/role-permission",
//       },
//       {
//         id: "08/04",
//         title: "ভূমিকা সংযোজন",
//         link: "/users/role-types",
//       },
//     ],
//   },
//   {
//     id: "09",
//     title: "বোর্ডিং",
//     icon: "HiOutlineCalculator",
//     link: "/boarding",
//     children: [
//       {
//         id: "09/01",
//         title: "সেটিং",
//         link: "/boarding/settings",
//         children: [
//           {
//             id: "09/01/01",
//             title: "খাবারের ধরন",
//             link: "/boarding/settings",
//           },
//           {
//             id: "09/01/02",
//             title: "খাবারের আইটেম",
//             link: "/boarding/settings/meal-items",
//           },
//           {
//             id: "09/01/03",
//             title: "খাবারের সেটাপ",
//             link: "/boarding/settings/meal-setup",
//           },
//         ],
//       },
//       {
//         id: "09/02",
//         title: "খাবারের স্ট্যাটাস",
//         link: "/boarding/meal-status",
//       },
//       {
//         id: "09/03",
//         title: "বোর্ডিং - ফি",
//         link: "/boarding/boarding-fee",
//       },
//     ],
//   },

//   {
//     id: "10",
//     title: "কমিউনিকেশন",
//     icon: "HiOutlineCalculator",
//     link: "/communication",
//     children: [
//       {
//         id: "10/01",
//         title: "জেনারেল এসএমএস",
//         link: "/communication/general-sms",
//         children: [
//           {
//             id: "10/01/01",
//             title: "এসএমএস পাঠান",
//             link: "/communication/general-sms",
//           },
//           {
//             id: "10/01/02",
//             title: "এসএমএস টেমপ্লেট",
//             link: "/communication/general-sms/sms-template",
//           },
//         ],
//       },
//       {
//         id: "10/02",
//         title: "বিজ্ঞপ্তি এসএমএস",
//         link: "/communication/notification-sms",
//         children: [
//           {
//             id: "10/02/01",
//             title: "বিজ্ঞপ্তি এসএমএস পাঠান",
//             link: "/communication/notification-sms",
//           },
//           {
//             id: "10/02/02",
//             title: "এসএমএস বিজ্ঞপ্তি টেমপ্লেট",
//             link: "/communication/notification-sms/sms-notification-template",
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "11",
//     title: "লেআউট",
//     icon: "HiOutlineCalculator",
//     link: "/layout",
//     children: [
//       {
//         id: "11/01",
//         title: "হাজিরা খাতা",
//         link: "/layout/attendance-sheet",
//       },
//       {
//         id: "11/02",
//         title: "মুতালায়া ও সবক রিপোর্ট",
//         link: "/layout/mutalaya-report",
//       },
//     ],
//   },
// ];

// export default mainMenu;


















const mainMenu = [
  {
    id: "01",
    title: `${languageCode == 'bn' ? "প্রোফাইল" : "Profile"}`,
    icon: false,
    link: "/profile",
  },
  {
    id: "02",
    title: `${languageCode == 'bn' ? "ড্যাশবোর্ড" : "Dashboard"}`,
    icon: "RiDashboardHorizontalFill",
    link: "/dashboard",
  },
  {
    id: "03",
    title: `${languageCode == 'bn' ? "প্রতিষ্ঠানের তথ্য" : "Institute Profile"}`,
    icon: "HiOutlineBuildingStorefront",
    link: "/institute-profile",
  },
  {
    id: "04",
    title: `${languageCode == 'bn' ? "দারুল ইকামা" : "Darul Iqama"}`,
    icon: "HiOutlineHomeModern",
    link: "/darul-iqam",
    children: [
      {
        id: "04/01",
        title: `${languageCode == 'bn' ? "সেটিং" : "Settings"}`,
        link: "/darul-iqam/settings",
        children: [
          {
            id: "04/01/01",
            title: `${languageCode == 'bn' ? "আচরন ধরন" : "Behavior Type"}`,
            link: "/darul-iqam/settings",
          },
          {
            id: "04/01/02",
            title: `${languageCode == 'bn' ? "ছুটির ধরন" : "Leave Type"}`,
            link: "/darul-iqam/settings/leave-type",
          },
          {
            id: "04/01/03",
            title: `${languageCode == 'bn' ? "শিক্ষকের পারফরমেন্সের ধরন" : "Teacher Performance Type"}`,
            link: "/darul-iqam/settings/performance-type",
          },
          {
            id: "04/01/04",
            title: `${languageCode == 'bn' ? "পরিছন্নতার ধরন" : "Clean Type"}`,
            link: "/darul-iqam/settings/clean-type",
          },
        ],
      },
      {
        id: "04/02",
        title: `${languageCode == 'bn' ? "আচরন মার্কস" : "Behavior Marks"}`,
        link: "/darul-iqam/behavior-marks",
      },
      {
        id: "04/03",
        title: `${languageCode == 'bn' ? "পরিছন্নতার রিপোর্ট" : "Clean Report"}`,
        link: "/darul-iqam/clean-report",
      },
      {
        id: "04/04",
        title: `${languageCode == 'bn' ? "ছুটির আবেদন" : "Leave Request"}`,
        link: "/darul-iqam/leave-request",
      },
      {
        id: "04/05",
        title: `${languageCode == 'bn' ? "শিক্ষকের পারফরমেন্স" : "Teacher Performance"}`,
        link: "/darul-iqam/teacher-performance",
      },
    ],
  },
  {
    id: "05",
    title: `${languageCode == 'bn' ? "তালিমাত" : "Talimat"}`,
    icon: "HiOutlineBuildingStorefront",
    link: "/talimat",
    children: [
      {
        id: "05/01",
        title: `${languageCode == 'bn' ? "সেটিং" : "Settings"}`,
        link: "/talimat/settings",
        children: [
          {
            id: "05/01/01",
            title: `${languageCode == 'bn' ? "শ্রেনী সংযোজন" : "Class Addition"}`,
            link: "/talimat/settings",
          },
          {
            id: "05/01/02",
            title: `${languageCode == 'bn' ? "সেকশন সংযোজন" : "Section Addition"}`,
            link: "/talimat/settings/add-section",
          },
          {
            id: "05/01/03",
            title: `${languageCode == 'bn' ? "শিফট সংযোজন" : "Shift Addition"}`,
            link: "/talimat/settings/add-shift",
          },
           {
            id: "05/01/04",
            title: `${languageCode == 'bn' ? "ক্লাস কনফিগারেশন" : "Group Addition"}`,
            link: "/talimat/settings/add-group",
          },
              {
            id: "05/01/05",
            title: `${languageCode == 'bn' ? "ক্লাস কনফিগারেশন" : "Group Configuration"}`,
            link: "/talimat/settings/group-config",
          },
          {
            id: "05/01/06",
            title: `${languageCode == 'bn' ? "ক্লাস কনফিগারেশন" : "Class Configuration"}`,
            link: "/talimat/settings/add-config",
          },
               {
            id: "05/01/07",
            title: `${languageCode == 'bn' ? "মার্ক্স টাইপ সংযোজন" : "Marks Type Addition"}`,
            link: "/talimat/settings/add-markstype",
          },
          {
          
            id: "05/01/08",
            title: `${languageCode == 'bn' ? "পরীক্ষার ধরন" : "Exam Type"}`,
            link: "/talimat/settings/exam-type",
          },
                {
          
            id: "05/01/09",
            title: `${languageCode == 'bn' ? "পরীক্ষার কনফিগারেশন" : "Exam Configuration"}`,
            link: "/talimat/settings/exam-config",
          },
               {
          
            id: "05/01/10",
            title: `${languageCode == 'bn' ? "পরীক্ষার কনফিগারেশন" : "Add Layout Name"}`,
            link: "/talimat/settings/add-layout",
          },
          // {
          //   id: "05/01/06",
          //   title: `${languageCode == 'bn' ? "ইভেন্ট তৈরি" : "Event Creation"}`,
          //   link: "/talimat/settings/event-type",
          // },
          // {
          //   id: "05/01/07",
          //   title: `${languageCode == 'bn' ? "গ্রেড কনফিগারেশন" : "Grade Configuration"}`,
          //   link: "/talimat/settings/result-config",
          // },
        ],
      },
      {
        id: "05/02",
        title: `${languageCode == 'bn' ? "সাবজেক্ট" : "Subject Settings"}`,
        link: "/talimat/subject-settings",
        children: [
          {
            id: "05/02/01",
            title: `${languageCode == 'bn' ? "সাবজেক্ট নির্বাচন" : "Subject Addition"}`,
            link: "/talimat/subject-settings/add-subject",
          },
           {
            id: "05/02/02",
            title: `${languageCode == 'bn' ? "সাবজেক্ট নির্বাচন" : "Subject Selection"}`,
            link: "/talimat/subject-settings/class-subject",
          },
           {
            id: "05/02/03",
            title: `${languageCode == 'bn' ? "বিষয় অ্যাসাইনমেন্ট" : "Subject Assignment"}`,
            link: "/talimat/subject-settings/teacher-subject-assign",
          },
        ],
      },
      {
        id: "05/03",
        title: `${languageCode == 'bn' ? "মার্কস কনফিগার" : "Marks Configuration"}`,
        link: "/talimat/marks-config",
        children: [
          {
            id: "05/03/01",
            title: `${languageCode == 'bn' ? "মার্কস কনফিগার" : "Marks Configuration"}`,
            link: "/talimat/marks-config",
          },
        ],
      },
      {
        id: "05/04",
        title: `${languageCode == 'bn' ? "প্রবেশপত্র" : "Admit Card"}`,
        link: "/talimat/admit-card",
      },
      {
        id: "05/05",
        title: `${languageCode == 'bn' ? "সিট প্ল্যান" : "Seat Plan"}`,
        link: "/talimat/seat-plan",
      },
      {
        id: "05/06",
        title: `${languageCode == 'bn' ? "প্রাপ্তনম্বর" : "Marks Given"}`,
        link: "/talimat/marks-given",
        children: [
          {
            id: "05/06/01",
            title: `${languageCode == 'bn' ? "মার্ক্স প্রদান" : "Marks Submission"}`,
            link: "/talimat/marks-given",
          },
        ],
      },
      {
        id: "05/07",
        title: `${languageCode == 'bn' ? "জামাত ঘন্টা" : "Class Periods"}`,
        link: "/talimat/periods",
        children: [
          {
            id: "05/07/01",
            title: `${languageCode == 'bn' ? "জামাত ঘন্টা" : "Class Periods"}`,
            link: "/talimat/periods",
          },
        ],
      },
      {
        id: "05/08",
        title: `${languageCode == 'bn' ? "শিক্ষকের সাবজেক্ট" : "Teacher Subject"}`,
        link: "/talimat/teacher-subject-assign",
        children: [
          {
            id: "05/08/01",
            title: `${languageCode == 'bn' ? "বিষয় অ্যাসাইনমেন্ট" : "Subject Assignment"}`,
            link: "/talimat/teacher-subject-assign",
          },
        ],
      },
      {
        id: "05/09",
        title: `${languageCode == 'bn' ? "স্বাক্ষর পত্র" : "Signature Sheet"}`,
        link: "/talimat/signature-sheet",
      },
      {
        id: "05/10",
        title: `${languageCode == 'bn' ? "ইভেন্ট ক্যালেন্ডার" : "Event Calendar"}`,
        link: "/talimat/event",
      },
      {
        id: "05/11",
        title: `${languageCode == 'bn' ? "নোটিশ" : "Notice"}`,
        link: "/talimat/notice",
      },
      {
        id: "05/12",
        title: `${languageCode == 'bn' ? "রুটিন" : "Routine"}`,
        link: "/talimat/routine",
      },
      {
        id: "05/13",
        title: `${languageCode == 'bn' ? "পরীক্ষার রুটিন" : "Exam Routine"}`,
        link: "/talimat/exam-routine",
      },
      {
        id: "05/14",
        title: `${languageCode == 'bn' ? "ছাত্রের উপস্থিতি" : "Student Attendance"}`,
        link: "/talimat/student-attendance",
      },
      {
        id: "05/15",
        title: `${languageCode == 'bn' ? "প্রত্যয়ন পত্র" : "Testimonial"}`,
        link: "/talimat/testimonial",
      },
      {
        id: "05/16",
        title: `${languageCode == 'bn' ? "রেজাল্ট" : "Result"}`,
        link: "/talimat/result",
        children: [
          {
            id: "05/16/01",
            title: `${languageCode == 'bn' ? "ফলাফল পত্র" : "Result Sheet"}`,
            link: "/talimat/result",
          },
          {
            id: "05/16/02",
            title: `${languageCode == 'bn' ? "নম্বরপত্র" : "Mark Sheet"}`,
            link: "/talimat/result/mark-sheet",
          },
          {
            id: "05/16/03",
            title: `${languageCode == 'bn' ? "ব্যক্তিগত নম্বরপত্র" : "Personal Mark Sheet"}`,
            link: "/talimat/result/personal-mark-sheet",
          },
          {
            id: "05/16/04",
            title: `${languageCode == 'bn' ? "মেধা স্থান" : "Merit List"}`,
            link: "/talimat/result/merit-list",
          },
        ],
      },
         {
        id: "05/17",
        title: `${languageCode == 'bn' ? "প্রত্যয়ন পত্র" : "Layout Model"}`,
        link: "/talimat/layout-model",
      },
    ],
  },
  {
    id: "06",
    title: `${languageCode == 'bn' ? "অ্যাপস এবং পেজ" : "Apps and Pages"}`,
    icon: false,
  },
  {
    id: "07",
    title: `${languageCode == 'bn' ? "হিসাব বিভাগ" : "Accounts"}`,
    icon: "HiOutlineCalculator",
    link: "/accounts",
    children: [
      {
        id: "07/01",
        title: `${languageCode == 'bn' ? "সেটিং" : "Settings"}`,
        link: "/accounts/settings",
        children: [
          {
            id: "07/01/01",
            title: `${languageCode == 'bn' ? "ফান্ডের ধরন" : "Fund Type"}`,
            link: "/accounts/settings",
          },
          {
            id: "07/01/02",
            title: `${languageCode == 'bn' ? "আয়ের খাতসমূহ" : "Income Heads"}`,
            link: "/accounts/settings/income-heads",
          },
          {
            id: "07/01/03",
            title: `${languageCode == 'bn' ? "ব্যয়ের ধরন" : "Expense Heads"}`,
            link: "/accounts/settings/expense-heads",
          },
          {
            id: "07/01/04",
            title: `${languageCode == 'bn' ? "ফিসের ধরন" : "Fee Heads"}`,
            link: "/accounts/settings/fee-heads",
          },
        ],
      },
      {
        id: "07/02",
        title: `${languageCode == 'bn' ? "বৃত্তি প্রদান" : "Waivers"}`,
        link: "/accounts/waivers",
      },
      {
        id: "07/03",
        title: `${languageCode == 'bn' ? "আয়ের লিস্ট" : "Income List"}`,
        link: "/accounts/income-list",
      },
      {
        id: "07/04",
        title: `${languageCode == 'bn' ? "ব্যয়ের লিস্ট" : "Expense List"}`,
        link: "/accounts/expense-list",
      },
      {
        id: "07/05",
        title: `${languageCode == 'bn' ? "ফি প্যাকেজ" : "Fee Packages"}`,
        link: "/accounts/fee-packages",
      },
      {
        id: "07/06",
        title: `${languageCode == 'bn' ? "ফি নাম" : "Fee Name"}`,
        link: "/accounts/fee-name",
      },
      {
        id: "07/07",
        title: `${languageCode == 'bn' ? "সম্মিলিত ফি" : "Fee Summary"}`,
        link: "/accounts/fee-summary",
      },
      {
        id: "07/08",
        title: `${languageCode == 'bn' ? "পূর্বের - ফি" : "Previous Fee"}`,
        link: "/accounts/previous-fee",
      },
      {
        id: "07/09",
        title: `${languageCode == 'bn' ? "ডিলিট - ফি" : "Delete Fee"}`,
        link: "/accounts/delete-fee",
      },
      {
        id: "07/10",
        title: `${languageCode == 'bn' ? "ডিলিট - ফি" : "Service Fees"}`,
        link: "/accounts/service-fees",
      },
      {
        id: "07/11",
        title: `${languageCode == 'bn' ? "রিপোর্ট" : "Report"}`,
        link: "/accounts/expense-items-list",
        children: [
          {
            id: "07/11/01",
            title: `${languageCode == 'bn' ? "ব্যয়ের ধরন" : "Expense Items"}`,
            link: "/accounts/expense-items-list",
          },
          {
            id: "07/11/02",
            title: `${languageCode == 'bn' ? "আয়ের ধরন" : "Income Items"}`,
            link: "/accounts/income-items-list",
          },
        ],
      },
    ],
  },
  {
    id: "08",
    title: `${languageCode == 'bn' ? "ইউজারস" : "Users"}`,
    icon: "HiOutlineCalculator",
    link: "/users",
    children: [
      {
        id: "08/01",
        title: `${languageCode == 'bn' ? "ছাত্র" : "Student"}`,
        link: "/users/student",
        children: [
          {
            id: "08/01/01",
            title: `${languageCode == 'bn' ? "ছাত্র নিবন্ধন" : "Student Registration"}`,
            link: "/users/student",
          },
          {
            id: "08/01/02",
            title: `${languageCode == 'bn' ? "ছাত্রদের তালিকা" : "Student List"}`,
            link: "/users/student/student-list",
          },
        ],
      },
      {
        id: "08/02",
        title: `${languageCode == 'bn' ? "কর্মকর্তা" : "Staff"}`,
        link: "/users/staff",
        children: [
          {
            id: "08/02/01",
            title: `${languageCode == 'bn' ? "কর্মকর্তা নিবন্ধন" : "Staff Registration"}`,
            link: "/users/staff",
          },
          {
            id: "08/02/02",
            title: `${languageCode == 'bn' ? "কর্মকর্তাদের তালিকা" : "Staff List"}`,
            link: "/users/staff/staff-list",
          },
        ],
      },
      {
        id: "08/03",
        title: `${languageCode == 'bn' ? "ভূমিকা-ভিত্তিক অনুমতি" : "Role-Based Permission"}`,
        link: "/users/role-permission",
      },
      {
        id: "08/04",
        title: `${languageCode == 'bn' ? "ভূমিকা সংযোজন" : "Role Types"}`,
        link: "/users/role-types",
      },
    ],
  },
  {
    id: "09",
    title: `${languageCode == 'bn' ? "বোর্ডিং" : "Boarding"}`,
    icon: "HiOutlineCalculator",
    link: "/boarding",
    children: [
      {
        id: "09/01",
        title: `${languageCode == 'bn' ? "সেটিং" : "Settings"}`,
        link: "/boarding/settings",
        children: [
          {
            id: "09/01/01",
            title: `${languageCode == 'bn' ? "খাবারের ধরন" : "Meal Type"}`,
            link: "/boarding/settings",
          },
          {
            id: "09/01/02",
            title: `${languageCode == 'bn' ? "খাবারের আইটেম" : "Meal Items"}`,
            link: "/boarding/settings/meal-items",
          },
          {
            id: "09/01/03",
            title: `${languageCode == 'bn' ? "খাবারের সেটাপ" : "Meal Setup"}`,
            link: "/boarding/settings/meal-setup",
          },
        ],
      },
      {
        id: "09/02",
        title: `${languageCode == 'bn' ? "খাবারের স্ট্যাটাস" : "Meal Status"}`,
        link: "/boarding/meal-status",
      },
      {
        id: "09/03",
        title: `${languageCode == 'bn' ? "বোর্ডিং - ফি" : "Boarding Fee"}`,
        link: "/boarding/boarding-fee",
      },
    ],
  },
  {
    id: "10",
    title: `${languageCode == 'bn' ? "কমিউনিকেশন" : "Communication"}`,
    icon: "HiOutlineCalculator",
    link: "/communication",
    children: [
      {
        id: "10/01",
        title: `${languageCode == 'bn' ? "জেনারেল এসএমএস" : "General SMS"}`,
        link: "/communication/general-sms",
        children: [
          {
            id: "10/01/01",
            title: `${languageCode == 'bn' ? "এসএমএস পাঠান" : "Send SMS"}`,
            link: "/communication/general-sms",
          },
          {
            id: "10/01/02",
            title: `${languageCode == 'bn' ? "এসএমএস টেমপ্লেট" : "SMS Template"}`,
            link: "/communication/general-sms/sms-template",
          },
        ],
      },
      {
        id: "10/02",
        title: `${languageCode == 'bn' ? "বিজ্ঞপ্তি এসএমএস" : "Notification SMS"}`,
        link: "/communication/notification-sms",
        children: [
          {
            id: "10/02/01",
            title: `${languageCode == 'bn' ? "বিজ্ঞপ্তি এসএমএস পাঠান" : "Send Notification SMS"}`,
            link: "/communication/notification-sms",
          },
          {
            id: "10/02/02",
            title: `${languageCode == 'bn' ? "এসএমএস বিজ্ঞপ্তি টেমপ্লেট" : "SMS Notification Template"}`,
            link: "/communication/notification-sms/sms-notification-template",
          },
        ],
      },
    ],
  },
  {
    id: "11",
    title: `${languageCode == 'bn' ? "লেআউট" : "Layout"}`,
    icon: "HiOutlineCalculator",
    link: "/layout",
    children: [
      {
        id: "11/01",
        title: `${languageCode == 'bn' ? "হাজিরা খাতা" : "Attendance Sheet"}`,
        link: "/layout/attendance-sheet",
      },
      {
        id: "11/02",
        title: `${languageCode == 'bn' ? "মুতালায়া ও সবক রিপোর্ট" : "Mutalaya and Sabak Report"}`,
        link: "/layout/mutalaya-report",
      },
    ],
  },
 {
  id: "12",
  title: `${languageCode == 'bn' ? "সার্ভিস" : "Services"}`,
  icon: "HiOutlineCalculator",
  link: "/services",
  children: [

    {
      id: "12/01",
      title: `${languageCode == 'bn' ? "সেটিংস" : "Setting"}`,
      link: "/services/settings",
      children: [
        {
          id: "12/01/01",
          title: `${languageCode == 'bn' ? "হোস্টেল প্যাকেজ" : "Hostel Package"}`,
          link: "/services/settings",
        },
        {
          id: "12/01/02",
          title: `${languageCode == 'bn' ? "হোস্টেল নাম" : "Hostel Name"}`,
          link: "/services/settings/hostel-name",
        },
        {
          id: "12/01/03",
          title: `${languageCode == 'bn' ? "হোস্টেল রুম" : "Hostel Room"}`,
          link: "/services/settings/hostel-room",
        },
      ]
    },
    {
      id: "12/02",
      title: `${languageCode == 'bn' ? "হোস্টেল বরাদ্দ" : "Hostel Allocation"}`,
      link: "/services/hostel-allocation",
    },
    {
      id: "12/03",
      title: `${languageCode == 'bn' ? "কোচিং সেটিংস" : "Coaching Setting"}`,
      link: "/services/coaching-settings",
      children: [
        {
          id: "12/03/01",
          title: `${languageCode == 'bn' ? "কোচিং ব্যাচ" : "Coaching Batches"}`,
          link: "/services/coaching-settings",
        },
        {
          id: "12/03/02",
          title: `${languageCode == 'bn' ? "কোচিং প্যাকেজ" : "Coaching Packages"}`,
          link: "/services/coaching-settings/coaching-packages",
        },
      ]
    },
    {
      id: "12/04",
      title: `${languageCode == 'bn' ? "কোচিং বরাদ্দ" : "Coaching Allocation"}`,
      link: "/services/coaching-allocation",
    },
    {
      id: "12/05",
      title: `${languageCode == 'bn' ? "পরিবহন সেটিংস" : "Transport Setting"}`,
      link: "/services/transport-settings",
      children: [
        {
          id: "12/05/01",
          title: `${languageCode == 'bn' ? "পরিবহন রুট" : "Transport Routes"}`,
          link: "/services/transport-settings",
        },
        {
          id: "12/05/02",
          title: `${languageCode == 'bn' ? "পরিবহন প্যাকেজ" : "Transport Packages"}`,
          link: "/services/transport-settings/transport-packages",
        },
      ]
    },
    {
      id: "12/06",
      title: `${languageCode == 'bn' ? "পরিবহন বরাদ্দ" : "Transport Allocation"}`,
      link: "/services/transport-allocation",
    },
  ]
},
 {
  id: "13",
  title: `${languageCode == 'bn' ? "পেরোল" : "Payroll"}`,
  icon: "HiOutlineCalculator",
  link: "/payroll",
  children: [

    {
      id: "13/01",
      title: `${languageCode == 'bn' ? "সেটিংস" : "Setting"}`,
      link: "/payroll/settings",
      children: [
        {
          id: "13/01/01",
          title: `${languageCode == 'bn' ? "সংযোজনের ধরন " : "Addition Types"}`,
          link: "/payroll/settings",
        },
             {
          id: "13/01/02",
          title: `${languageCode == 'bn' ? "কর্তনের ধরন" : "Deduction Types"}`,
          link: "/payroll/settings/deduction-types",
        },
         {
          id: "13/01/03",
          title: `${languageCode == 'bn' ? "কর্মকর্তা সংযোজন খাত " : "Employees Additions"}`,
          link: "/payroll/settings/employees-additions",
        },
           {
          id: "13/01/04",
          title: `${languageCode == 'bn' ? "কর্মকর্তা কর্তন খাত " : "Employees Deductions"}`,
          link: "/payroll/settings/employees-deductions",
        },
              {
          id: "13/01/05",
          title: `${languageCode == 'bn' ? "বেতনের পরিমাণ বৃদ্ধি " : "Salary Increments"}`,
          link: "/payroll/settings/salary-increments",
        },
           {
          id: "13/01/06",
          title: `${languageCode == 'bn' ? "মৌলিক বেতন" : "Basic Salary"}`,
          link: "/payroll/settings/basic-salary",
        },
           {
          id: "13/01/07",
          title: `${languageCode == 'bn' ? "মৌলিক বেতন" : "Salary Allocation"}`,
          link: "/payroll/settings/salary-allocation",
        },
           {
          id: "13/01/08",
          title: `${languageCode == 'bn' ? "মৌলিক বেতন" : "Salary Process"}`,
          link: "/payroll/settings/salary-process",
        },
      ]
    }
  ]
},
 {
  id: "14",
  title: `${languageCode == 'bn' ? "পে-রোল" : "Pay-roll"}`,
  icon: "HiOutlineCalculator",
  link: "/accounting",
  children: [

       {
          id: "14/01",
          title: `${languageCode == 'bn' ? "সংযোজনের ধরন " : "Led Create"}`,
          link: "/accounting/ledger-create",
        },
        
       {
          id: "14/02",
          title: `${languageCode == 'bn' ? "সংযোজনের ধরন " : "Payment"}`,
          link: "/accounting/payment",
        },
        
       {
          id: "14/03",
          title: `${languageCode == 'bn' ? "সংযোজনের ধরন " : "Receive"}`,
          link: "/accounting/receive",
        },
          {
          id: "14/04",
          title: `${languageCode == 'bn' ? "সংযোজনের ধরন " : "contra"}`,
          link: "/accounting/contra",
        },
           {
          id: "14/05",
          title: `${languageCode == 'bn' ? "সংযোজনের ধরন " : "journals"}`,
          link: "/accounting/journals",
        },
  ]
}



];

export default mainMenu;