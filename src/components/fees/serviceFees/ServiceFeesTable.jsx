// components/ServiceFeesTable.jsx
import { format } from 'date-fns';
import { FaEdit, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useGetAcademicYearApiQuery } from '../../../redux/features/api/academic-year/academicYearApi';
import { useGetGfeeSubheadsQuery } from '../../../redux/features/api/gfee-subheads/gfeeSubheadsApi';
import { useGetFeesNamesQuery } from '../../../redux/features/api/fees-name/feesName';

const ServiceFeesTable = ({ 
  selectedServiceType, 
  serviceTypes,
  hasChangePermission,
  hasDeletePermission,
  setSelectedFee,
  setIsUpdateModalOpen,
  setIsDeleteModalOpen
}) => {
  
  // RTK Query hooks
  const { data: academicYears, isLoading: yearsLoading } = useGetAcademicYearApiQuery();
  const { data: feeSubheads, isLoading: subheadsLoading } = useGetGfeeSubheadsQuery();
  const { data: feesName, isLoading: feesLoading } = useGetFeesNamesQuery();

  // Get service type display info
  const getServiceTypeDisplay = (fee) => {
    if (fee.is_hostel_fee) return { label: 'হোস্টেল', color: 'bg-blue-500' };
    if (fee.is_transport_fee) return { label: 'ট্রান্সপোর্ট', color: 'bg-green-500' };
    if (fee.is_coaching_fee) return { label: 'কোচিং', color: 'bg-purple-500' };
    return { label: 'অজানা', color: 'bg-gray-500' };
  };

  // Filter fees based on service type for display
  const filteredFeesName = feesName?.filter((fee) => {
    if (selectedServiceType === 'hostel') return fee.is_hostel_fee;
    if (selectedServiceType === 'transport') return fee.is_transport_fee;
    if (selectedServiceType === 'coaching') return fee.is_coaching_fee;
    return false;
  }) || [];

  // Open update modal
  const handleOpenUpdateModal = (fee) => {
    if (!hasChangePermission) {
      toast.error('ফি কনফিগারেশন আপডেট করার অনুমতি নেই।');
      return;
    }
    setSelectedFee(fee);
    setIsUpdateModalOpen(true);
  };

  // Open delete confirmation modal
  const handleOpenDeleteModal = (fee) => {
    if (!hasDeletePermission) {
      toast.error('ফি কনফিগারেশন মুছে ফেলার অনুমতি নেই।');
      return;
    }
    setSelectedFee(fee);
    setIsDeleteModalOpen(true);
  };

  if (yearsLoading || subheadsLoading || feesLoading) {
    return <div className="p-4 text-[#441a05]/70 animate-fadeIn">টেবিল লোড হচ্ছে...</div>;
  }

  return (
    <div className="mb-6 bg-[#441a05]/5 rounded-lg overflow-x-auto">
      <h3 className="text-lg font-semibold text-[#441a05]p-4 border-b border-[#441a05]/20">
        {serviceTypes.find(s => s.key === selectedServiceType)?.label} ফি কনফিগারেশন
      </h3>
      {filteredFeesName?.length === 0 ? (
        <p className="p-4 text-[#441a05]/70">কোনো {serviceTypes.find(s => s.key === selectedServiceType)?.label} ফি কনফিগারেশন পাওয়া যায়নি।</p>
      ) : (
        <table className="w-full border-collapse">
          <thead className="bg-[#441a05]/10">
            <tr>
              <th className="border border-[#441a05]/20 p-3 text-left text-sm font-medium text-[#441a05]/70">ফি টাইটেল</th>
              <th className="border border-[#441a05]/20 p-3 text-left text-sm font-medium text-[#441a05]/70">শিক্ষাবর্ষ</th>
              <th className="border border-[#441a05]/20 p-3 text-left text-sm font-medium text-[#441a05]/70">ফি সাবহেড</th>
              <th className="border border-[#441a05]/20 p-3 text-left text-sm font-medium text-[#441a05]/70">শুরুর তারিখ</th>
              <th className="border border-[#441a05]/20 p-3 text-left text-sm font-medium text-[#441a05]/70">শেষের তারিখ</th>
              <th className="border border-[#441a05]/20 p-3 text-left text-sm font-medium text-[#441a05]/70">সার্ভিস ধরন</th>
              <th className="border border-[#441a05]/20 p-3 text-left text-sm font-medium text-[#441a05]/70">স্ট্যাটাস</th>
              {(hasChangePermission || hasDeletePermission) && (
                <th className="border border-[#441a05]/20 p-3 text-left text-sm font-medium text-[#441a05]/70">ক্রিয়া</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#441a05]/20">
            {filteredFeesName?.map((fee, index) => {
              const subheadName = feeSubheads?.find((s) => s.id === fee.fees_sub_type)?.name || 'অজানা';
              const academicYearName = academicYears?.find((y) => y.id === fee.academic_year)?.name || 'অজানা';
              const serviceDisplay = getServiceTypeDisplay(fee);
              return (
                <tr key={index} className="bg-[#441a05]/5 animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                  <td className="border border-[#441a05]/20 p-3 text-sm text-[#441a05]">{fee.fees_title}</td>
                  <td className="border border-[#441a05]/20 p-3 text-sm text-[#441a05]">{academicYearName}</td>
                  <td className="border border-[#441a05]/20 p-3 text-sm text-[#441a05]">{subheadName}</td>
                  <td className="border border-[#441a05]/20 p-3 text-sm text-[#441a05]">{format(new Date(fee.startdate), 'dd-MM-yyyy')}</td>
                  <td className="border border-[#441a05]/20 p-3 text-sm text-[#441a05]">{format(new Date(fee.enddate), 'dd-MM-yyyy')}</td>
                  <td className="border border-[#441a05]/20 p-3 text-sm text-[#441a05]">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${serviceDisplay.color} text-[#441a05]`}
                    >
                      {serviceDisplay.label}
                    </span>
                  </td>
                  <td className="border border-[#441a05]/20 p-3 text-sm text-[#441a05]">{fee.status === 'ACTIVE' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</td>
                  {(hasChangePermission || hasDeletePermission) && (
                    <td className="border border-[#441a05]/20 p-3 text-sm text-[#441a05]">
                      <div className="flex space-x-2">
                        {hasChangePermission && (
                          <button
                            onClick={() => handleOpenUpdateModal(fee)}
                            className="p-2 bg-blue-500/20 text-blue-500 rounded-lg hover:bg-blue-500/30 transition-colors duration-300"
                            aria-label={`আপডেট করুন ${fee.fees_title}`}
                          >
                            <FaEdit />
                          </button>
                        )}
                        {hasDeletePermission && (
                          <button
                            onClick={() => handleOpenDeleteModal(fee)}
                            className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors duration-300"
                            aria-label={`মুছে ফেলুন ${fee.fees_title}`}
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ServiceFeesTable;