// components/ServiceFeesForm.jsx
import { useState } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useGetAcademicYearApiQuery } from '../../../redux/features/api/academic-year/academicYearApi';
import { useGetGfeeSubheadsQuery } from '../../../redux/features/api/gfee-subheads/gfeeSubheadsApi';

const ServiceFeesForm = ({ 
  selectedServiceType, 
  configurations, 
  setConfigurations, 
  serviceTypes,
  getServiceFlags,
  hasAddPermission,
  hasChangePermission 
}) => {
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedFeeSubheads, setSelectedFeeSubheads] = useState([]);
  const [errors, setErrors] = useState({});

  // RTK Query hooks
  const { data: academicYears, isLoading: yearsLoading } = useGetAcademicYearApiQuery();
  const { data: feeSubheads, isLoading: subheadsLoading } = useGetGfeeSubheadsQuery();

  // Handle fee subhead checkbox
  const handleFeeSubheadChange = (subheadId) => {
    if (!hasAddPermission) {
      toast.error('ফি সাবহেড নির্বাচন করার অনুমতি নেই।');
      return;
    }
    setSelectedFeeSubheads((prev) =>
      prev.includes(subheadId)
        ? prev.filter((id) => id !== subheadId)
        : [...prev, subheadId]
    );
    setErrors((prev) => ({ ...prev, feeSubheads: null }));
  };

  // Validate form inputs for adding configuration
  const validateForm = () => {
    const newErrors = {};
    if (!selectedAcademicYear) newErrors.academicYear = 'শিক্ষাবর্ষ নির্বাচন করুন';
    if (selectedFeeSubheads.length === 0) newErrors.feeSubheads = 'অন্তত একটি ফি সাবহেড নির্বাচন করুন';
    return Object.keys(newErrors).length ? newErrors : null;
  };

  // Add selected configuration
  const addConfiguration = () => {
    if (!hasAddPermission) {
      toast.error('কনফিগারেশন যোগ করার অনুমতি নেই।');
      return;
    }
    const validationErrors = validateForm();
    if (validationErrors) {
      setErrors(validationErrors);
      toast.error('অনুগ্রহ করে সকল প্রয়োজনীয় ক্ষেত্র পূরণ করুন।');
      return;
    }

    const serviceLabel = serviceTypes.find(s => s.key === selectedServiceType)?.label || selectedServiceType;
    const newConfigs = selectedFeeSubheads.map((subId) => {
      const sub = feeSubheads?.find((s) => s.id === subId);
      return {
        subheadId: subId,
        subheadName: sub?.name || 'অজানা',
        academicYear: selectedAcademicYear,
        startDate: '',
        endDate: '',
        serviceType: selectedServiceType,
        serviceLabel: serviceLabel,
        ...getServiceFlags(selectedServiceType),
      };
    });

    setConfigurations((prev) => [...prev, ...newConfigs]);
    setSelectedFeeSubheads([]);
    toast.success('কনফিগারেশন সফলভাবে যোগ করা হয়েছে!');
  };

  // Update date for a specific configuration
  const updateConfigDate = (index, field, value) => {
    if (!hasAddPermission && !hasChangePermission) {
      toast.error('কনফিগারেশন আপডেট করার অনুমতি নেই।');
      return;
    }
    setConfigurations((prev) =>
      prev.map((config, i) =>
        i === index ? { ...config, [field]: value } : config
      )
    );
  };

  if (yearsLoading || subheadsLoading) {
    return <div className="p-4 text-[#441a05]/70 animate-fadeIn">ফর্ম লোড হচ্ছে...</div>;
  }

  return (
    <div>
      {/* Academic Year Select */}
      {hasAddPermission && (
        <div className="mb-6">
          <select
            value={selectedAcademicYear}
            onChange={(e) => {
              setSelectedAcademicYear(e.target.value);
              setErrors((prev) => ({ ...prev, academicYear: null }));
            }}
            className="w-full max-w-xs bg-transparent text-[#441a05]pl-3 py-2 border outline-none border-[#9d9087] rounded-lg transition-all duration-300"
            aria-describedby={errors.academicYear ? 'academicYear-error' : undefined}
          >
            <option value="" disabled>শিক্ষাবর্ষ নির্বাচন করুন</option>
            {academicYears?.map((year) => (
              <option key={year.id} value={year.id}>{year.name}</option>
            ))}
          </select>
          {errors.academicYear && (
            <p id="academicYear-error" className="text-red-400 text-sm mt-2">{errors.academicYear}</p>
          )}
        </div>
      )}

      {/* Fee Subheads Selection */}
      {hasAddPermission && (
        <div className="mb-6">
          <div className="bg-[#441a05]/5 rounded-lg overflow-x-auto">
            <h4 className="text-lg font-semibold text-[#441a05]p-4 border-b border-[#441a05]/20">ফি সাবহেড নির্বাচন করুন</h4>
            <div className="p-4 grid grid-cols-3 gap-4">
              {feeSubheads?.length === 0 ? (
                <p className="text-[#441a05]/70 col-span-3">কোনো ফি সাবহেড পাওয়া যায়নি।</p>
              ) : (
                feeSubheads?.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFeeSubheads.includes(sub.id)}
                        onChange={() => handleFeeSubheadChange(sub.id)}
                        className="hidden"
                        aria-label={`ফি সাবহেড নির্বাচন করুন ${sub.name}`}
                      />
                      <span
                        className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 ${
                          selectedFeeSubheads.includes(sub.id)
                            ? 'bg-pmColor border-pmColor'
                            : 'bg-[#441a05]/10 border-[#9d9087] hover:border-[#441a05]'
                        }`}
                      >
                        {selectedFeeSubheads.includes(sub.id) && (
                          <svg
                            className="w-4 h-4 text-[#441a05]animate-scaleIn"
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
                    </label>
                    <span className="text-[#441a05]">{sub.name}</span>
                  </div>
                ))
              )}
            </div>
            {errors.feeSubheads && (
              <p className="text-red-400 text-sm p-4 pt-0">{errors.feeSubheads}</p>
            )}
          </div>
        </div>
      )}

      {/* Configuration Add Button */}
      {hasAddPermission && (
        <div className="mb-6">
          <button
            onClick={addConfiguration}
            className={`flex items-center w-full max-w-xs px-6 py-3 rounded-lg font-medium bg-pmColor text-[#441a05]transition-all duration-300 animate-scaleIn ${
              !selectedAcademicYear || selectedFeeSubheads.length === 0
                ? 'cursor-not-allowed opacity-70'
                : 'hover:text-[#441a05]btn-glow'
            }`}
            disabled={!selectedAcademicYear || selectedFeeSubheads.length === 0}
          >
            <FaCheckCircle className="w-5 h-5 mr-2" />
            কনফিগারেশন যোগ করুন
          </button>
        </div>
      )}

      {/* Configurations Table */}
      {(hasAddPermission || hasChangePermission) && configurations.length > 0 && (
        <div className="mb-6 bg-[#441a05]/5 rounded-lg overflow-x-auto">
          <h3 className="text-lg font-semibold text-[#441a05]p-4 border-b border-[#441a05]/20">নির্বাচিত কনফিগারেশন</h3>
          <table className="w-full border-collapse">
            <thead className="bg-[#441a05]/10">
              <tr>
                <th className="border border-[#441a05]/20 p-3 text-left text-sm font-medium text-[#441a05]/70">ফি সাবহেড</th>
                <th className="border border-[#441a05]/20 p-3 text-left text-sm font-medium text-[#441a05]/70">শিক্ষাবর্ষ</th>
                <th className="border border-[#441a05]/20 p-3 text-left text-sm font-medium text-[#441a05]/70">সার্ভিস ধরন</th>
                <th className="border border-[#441a05]/20 p-3 text-left text-sm font-medium text-[#441a05]/70">শুরুর তারিখ</th>
                <th className="border border-[#441a05]/20 p-3 text-left text-sm font-medium text-[#441a05]/70">শেষের তারিখ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#441a05]/20">
              {configurations.map((config, index) => (
                <tr key={index} className="bg-[#441a05]/5 animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                  <td className="border border-[#441a05]/20 p-3 text-sm text-[#441a05]">{config.subheadName}</td>
                  <td className="border border-[#441a05]/20 p-3 text-sm text-[#441a05]">
                    {academicYears?.find((y) => y.id === parseInt(config.academicYear))?.name || config.academicYear}
                  </td>
                  <td className="border border-[#441a05]/20 p-3 text-sm text-[#441a05]">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        config.serviceType === 'hostel' ? 'bg-blue-500' :
                        config.serviceType === 'transport' ? 'bg-green-500' :
                        config.serviceType === 'coaching' ? 'bg-purple-500' : 'bg-gray-500'
                      } text-[#441a05]`}
                    >
                      {config.serviceLabel}
                    </span>
                  </td>
                  <td className="border border-[#441a05]/20 p-3 text-sm text-[#441a05]">
                    <input
                      type="date"
                      value={config.startDate}
                      onChange={(e) => updateConfigDate(index, 'startDate', e.target.value)}
                      className="w-full bg-transparent text-[#441a05]pl-3 py-2 border border-[#9d9087] rounded-lg"
                    />
                  </td>
                  <td className="border border-[#441a05]/20 p-3 text-sm text-[#441a05]">
                    <input
                      type="date"
                      value={config.endDate}
                      onChange={(e) => updateConfigDate(index, 'endDate', e.target.value)}
                      className="w-full bg-transparent text-[#441a05]pl-3 py-2 border border-[#9d9087] rounded-lg"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ServiceFeesForm;