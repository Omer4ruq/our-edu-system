import React, { useEffect, useMemo, useState, useRef } from "react";
import ClassRoutineTable from "./ClassRoutineTable";
import { IoAddCircle, IoAdd, IoCalendar, IoTime, IoBook, IoPerson } from "react-icons/io5";
import { FaSpinner, FaGripVertical, FaTimes } from "react-icons/fa";
import { MdDragIndicator } from "react-icons/md";
import { Toaster, toast } from "react-hot-toast";
import { useGetclassConfigApiQuery } from "../../../redux/features/api/class/classConfigApi";
import { useGetTeacherStaffProfilesQuery } from "../../../redux/features/api/roleStaffProfile/roleStaffProfileApi";
import { useGetTeacherSubjectAssignsByClassAndSubjectQuery } from "../../../redux/features/api/teacherSubjectAssigns/teacherSubjectAssignsApi";
import { useGetClassPeriodsByClassIdQuery } from "../../../redux/features/api/periods/classPeriodsApi";
import { useGetSubjectAssignmentsByGroupQuery, useGetSubjectAssignmentsQuery } from "../../../redux/features/api/subject-assign/subjectAssignApi";
import { useCreateRoutineMutation } from "../../../redux/features/api/routines/routinesApi";
import { useSelector } from "react-redux";
import { useGetGroupPermissionsQuery } from "../../../redux/features/api/permissionRole/groupsApi";

export default function ClassRoutine() {
  const { user, group_id } = useSelector((state) => state.auth);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [routineData, setRoutineData] = useState({});
  const [draggedTeacher, setDraggedTeacher] = useState(null);
  const [draggedSubject, setDraggedSubject] = useState(null);
  const dragRef = useRef(null);

  // Permissions hook
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });

  // Permission checks
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_routine') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_routine') || false;

  const dayMap = {
    Saturday: "শনিবার",
    Sunday: "রবিবার", 
    Monday: "সোমবার",
    Tuesday: "মঙ্গলবার",
    Wednesday: "বুধবার",
    Thursday: "বৃহস্পতিবার",
  };

  // Validate class_id
  const isValidId = (id) => id && (typeof id === "string" || typeof id === "number");

  // Fetch classes
  const { data: classes, isLoading: classesLoading } = useGetclassConfigApiQuery();
