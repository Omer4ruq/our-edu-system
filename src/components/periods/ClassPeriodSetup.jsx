import React, { useState, useRef, useEffect } from "react";
import { FaSpinner, FaTrash, FaEdit, FaClock, FaChevronDown, FaSave, FaTimes } from "react-icons/fa";
import { IoAddCircle } from "react-icons/io5";
import { Toaster, toast } from "react-hot-toast";
import { useGetclassConfigApiQuery } from "../../redux/features/api/class/classConfigApi";
import {
  useCreateClassPeriodMutation,
  useGetClassPeriodsByClassIdQuery,
  usePatchClassPeriodMutation,
} from "../../redux/features/api/periods/classPeriodsApi";
// import { useGetGperiodsQuery } from "../../redux/features/api/periods/gPeriodsApi"; // New import
import { useSelector } from "react-redux";
import { useGetGroupPermissionsQuery } from "../../redux/features/api/permissionRole/groupsApi";
import { useGetGperiodsQuery } from "../../redux/features/api/periods/gperiodApi";

// Enhanced Time Input Component (same as before)
const EnhancedTimeInput = ({ value, onChange, label, className = "", disabled = false }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Format time to 12-hour display
  const formatTime12Hour = (time24) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const period = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${period}`;
  };

  // Generate time options (every 15 minutes)
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        const displayStr = formatTime12Hour(timeStr);
        options.push({ value: timeStr, display: displayStr });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  // Handle input change with validation
  const handleInputChange = (e) => {
    let value = e.target.value;
    
    // Remove any non-digit and non-colon characters
    value = value.replace(/[^\d:]/g, '');
    
    // Auto-format as user types
    if (value.length === 2 && !value.includes(':')) {
      value = value + ':';
    }
    
    // Limit to HH:MM format
    if (value.length > 5) {
      value = value.substring(0, 5);
    }
    
    setInputValue(value);
    
    // Validate and update parent component
    if (value.length === 5 && value.includes(':')) {
      const [hours, minutes] = value.split(':');
      const h = parseInt(hours);
      const m = parseInt(minutes);
      
      if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        onChange(value);
      }
    }
  };

  // Handle input blur - format the time properly
  const handleInputBlur = () => {
    if (inputValue.length === 5 && inputValue.includes(':')) {
      const [hours, minutes] = inputValue.split(':');
      const h = parseInt(hours);
      const m = parseInt(minutes);
      
      if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        const formattedTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        setInputValue(formattedTime);
        onChange(formattedTime);
      } else {
        setInputValue(value);
      }
    } else {
      setInputValue(value);
    }
  };

  // Handle time selection from dropdown
  const handleTimeSelect = (selectedTime) => {
    setInputValue(selectedTime);
    onChange(selectedTime);
    setIsDropdownOpen(false);
    // Focus back to input after selection
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 100);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [isDropdownOpen]);

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <label className="block text-sm font-medium text-[#441a05] mb-2">
        {label}
      </label>
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={(e) => {
            inputRef.current?.select();
          }}
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.select();
          }}
          placeholder="HH:MM"
          maxLength="5"
          disabled={disabled}
          className="w-full pl-10 pr-20 py-3 border border-[#9d9087] rounded-lg bg-white/10 backdrop-blur-sm text-[#441a05] hover:bg-white/20 focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-300 font-medium text-center disabled:opacity-50 disabled:cursor-not-allowed"
        />
        
        <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#441a05]/60" />
        
        {!disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDropdownOpen(!isDropdownOpen);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#441a05]/60 hover:text-[#441a05] transition-colors p-1 z-10"
          >
            <FaChevronDown className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
        )}
        
        {value && (
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2 text-xs text-[#441a05]/70 bg-amber-100 px-2 py-1 rounded">
            {formatTime12Hour(value)}
          </div>
        )}
      </div>

      {isDropdownOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white/95 border border-[#9d9087]/30 rounded-lg shadow-2xl max-h-60 overflow-y-auto backdrop-blur-lg">
          <div className="p-3 border-b border-[#9d9087]/20">
            <p className="text-xs font-medium text-[#441a05]/70 mb-2">দ্রুত নির্বাচন</p>
            <div className="grid grid-cols-4 gap-1">
              {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'].map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => handleTimeSelect(time)}
                  className="px-2 py-1 text-xs bg-amber-100 hover:bg-amber-200 text-[#441a05] rounded transition-colors"
                >
                  {formatTime12Hour(time)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="max-h-40 overflow-y-auto">
            {timeOptions.map(({ value: optionValue, display }) => (
              <button
                key={optionValue}
                type="button"
                onClick={() => handleTimeSelect(optionValue)}
                className={`w-full text-left px-4 py-2 hover:bg-amber-50 transition-colors text-sm ${
                  value === optionValue ? 'bg-amber-100 text-[#441a05] font-medium' : 'text-[#441a05]'
                }`}
              >
                <span className="font-medium">{optionValue}</span>
                <span className="ml-2 text-xs text-[#441a05]/60">({display})</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Period Card Component
const PeriodCard = ({ period, existingPeriod, onTimeChange, onBreakChange, onSave, onCancel, hasPermission, isLoading }) => {
  const calculateDuration = (start, end) => {
    if (!start || !end) return "";
    const [startHours, startMinutes] = start.split(':').map(Number);
    const [endHours, endMinutes] = end.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    const durationMinutes = endTotalMinutes - startTotalMinutes;
    
    if (durationMinutes <= 0) return "Invalid";
    
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    return hours > 0 ? `${hours}ঘ ${minutes}মি` : `${minutes}মি`;
  };

  const isValid = existingPeriod?.start_time && existingPeriod?.end_time && existingPeriod.start_time < existingPeriod.end_time;
  const hasChanges = existingPeriod?.start_time || existingPeriod?.end_time || existingPeriod?.break_time !== undefined;

  return (
    <div className="bg-white/20 backdrop-blur-sm border border-[#441a05]/30 rounded-xl p-6 hover:bg-white/30 transition-all duration-300 animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#441a05] flex items-center">
          <span className="bg-pmColor/30 text-[#441a05] rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
            {period.sl}
          </span>
          {period.name}
        </h3>
        <div className="flex items-center space-x-2">
          {hasChanges && hasPermission && (
            <>
              <button
                onClick={() => onSave(period.id)}
                disabled={!isValid || isLoading}
                className={`px-3 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 ${
                  isValid && !isLoading
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                }`}
                title="সেভ করুন / Save"
              >
                {isLoading ? (
                  <FaSpinner className="w-4 h-4 animate-spin" />
                ) : (
                  <FaSave className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => onCancel(period.id)}
                disabled={isLoading}
                className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-300"
                title="বাতিল করুন / Cancel"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {hasPermission ? (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <EnhancedTimeInput
              value={existingPeriod?.start_time || ""}
              onChange={(time) => onTimeChange(period.id, 'start_time', time)}
              label="শুরুর সময়"
              disabled={isLoading}
            />
            
            <EnhancedTimeInput
              value={existingPeriod?.end_time || ""}
              onChange={(time) => onTimeChange(period.id, 'end_time', time)}
              label="শেষের সময়"
              disabled={isLoading}
            />
          </div>

          {/* Duration Display */}
          {existingPeriod?.start_time && existingPeriod?.end_time && (
            <div className="bg-amber-100/50 border border-amber-300/50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-[#441a05] font-medium text-sm">সময়কাল:</span>
                <span className={`font-bold text-sm ${
                  calculateDuration(existingPeriod.start_time, existingPeriod.end_time) === "Invalid" 
                    ? "text-red-600" 
                    : "text-green-700"
                }`}>
                  {calculateDuration(existingPeriod.start_time, existingPeriod.end_time)}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={existingPeriod?.break_time || false}
                onChange={(e) => onBreakChange(period.id, e.target.checked)}
                className="hidden"
                disabled={isLoading}
              />
              <span
                className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 ${
                  existingPeriod?.break_time
                    ? "bg-pmColor border-pmColor"
                    : "bg-[#441a05]/10 border-[#9d9087] hover:border-[#441a05]"
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {existingPeriod?.break_time && (
                  <svg
                    className="w-4 h-4 text-[#441a05]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </span>
              <span className="ml-3 text-sm text-[#441a05]">
                বিরতির সময়
              </span>
            </label>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-[#441a05]/60">
          <p>পিরিয়ড সম্পাদনার অনুমতি নেই</p>
        </div>
      )}
    </div>
  );
};

const ClassPeriodSetup = () => {
  const { user, group_id } = useSelector((state) => state.auth);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [periodData, setPeriodData] = useState({}); // Store period configurations
  const [savingPeriods, setSavingPeriods] = useState(new Set()); // Track which periods are being saved

  // Permissions hook
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });

  // Permission checks
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_periodconfig') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_periodconfig') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_periodconfig') || false;

  // Fetch classes
  const { data: classes = [], isLoading: isClassesLoading } = useGetclassConfigApiQuery();

  // Fetch general periods
  const { data: gPeriods = [], isLoading: isGPeriodsLoading } = useGetGperiodsQuery();

  // Fetch existing periods for selected class
  const {
    data: existingPeriods = [],
    isLoading: isPeriodsLoading,
    refetch: refetchPeriods,
  } = useGetClassPeriodsByClassIdQuery(selectedClassId, {
    skip: !selectedClassId,
  });

  // Mutations
  const [createClassPeriod, { isLoading: isCreating }] = useCreateClassPeriodMutation();
  const [patchClassPeriod] = usePatchClassPeriodMutation();

  // Handle time change for a specific period
  const handleTimeChange = (periodId, timeType, value) => {
    setPeriodData(prev => ({
      ...prev,
      [periodId]: {
        ...prev[periodId],
        [timeType]: value
      }
    }));
  };

  // Handle break time change for a specific period
  const handleBreakChange = (periodId, isBreak) => {
    setPeriodData(prev => ({
      ...prev,
      [periodId]: {
        ...prev[periodId],
        break_time: isBreak
      }
    }));
  };

  // Save individual period
  const handleSavePeriod = async (periodId) => {
    const periodConfig = periodData[periodId];
    if (!periodConfig || !periodConfig.start_time || !periodConfig.end_time) {
      toast.error("দয়া করে শুরু এবং শেষের সময় প্রদান করুন।");
      return;
    }

    if (periodConfig.start_time >= periodConfig.end_time) {
      toast.error("শুরুর সময় অবশ্যই শেষের সময়ের আগে হতে হবে!");
      return;
    }

    setSavingPeriods(prev => new Set([...prev, periodId]));

    try {
      // Check if period already exists
      const existingPeriod = existingPeriods.find(p => p.period_id === periodId);
      
      if (existingPeriod) {
        // Update existing period
        await patchClassPeriod({
          id: existingPeriod.id, // Use the database ID, not period_id
          start_time: `${periodConfig.start_time}:00`,
          end_time: `${periodConfig.end_time}:00`,
          break_time: periodConfig.break_time || false,
        }).unwrap();
        toast.success("পিরিয়ড সফলভাবে আপডেট করা হয়েছে!");
      } else {
        // Create new period
        const payload = {
          class_id: parseInt(selectedClassId, 10),
          periods: [
            {
              period_id: periodId,
              start_time: `${periodConfig.start_time}:00`,
              end_time: `${periodConfig.end_time}:00`,
              break_time: periodConfig.break_time || false,
            },
          ],
        };

        await createClassPeriod(payload).unwrap();
        toast.success("পিরিয়ড সফলভাবে যোগ করা হয়েছে!");
      }

      // Clear the period data after successful save
      setPeriodData(prev => {
        const newData = { ...prev };
        delete newData[periodId];
        return newData;
      });

      refetchPeriods();
    } catch (error) {
      console.error("পিরিয়ড সেভ করতে ত্রুটি:", error);
      const errorMessage =
        error?.data?.detail ||
        error?.data?.message ||
        "পিরিয়ড সেভ করতে ব্যর্থ।";
      toast.error(errorMessage);
    } finally {
      setSavingPeriods(prev => {
        const newSet = new Set(prev);
        newSet.delete(periodId);
        return newSet;
      });
    }
  };

  // Cancel period editing
  const handleCancelPeriod = (periodId) => {
    setPeriodData(prev => {
      const newData = { ...prev };
      delete newData[periodId];
      return newData;
    });
  };

  // Reset period data when class changes
  useEffect(() => {
    setPeriodData({});
  }, [selectedClassId]);

  // Initialize period data with existing periods
  useEffect(() => {
    if (existingPeriods.length > 0) {
      const initialData = {};
      existingPeriods.forEach(period => {
        initialData[period.period_id] = {
          start_time: period.start_time.slice(0, 5),
          end_time: period.end_time.slice(0, 5),
          break_time: period.break_time
        };
      });
      setPeriodData(initialData);
    }
  }, [existingPeriods]);

  if (isClassesLoading || permissionsLoading || isGPeriodsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-black/10 backdrop-blur-sm rounded-xl shadow-lg p-8 flex items-center space-x-4 animate-fadeIn">
          <FaSpinner className="animate-spin text-2xl text-[#441a05]" />
          <span className="text-[#441a05] font-medium">লোড হচ্ছে...</span>
        </div>
      </div>
    );
  }

  if (!hasViewPermission) {
    return <div className="p-4 text-red-400 animate-fadeIn">এই পৃষ্ঠাটি দেখার অনুমতি নেই।</div>;
  }

  return (
    <div className="py-8">
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
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
          .animate-scaleIn {
            animation: scaleIn 0.4s ease-out forwards;
          }
          /* Custom scrollbar styles */
          .overflow-y-auto::-webkit-scrollbar {
            width: 6px;
          }
          .overflow-y-auto::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
          }
          .overflow-y-auto::-webkit-scrollbar-thumb {
            background: #d97706;
            border-radius: 3px;
          }
          .overflow-y-auto::-webkit-scrollbar-thumb:hover {
            background: #b45309;
          }
        `}
      </style>

      <div className="">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6 animate-fadeIn ml-5">
          <IoAddCircle className="text-4xl text-[#441a05]" />
          <h1 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">
            ক্লাস ঘন্টা সেটআপ
          </h1>
        </div>

        {/* Class Selection */}
        <div className="mb-6">
          <div className="border-b border-[#441a05]/20 bg-black/10 backdrop-blur-sm rounded-lg p-2">
            <h2 className="text-xl font-semibold text-[#441a05] mb-4 flex items-center px-5 pt-3">
              <span className="bg-pmColor/20 text-[#441a05] rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                ১
              </span>
              ক্লাস নির্বাচন করুন
            </h2>
            <nav className="flex space-x-4 overflow-x-auto px-5 pb-5">
              {isClassesLoading ? (
                <span className="text-[#441a05]/70 p-4 animate-fadeIn">
                  ক্লাস লোড হচ্ছে...
                </span>
              ) : classes.length === 0 ? (
                <span className="text-[#441a05]/70 p-4 animate-fadeIn">
                  কোনো সক্রিয় ক্লাস পাওয়া যায়নি
                </span>
              ) : (
                classes.map((cls, index) => (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClassId(cls.id)}
                    className={`whitespace-nowrap py-2 px-4 font-medium text-sm rounded-md transition-all duration-300 animate-scaleIn ${
                      selectedClassId === cls.id
                        ? "bg-pmColor text-[#441a05] shadow-md"
                        : "text-[#441a05] hover:bg-[#441a05]/10 hover:text-[#441a05]"
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {`${cls.class_name} ${cls.group_name ? ` ${cls.group_name}` : ''} ${cls.section_name ? ` ${cls.section_name}` : ''}${cls.shift_name ? ` ${cls.shift_name}` : ''}`}
                  </button>
                ))
              )}
            </nav>
          </div>
        </div>

        {/* Period Cards */}
        {selectedClassId && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-[#441a05] mb-4 flex items-center ml-5">
              <span className="bg-pmColor/20 text-[#441a05] rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                ২
              </span>
              পিরিয়ড সময় নির্ধারণ করুন
            </h2>
            
            {isPeriodsLoading ? (
              <div className="text-center animate-fadeIn p-8">
                <FaSpinner className="inline-block animate-spin text-2xl text-[#441a05] mb-2" />
                <p className="text-[#441a05]/70">বিদ্যমান পিরিয়ড লোড হচ্ছে...</p>
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 gap-6 px-5">
                {gPeriods.map((period, index) => {
                  const existingPeriod = periodData[period.id];
                  return (
                    <PeriodCard
                      key={period.id}
                      period={period}
                      existingPeriod={existingPeriod}
                      onTimeChange={handleTimeChange}
                      onBreakChange={handleBreakChange}
                      onSave={handleSavePeriod}
                      onCancel={handleCancelPeriod}
                      hasPermission={hasAddPermission || hasChangePermission}
                      isLoading={savingPeriods.has(period.id)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Existing Periods Summary */}
        {selectedClassId && existingPeriods.length > 0 && (
          <div className="mt-10 bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-hidden">
            <h2 className="text-lg font-semibold text-[#441a05] p-6 border-b border-[#441a05]/20">
              সংরক্ষিত পিরিয়ডসমূহ ({existingPeriods.length})
            </h2>
            <div className="max-h-96 overflow-y-auto">
              <div className="space-y-2 p-6">
                {[...existingPeriods]
                  .sort((a, b) => a.period_id - b.period_id)
                  .map((period, index) => {
                    const gPeriod = gPeriods.find(gp => gp.id === period.period_id);
                    const calculateDuration = (start, end) => {
                      const [startHours, startMinutes] = start.split(':').map(Number);
                      const [endHours, endMinutes] = end.split(':').map(Number);
                      
                      const startTotalMinutes = startHours * 60 + startMinutes;
                      const endTotalMinutes = endHours * 60 + endMinutes;
                      
                      const durationMinutes = endTotalMinutes - startTotalMinutes;
                      
                      if (durationMinutes <= 0) return "Invalid";
                      
                      const hours = Math.floor(durationMinutes / 60);
                      const minutes = durationMinutes % 60;
                      
                      return hours > 0 ? `${hours}ঘ ${minutes}মি` : `${minutes}মি`;
                    };

                    return (
                      <div
                        key={period.id}
                        className="border border-[#441a05]/20 p-4 rounded-lg bg-[#441a05]/5 hover:bg-[#441a05]/10 transition-all duration-300 animate-fadeIn"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-4">
                            <span className="bg-pmColor/30 text-[#441a05] rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                              {gPeriod?.sl || period.period_id}
                            </span>
                            <div>
                              <h4 className="font-medium text-[#441a05]">
                                {gPeriod?.name || `Period ${period.period_id}`}
                              </h4>
                              <p className="text-sm text-[#441a05]/70">
                                {period.start_time} - {period.end_time}
                                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                  {calculateDuration(period.start_time.slice(0, 5), period.end_time.slice(0, 5))}
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              period.break_time 
                                ? 'bg-green-200 text-green-800' 
                                : 'bg-gray-200 text-gray-800'
                            }`}>
                              {period.break_time ? "বিরতি" : "ক্লাস"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassPeriodSetup;