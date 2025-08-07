import React, { useState, useMemo } from "react";
import Select from "react-select";
import { FaSpinner, FaTrash, FaFilePdf } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useGetClassSubjectsByClassIdQuery } from "../../../redux/features/api/class-subjects/classSubjectsApi";
import { useDeleteExamSchedulesMutation } from "../../../redux/features/api/routines/examRoutineApi";
import selectStyles from "../../../utilitis/selectStyles";

const ExamRoutineTable = ({
  allExamSchedules = [],
  classes = [],
  selectedExam,
  selectedYear,
  isAllSchedulesLoading = false,
  onRefresh
}) => {
  const [selectedClassForPDF, setSelectedClassForPDF] = useState(null);

  // Fetch subjects only for the selected class (if any)
  const { data: classSubjects = [], isLoading: isSubjectsLoading } = useGetClassSubjectsByClassIdQuery(
    selectedClassForPDF || "",
    { skip: !selectedClassForPDF }
  );

  const [deleteExamSchedules] = useDeleteExamSchedulesMutation();

  // Get unique class IDs that have schedules
  const classesWithSchedules = useMemo(() => {
    if (!allExamSchedules || allExamSchedules.length === 0) return [];
    return [...new Set(allExamSchedules.map(item => item.class_name).filter(Boolean))];
  }, [allExamSchedules]);

  // Function to get subject name with proper fallback
  const getSubjectName = (subjectId, classId) => {
    if (selectedClassForPDF === classId && classSubjects.length > 0) {
      const subject = classSubjects.find(s => s.id === subjectId);
      if (subject) return subject.name;
    }

    if (selectedClassForPDF === classId && isSubjectsLoading) {
      return `লোড হচ্ছে... (${subjectId})`;
    }

    const className = classes.find(c => c.student_class.id === classId)?.student_class.name;
    return className ? `${className} - বিষয় ${subjectId}` : `বিষয় ${subjectId}`;
  };

  // Function to format time for display
  const formatTimeForDisplay = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Get class-specific schedules for display and PDF
  const getClassSchedulesForDisplay = (classId = null) => {
    if (!allExamSchedules || allExamSchedules.length === 0) return [];
    
    let schedules = [];
    
    if (classId) {
      const classData = allExamSchedules.find(item => item.class_name === classId);
      if (classData && classData.schedules) {
        schedules = classData.schedules.map(schedule => ({
          ...schedule,
          className: classes.find(c => c.student_class.id === classId)?.student_class.name || 'Unknown Class',
          classId: classId
        }));
      }
    } else {
      allExamSchedules.forEach(classData => {
        if (classData.schedules && classData.schedules.length > 0) {
          const className = classes.find(c => c.student_class.id === classData.class_name)?.student_class.name || 'Unknown Class';
          classData.schedules.forEach(schedule => {
            schedules.push({
              ...schedule,
              className: className,
              classId: classData.class_name
            });
          });
        }
      });
    }
    
    return schedules.sort((a, b) => {
      if (a.exam_date !== b.exam_date) return a.exam_date.localeCompare(b.exam_date);
      return a.start_time.localeCompare(b.start_time);
    });
  };

  // Get display schedules based on selected class
  const displaySchedules = useMemo(() => {
    return getClassSchedulesForDisplay(selectedClassForPDF);
  }, [selectedClassForPDF, allExamSchedules, classes]);

  // Handle delete schedule
  const handleDelete = async (scheduleId, subjectName, classId) => {
    try {
      await deleteExamSchedules(scheduleId).unwrap();
      toast.success(`${subjectName} এর রুটিন সফলভাবে মুছে ফেলা হয়েছে!`);
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      toast.error(
        `${subjectName} এর রুটিন মুছতে ব্যর্থ হয়েছে: ${
          error?.data?.detail || "অজানা ত্রুটি"
        }`
      );
    }
  };

  // Function to group schedules by date and time for comprehensive PDF
  const groupSchedulesForPDF = (schedules) => {
    const grouped = {};
    
    schedules.forEach(schedule => {
      const key = `${schedule.exam_date}_${schedule.start_time}_${schedule.end_time}`;
      if (!grouped[key]) {
        grouped[key] = {
          date: schedule.exam_date,
          startTime: schedule.start_time,
          endTime: schedule.end_time,
          exams: []
        };
      }
      
      grouped[key].exams.push({
        subject: getSubjectName(schedule.subject_id, schedule.classId),
        className: schedule.className
      });
    });
    
    return Object.values(grouped).sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });
  };

  // Generate PDF for selected class or all classes
  const generateExamRoutinePDF = () => {
    if (!selectedExam || !selectedYear) {
      toast.error("পরীক্ষা এবং শিক্ষাবর্ষ নির্বাচন করুন");
      return;
    }

    const examName = selectedExam.label;
    const yearName = selectedYear.label;
    const schedulesData = getClassSchedulesForDisplay(selectedClassForPDF);
    
    if (schedulesData.length === 0) {
      toast.error("পরীক্ষার রুটিন পাওয়া যায়নি");
      return;
    }

    const printWindow = window.open('', '_blank');
    
    const isSpecificClass = selectedClassForPDF !== null;
    const className = isSpecificClass 
      ? classes.find(c => c.student_class.id === selectedClassForPDF)?.student_class.name 
      : null;

    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${isSpecificClass ? `পরীক্ষার রুটিন - ${className}` : 'সামগ্রিক পরীক্ষার রুটিন'}</title>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: white;
            font-size: 14px;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
          }
          .institution { 
            font-size: 24px; 
            font-weight: bold; 
            margin-bottom: 5px; 
          }
          .exam-info { 
            font-size: 18px; 
            margin: 5px 0; 
          }
          .class-info { 
            font-size: 16px; 
            color: #666; 
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0; 
            border: 2px solid #333;
          }
          th, td { 
            border: 1px solid #333; 
            padding: 10px 8px; 
            text-align: center;
            vertical-align: middle;
          }
          th { 
            background-color: #f5f5f5; 
            font-weight: bold; 
            font-size: 13px;
          }
          td {
            font-size: 12px;
          }
          .subject-name {
            font-weight: bold;
            text-align: left;
            padding-left: 15px;
          }
          .date-cell {
            background-color: #fafafa;
            font-weight: bold;
          }
          .time-cell {
            background-color: #f9f9f9;
          }
          .class-name {
            font-weight: bold;
            color: #0066cc;
          }
          .footer {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #666;
          }
          .signature-section {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
          }
          .signature-box {
            text-align: center;
            border-top: 1px solid #333;
            padding-top: 5px;
            width: 200px;
            font-size: 12px;
          }
          .exam-details {
            text-align: left;
            padding-left: 15px;
          }
          .exam-item {
            margin: 3px 0;
            padding: 2px 0;
            border-bottom: 1px dotted #ccc;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="institution">Your Institution Name</div>
          <div class="exam-info">${examName} - ${isSpecificClass ? 'পরীক্ষার রুটিন' : 'সামগ্রিক পরীক্ষার রুটিন'}</div>
          ${isSpecificClass 
            ? `<div class="class-info">শ্রেণি: ${className} | শিক্ষাবর্ষ: ${yearName}</div>`
            : `<div class="class-info">সকল শ্রেণির রুটিন | শিক্ষাবর্ষ: ${yearName}</div>`
          }
        </div>
    `;

    if (isSpecificClass) {
      htmlContent += `
        <table>
          <thead>
            <tr>
              <th style="width: 15%;">তারিখ</th>
              <th style="width: 30%;">বিষয়</th>
              <th style="width: 15%;">শুরুর সময়</th>
              <th style="width: 15%;">শেষের সময়</th>
              <th style="width: 12%;">সময়কাল</th>
              <th style="width: 13%;">কক্ষ নং</th>
            </tr>
          </thead>
          <tbody>
      `;

      schedulesData.forEach(schedule => {
        const subjectName = getSubjectName(schedule.subject_id, schedule.classId);
        const startTime = formatTimeForDisplay(schedule.start_time);
        const endTime = formatTimeForDisplay(schedule.end_time);
        
        const [startHours, startMinutes] = schedule.start_time.split(':').map(Number);
        const [endHours, endMinutes] = schedule.end_time.split(':').map(Number);
        const durationMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
        const durationText = durationMinutes >= 60 
          ? `${Math.floor(durationMinutes / 60)} ঘন্টা ${durationMinutes % 60 > 0 ? durationMinutes % 60 + ' মিনিট' : ''}`
          : `${durationMinutes} মিনিট`;

        htmlContent += `
          <tr>
            <td class="date-cell">${new Date(schedule.exam_date).toLocaleDateString('bn-BD')}</td>
            <td class="subject-name">${subjectName}</td>
            <td>${startTime}</td>
            <td>${endTime}</td>
            <td>${durationText}</td>
            <td>______</td>
          </tr>
        `;
      });

      htmlContent += `</tbody></table>`;
    } else {
      const groupedSchedules = groupSchedulesForPDF(schedulesData);
      
      htmlContent += `
        <table>
          <thead>
            <tr>
              <th style="width: 15%;">তারিখ</th>
              <th style="width: 20%;">সময়</th>
              <th style="width: 65%;">পরীক্ষার বিবরণ</th>
            </tr>
          </thead>
          <tbody>
      `;

      groupedSchedules.forEach(group => {
        const startTime = formatTimeForDisplay(group.startTime);
        const endTime = formatTimeForDisplay(group.endTime);
        
        htmlContent += `
          <tr>
            <td class="date-cell">${new Date(group.date).toLocaleDateString('bn-BD')}</td>
            <td class="time-cell">${startTime}<br/>থেকে<br/>${endTime}</td>
            <td class="exam-details">
        `;
        
        group.exams.forEach(exam => {
          htmlContent += `
            <div class="exam-item">
              <span class="class-name">${exam.className}</span> - ${exam.subject}
            </div>
          `;
        });
        
        htmlContent += `</td></tr>`;
      });

      htmlContent += `</tbody></table>`;
      
      htmlContent += `
        <div style="margin-top: 20px; padding: 10px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 5px;">
          <strong>নোট:</strong> 
        </div>
      `;
    }

    htmlContent += `
        <div class="footer">
          <div>রুটিন তৈরির তারিখ: ${new Date().toLocaleDateString('bn-BD')}</div>
          <div>মুদ্রণের তারিখ: ${new Date().toLocaleDateString('bn-BD')}</div>
        </div>
        
        <div class="signature-section">
          <div class="signature-box">
            পরীক্ষা নিয়ন্ত্রকের স্বাক্ষর
          </div>
          <div class="signature-box">
            প্রধান শিক্ষকের স্বাক্ষর
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
    
    const message = isSpecificClass 
      ? `${className} এর পরীক্ষার রুটিন PDF তৈরি হয়েছে!`
      : "সামগ্রিক পরীক্ষার রুটিন PDF তৈরি হয়েছে!";
    toast.success(message);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-xl font-semibold text-[#441a05]animate-fadeIn">
          পরীক্ষার রুটিন:{" "}
          {selectedClassForPDF === null 
            ? "সকল ক্লাস"
            : classes.find(cls => cls.student_class.id === selectedClassForPDF)?.student_class.name || "অজানা ক্লাস"
          }
        </h3>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-[#441a05]whitespace-nowrap">
              PDF এর জন্য ক্লাস:
            </label>
            <Select
              options={[
                { value: null, label: "সকল ক্লাস" },
                ...classes.map(cls => ({
                  value: cls.student_class.id,
                  label: cls.student_class.name
                }))
              ]}
              value={
                selectedClassForPDF === null 
                  ? { value: null, label: "সকল ক্লাস" }
                  : classes.find(cls => cls.student_class.id === selectedClassForPDF)
                    ? { 
                        value: selectedClassForPDF, 
                        label: classes.find(cls => cls.student_class.id === selectedClassForPDF)?.student_class.name 
                      }
                    : null
              }
              onChange={(selected) => setSelectedClassForPDF(selected ? selected.value : null)}
              placeholder="ক্লাস নির্বাচন করুন"
              className="react-select-container min-w-[180px]"
              classNamePrefix="react-select"
              styles={selectStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              isClearable={false}
              isDisabled={isAllSchedulesLoading || isSubjectsLoading}
            />
          </div>
          
          <button
            onClick={generateExamRoutinePDF}
            disabled={!selectedExam || !selectedYear || isAllSchedulesLoading || isSubjectsLoading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              !selectedExam || !selectedYear || isAllSchedulesLoading || isSubjectsLoading
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-red-600 text-[#441a05]hover:bg-red-700 btn-glow"
            }`}
            aria-label="পরীক্ষার রুটিন PDF ডাউনলোড"
            title={
              selectedClassForPDF === null 
                ? "সকল ক্লাসের পরীক্ষার রুটিন PDF ডাউনলোড করুন"
                : `${classes.find(cls => cls.student_class.id === selectedClassForPDF)?.student_class.name} এর পরীক্ষার রুটিন PDF ডাউনলোড করুন`
            }
          >
            {isAllSchedulesLoading || isSubjectsLoading ? (
              <>
                <FaSpinner className="animate-spin text-lg" />
                <span>লোড হচ্ছে...</span>
              </>
            ) : (
              <>
                <FaFilePdf className="text-lg" />
                <span>
                  {selectedClassForPDF === null ? "সামগ্রিক রুটিন" : "ক্লাস রুটিন"} PDF
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {isSubjectsLoading && selectedClassForPDF && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
          <p className="text-sm text-blue-800 flex items-center">
            <FaSpinner className="animate-spin mr-2" />
            <strong>বিষয়ের তালিকা লোড হচ্ছে...</strong> নির্বাচিত ক্লাসের বিষয়ের নাম সঠিকভাবে দেখাতে কিছুক্ষণ অপেক্ষা করুন।
          </p>
        </div>
      )}

      {displaySchedules.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-pmColor animate-fadeIn">
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-pmColor text-[#441a05]text-left text-sm uppercase font-semibold">
                {selectedClassForPDF === null && (
                  <th className="p-4">ক্লাস</th>
                )}
                <th className={selectedClassForPDF === null ? "p-4" : "p-4 rounded-tl-xl"}>বিষয়</th>
                <th className="p-4 text-center">তারিখ</th>
                <th className="p-4 text-center">শুরুর সময়</th>
                <th className="p-4 text-center">শেষের সময়</th>
                <th className="p-4 text-center">সময়কাল</th>
                <th className="p-4 rounded-tr-xl text-center">ক্রিয়া</th>
              </tr>
            </thead>
            <tbody>
              {displaySchedules.map((schedule, index) => {
                const subjectName = getSubjectName(schedule.subject_id, schedule.classId);
                
                const [startHours, startMinutes] = schedule.start_time.split(':').map(Number);
                const [endHours, endMinutes] = schedule.end_time.split(':').map(Number);
                const durationMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
                const durationText = durationMinutes >= 60 
                  ? `${Math.floor(durationMinutes / 60)} ঘন্টা ${durationMinutes % 60 > 0 ? durationMinutes % 60 + ' মিনিট' : ''}`
                  : `${durationMinutes} মিনিট`;

                return (
                  <tr
                    key={`${schedule.id || index}-${schedule.className}-${schedule.subject_id}`}
                    className={`${index % 2 === 1 ? "bg-white/5" : "bg-white/10"} text-[#441a05]animate-scaleIn hover:bg-white/20 transition-colors duration-200`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {selectedClassForPDF === null && (
                      <td className="p-4 font-medium text-blue-600">
                        {schedule.className}
                      </td>
                    )}
                    <td className="p-4 font-medium">
                      {subjectName}
                      {selectedClassForPDF === schedule.classId && isSubjectsLoading && (
                        <span className="ml-2 text-xs text-gray-500">(লোড হচ্ছে...)</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {new Date(schedule.exam_date).toLocaleDateString('bn-BD')}
                    </td>
                    <td className="p-4 text-center font-medium">
                      {formatTimeForDisplay(schedule.start_time)}
                    </td>
                    <td className="p-4 text-center font-medium">
                      {formatTimeForDisplay(schedule.end_time)}
                    </td>
                    <td className="p-4 text-center">
                      {durationText}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() =>
                          handleDelete(
                            schedule.id,
                            subjectName,
                            schedule.classId
                          )
                        }
                        className="px-3 py-1 bg-red-600 text-[#441a05]rounded hover:bg-red-700 transition btn-glow"
                        title={`মুছুন / Delete ${subjectName}`}
                      >
                        <FaTrash className="inline-block" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-white/70 animate-scaleIn mt-4 text-center">
          🤷‍♂️ {selectedClassForPDF === null ? "কোনো রুটিন উপলব্ধ নেই।" : "এই ক্লাসের জন্য কোনো রুটিন উপলব্ধ নেই।"}
        </p>
      )}
    </div>
  );
};

export default ExamRoutineTable;