console.log("classes",classes)
  // Fetch teachers
  const { data: allteachers, isLoading: allteachersLoading } = useGetTeacherStaffProfilesQuery();
  console.log("allteachers", allteachers);

  // Fetch teacher subject assignments
  const { data: teacherSubjectAssigns = [], isLoading: teacherSubjectAssignsLoading } = 
    useGetTeacherSubjectAssignsByClassAndSubjectQuery();
  console.log("teacherSubjectAssigns", teacherSubjectAssigns);

  // Fetch periods
  const { data: periods = [], isLoading: periodsLoading, error: periodsError } = 
    useGetClassPeriodsByClassIdQuery(
      selectedClass && isValidId(selectedClass.id) ? selectedClass.id : undefined,
      { skip: !selectedClass || !isValidId(selectedClass.id) }
    );

  // Fetch subject assignments with updated structure
  // const { data: subjectAssignments = [], isLoading: subjectsLoading, error: subjectsError } = 
  //   useGetSubjectAssignmentsByGroupQuery(
  //     selectedClass && isValidId(selectedClass.class_group_id) ? selectedClass.class_group_id : undefined,
  //     { skip: !selectedClass || !isValidId(selectedClass.class_group_id) }
  //   );
      const { data: subjectAssignments = [], isLoading: subjectsLoading, error: subjectsError } = 
    useGetSubjectAssignmentsQuery();
  console.log("subjectAssignments", subjectAssignments);
  console.log("selectedClass", selectedClass);

  // Mutation for creating routine
  const [createRoutine, { isLoading: createLoading, error: createError }] = useCreateRoutineMutation();

  // Process subject data with teachers based on teacher subject assignments
  const subjectsWithTeachers = useMemo(() => {
    if (!Array.isArray(subjectAssignments) || !Array.isArray(allteachers) || !Array.isArray(teacherSubjectAssigns)) {
      return [];
    }
    
    const result = [];
    
    subjectAssignments.forEach(assignment => {
      if (assignment.subject_details && Array.isArray(assignment.subject_details)) {
        assignment.subject_details.forEach(subject => {
          // Find teachers who are assigned to this subject
          const assignedTeachers = teacherSubjectAssigns
            .filter(teacherAssign => 
              // Check if this teacher has this subject assigned
              teacherAssign.subject_assigns && 
              teacherAssign.subject_assigns.includes(subject.id) &&
              // Check if this teacher is assigned to this class
              teacherAssign.class_assigns &&
              teacherAssign.class_assigns.includes(assignment.class_id)
            )
            .map(teacherAssign => {
              // Find the actual teacher data from allteachers
              return allteachers.find(teacher => teacher.id === teacherAssign.teacher_id);
            })
            .filter(teacher => teacher !== undefined); // Remove undefined values
          
          // If no teachers found for this subject, you might want to show all teachers as fallback
          // or show empty array based on your requirement
          const teachersForSubject = assignedTeachers.length > 0 ? assignedTeachers : [];
          
          result.push({
            ...subject,
            teachers: teachersForSubject,
            classId: assignment.class_id,
            assignmentId: assignment.id
          });
        });
      }
    });
    
    return result;
  }, [subjectAssignments, allteachers, teacherSubjectAssigns]);

  const handleClassSelect = (cls) => {
    setSelectedClass({
      id: cls.id,
      class_id: cls?.id,
      g_class_id: cls?.g_class_id,
      r_class_id: cls?.class_id,
      class_group_id: cls?.class_group_id,
      name: `${cls?.class_name} ${cls?.section_name}`,
    });
    setRoutineData({});
  };

  const handleDragStart = (e, teacher, subject) => {
    setDraggedTeacher(teacher);
    setDraggedSubject(subject);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, periodId, day) => {
    e.preventDefault();
    
    if (draggedTeacher && draggedSubject) {
      const key = `${day}_${periodId}`;
      setRoutineData(prev => ({
        ...prev,
        [key]: {
          teacher: draggedTeacher,
          subject: draggedSubject,
          period: periodId,
          day: day
        }
      }));
      
      toast.success(`${draggedSubject.name} - ${draggedTeacher.name} ${dayMap[day]} এ সেট করা হয়েছে`);
    }
    
    setDraggedTeacher(null);
    setDraggedSubject(null);
  };

  const handleRemoveFromSlot = (day, periodId) => {
    const key = `${day}_${periodId}`;
    setRoutineData(prev => {
      const newData = { ...prev };
      delete newData[key];
      return newData;
    });
    toast.success('রুটিন থেকে সরানো হয়েছে');
  };

  const handleSaveRoutine = async () => {
    if (!hasAddPermission) {
      toast.error('রুটিন তৈরি করার অনুমতি নেই।');
      return;
    }

    if (Object.keys(routineData).length === 0) {
      toast.error('অন্তত একটি পিরিয়ড সেট করুন');
      return;
    }

    try {
      const routineEntries = Object.values(routineData);
      
      for (const entry of routineEntries) {
        const payload = {
          day_name: entry.day,
          note: "",
          class_id: selectedClass.id,
          period_id: entry.period,
          subject_id: entry.subject.id,
          teacher_name: entry.teacher.id,
        };
        
        await createRoutine(payload).unwrap();
      }
      
      toast.success("রুটিন সফলভাবে তৈরি হয়েছে");
      setRoutineData({});
    } catch (error) {
      toast.error(`রুটিন তৈরিতে ত্রুটি: ${error.status || "অজানা"}`);
    }
  };

  if (classesLoading || allteachersLoading || periodsLoading || subjectsLoading || permissionsLoading || teacherSubjectAssignsLoading) {
    return (
      <div className="py-8 w-full relative">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="flex items-center gap-4 p-6 bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl border border-[#441a05]/20 animate-fadeIn">
            <FaSpinner className="animate-spin text-3xl text-pmColor" />
            <span className="text-lg font-medium text-[#441a05]">লোড হচ্ছে...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!hasViewPermission) {
    return <div className="p-4 text-red-400 animate-fadeIn">এই পৃষ্ঠাটি দেখার অনুমতি নেই।</div>;
  }

  return (
    <div className="py-8 w-full relative">
      <Toaster position="top-right" reverseOrder={false} />
      
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
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
          .animate-scaleIn { animation: scaleIn 0.4s ease-out forwards; }
          .animate-slideUp { animation: slideUp 0.4s ease-out forwards; }
          .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
          
          .drag-preview {
            transform: rotate(5deg);
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
          }
          
          .drop-zone {
            transition: all 0.3s ease;
            border: 2px dashed transparent;
          }
          
          .drop-zone.drag-over {
            border-color: #F4B840;
            background: rgba(244, 184, 64, 0.1);
            transform: scale(1.02);
          }
          
          .teacher-card {
            transition: all 0.3s ease;
            cursor: grab;
          }
          
          .teacher-card:active {
            cursor: grabbing;
          }
          
          .teacher-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(68, 26, 5, 0.2);
          }
          
          .glass-effect {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          .gradient-border {
            background: linear-gradient(135deg, #F4B840, #FDD663);
            padding: 2px;
            border-radius: 12px;
          }
          
          .gradient-border > div {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 10px;
          }
        `}
      </style>

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="glass-effect p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6">
            <IoCalendar className="text-4xl text-[#441a05]" />
            <h1 className="text-3xl font-bold text-[#441a05] tracking-tight">
              ক্লাস রুটিন ডিজাইনার
            </h1>
          </div>
          
          {/* Class Selection */}
          <div className="flex flex-wrap gap-3 overflow-x-auto">
            {classesLoading ? (
              <p className="text-[#441a05]/70">শ্রেণি লোড হচ্ছে...</p>
            ) : (
              classes?.map((cls, index) => (
                <button
                  key={cls.id}
                  onClick={() => handleClassSelect(cls)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 animate-scaleIn ${
                    selectedClass?.id === cls?.id
                      ? "bg-gradient-to-r from-[#F4B840] to-[#FDD663] text-[#441a05] shadow-lg transform scale-105"
                      : "bg-white/20 text-[#441a05] hover:bg-white/30 hover:transform hover:scale-105"
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {cls?.class_name} {cls?.group_name} {cls?.section_name} {cls?.shift_name}
                </button>
              ))
            )}
          </div>
        </div>

        {selectedClass && (
          <>
            {/* Day Selector */}
            <div className="glass-effect p-6 rounded-2xl mb-8 animate-slideUp">
              <h3 className="text-xl font-semibold text-[#441a05] mb-4 flex items-center gap-2">
                <IoCalendar className="text-2xl" />
                দিন নির্বাচন করুন
              </h3>
              <div className="flex flex-wrap gap-3">
                {Object.entries(dayMap).map(([engDay, banglaDay]) => (
                  <button
                    key={engDay}
                    onClick={() => setSelectedDay(engDay)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                      selectedDay === engDay
                        ? "bg-gradient-to-r from-[#F4B840] to-[#FDD663] text-[#441a05] shadow-lg"
                        : "bg-white/20 text-[#441a05] hover:bg-white/30"
                    }`}
                  >
                    {banglaDay}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Subject Cards with Teachers */}
              <div className="lg:col-span-1">
                <div className="glass-effect p-6 rounded-2xl animate-slideUp">
                  <h3 className="text-xl font-semibold text-[#441a05] mb-6 flex items-center gap-2">
                    <IoBook className="text-2xl" />
                    বিষয় ও শিক্ষক
                  </h3>
                  
                  {subjectsLoading || teacherSubjectAssignsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <FaSpinner className="animate-spin text-2xl text-[#441a05]" />
                    </div>
                  ) : subjectsWithTeachers.length === 0 ? (
                    <p className="text-red-400 text-center py-8">কোনো বিষয় পাওয়া যায়নি</p>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {subjectsWithTeachers.map((subject, index) => (
                        <div key={subject.id} className="gradient-border animate-scaleIn" 
                             style={{ animationDelay: `${index * 0.1}s` }}>
                          <div className="p-4">
                            <h4 className="font-semibold text-[#441a05] mb-3 flex items-center gap-2">
                              <IoBook className="text-lg" />
                              {subject.name}
                            </h4>
                            <div className="space-y-2">
                              {subject.teachers?.length > 0 ? (
                                subject.teachers.map((teacher) => (
                                  <div
                                    key={teacher.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, teacher, subject)}
                                    className="teacher-card flex items-center gap-3 p-3 bg-white/50 rounded-lg border border-[#441a05]/10"
                                  >
                                    <MdDragIndicator className="text-[#441a05]/60" />
                                    <IoPerson className="text-[#441a05]" />
                                    <span className="text-[#441a05] font-medium">{teacher.name}</span>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-2 text-[#441a05]/60">
                                  এই বিষয়ের জন্য কোনো শিক্ষক নিয়োগ নেই
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Routine Grid */}
              <div className="lg:col-span-2">
                <div className="glass-effect p-6 rounded-2xl animate-slideUp">
                  <h3 className="text-xl font-semibold text-[#441a05] mb-6 flex items-center gap-2">
                    <IoTime className="text-2xl" />
                    {dayMap[selectedDay]} - রুটিন
                  </h3>
                  
                  {periodsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <FaSpinner className="animate-spin text-2xl text-[#441a05]" />
                    </div>
                  ) : periods.length === 0 ? (
                    <p className="text-red-400 text-center py-8">কোনো পিরিয়ড পাওয়া যায়নি</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {periods.map((period, index) => {
                        const routineKey = `${selectedDay}_${period.id}`;
                        const assignedData = routineData[routineKey];
                        
                        return (
                          <div
                            key={period.id}
                            className={`drop-zone min-h-32 p-4 rounded-xl transition-all duration-300 animate-scaleIn ${
                              assignedData 
                                ? 'bg-gradient-to-br from-[#F4B840]/20 to-[#FDD663]/20 border-2 border-[#F4B840]' 
                                : 'bg-white/20 border-2 border-dashed border-[#441a05]/30 hover:border-[#F4B840]/50'
                            }`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, period.id, selectedDay)}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <IoTime className="text-[#441a05]" />
                                <span className="font-semibold text-[#441a05]">
                                  {period.start_time} - {period.end_time}
                                </span>
                              </div>
                              {assignedData && (
                                <button
                                  onClick={() => handleRemoveFromSlot(selectedDay, period.id)}
                                  className="text-red-500 hover:text-red-700 transition-colors"
                                  title="সরান"
                                >
                                  <FaTimes />
                                </button>
                              )}
                            </div>
                            
                            {assignedData ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 p-3 bg-white/50 rounded-lg">
                                  <IoBook className="text-[#441a05]" />
                                  <span className="font-medium text-[#441a05]">
                                    {assignedData.subject.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 p-3 bg-white/50 rounded-lg">
                                  <IoPerson className="text-[#441a05]" />
                                  <span className="font-medium text-[#441a05]">
                                    {assignedData.teacher.name}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-20 text-[#441a05]/50">
                                <p className="text-center">
                                  এখানে শিক্ষক ড্র্যাগ করুন
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Save Button */}
            {hasAddPermission && Object.keys(routineData).length > 0 && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleSaveRoutine}
                  disabled={createLoading}
                  className="relative px-8 py-4 bg-gradient-to-r from-[#F4B840] to-[#FDD663] text-[#441a05] font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                >
                  {createLoading ? (
                    <span className="flex items-center gap-3">
                      <FaSpinner className="animate-spin" />
                      সেভ করা হচ্ছে...
                    </span>
                  ) : (
                    <span className="flex items-center gap-3">
                      <IoAdd className="text-xl" />
                      রুটিন সেভ করুন
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Routine Table */}
            <div className="glass-effect p-8 rounded-2xl mt-8 animate-fadeIn shadow-xl">
              <ClassRoutineTable
                selectedClassId={selectedClass.class_id}
                periods={periods}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}