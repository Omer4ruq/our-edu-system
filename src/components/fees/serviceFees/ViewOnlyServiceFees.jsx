// components/ViewOnlyServiceFees.jsx
import { format } from 'date-fns';
import { FaBus, FaHome, FaGraduationCap } from 'react-icons/fa';
import { useGetAcademicYearApiQuery } from '../../../redux/features/api/academic-year/academicYearApi';
import { useGetGfeeSubheadsQuery } from '../../../redux/features/api/gfee-subheads/gfeeSubheadsApi';
import { useGetFeesNamesQuery } from '../../../redux/features/api/fees-name/feesName';

const ViewOnlyServiceFees = ({ selectedServiceType, setSelectedServiceType, serviceTypes }) => {
  // RTK Query hooks
  const { data: academicYears } = useGetAcademicYearApiQuery();
  const { data: feeSubheads } = useGetGfeeSubheadsQuery();
  const { data: feesName } = useGetFeesNamesQuery();

  const getIcon = (key) => {
    switch(key) {
      case 'hostel': return FaHome;
      case 'transport': return FaBus;
      case 'coaching': return FaGraduationCap;
      default: return FaHome;
    }
  };

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

  return (
    <div className="py-8 w-full relative">
      <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl animate-fadeIn shadow-xl">
        <h2 className="text-2xl font-bold text-white tracking-tight mb-6">সার্ভিস ফি কনফিগারেশন</h2>
        
        {/* Service Type Tabs - View Only */}
        <div className="mb-6 flex space-x-2">
          {serviceTypes.map((service) => {
            const IconComponent = getIcon(service.key);
            return (
              <button
                key={service.key}
                onClick={() => setSelectedServiceType(service.key)}
                className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 ${
                  selectedServiceType === service.key
                    ? `${service.color} text-white`
                    : 'bg-gray-500/20 text-white hover:bg-gray-500/30'
                }`}
              >
                <IconComponent className="w-4 h-4 mr-2" />
                {service.label}
              </button>
            );
          })}
        </div>

        {filteredFeesName?.length === 0 ? (
          <p className="p-4 text-white/70">কোনো {serviceTypes.find(s => s.key === selectedServiceType)?.label} ফি কনফিগারেশন পাওয়া যায়নি।</p>
        ) : (
          <div className="mb-6 bg-white/5 rounded-lg overflow-x-auto">
            <h3 className="text-lg font-semibold text-white p-4 border-b border-white/20">
              {serviceTypes.find(s => s.key === selectedServiceType)?.label} ফি কনফিগারেশন
            </h3>
            <table className="w-full border-collapse">
              <thead className="bg-white/10">
                <tr>
                  <th className="border border-white/20 p-3 text-left text-sm font-medium text-white/70">ফি টাইটেল</th>
                  <th className="border border-white/20 p-3 text-left text-sm font-medium text-white/70">শিক্ষাবর্ষ</th>
                  <th className="border border-white/20 p-3 text-left text-sm font-medium text-white/70">ফি সাবহেড</th>
                  <th className="border border-white/20 p-3 text-left text-sm font-medium text-white/70">শুরুর তারিখ</th>
                  <th className="border border-white/20 p-3 text-left text-sm font-medium text-white/70">শেষের তারিখ</th>
                  <th className="border border-white/20 p-3 text-left text-sm font-medium text-white/70">সার্ভিস ধরন</th>
                  <th className="border border-white/20 p-3 text-left text-sm font-medium text-white/70">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {filteredFeesName?.map((fee, index) => {
                  const subheadName = feeSubheads?.find((s) => s.id === fee.fees_sub_type)?.name || 'অজানা';
                  const academicYearName = academicYears?.find((y) => y.id === fee.academic_year)?.name || 'অজানা';
                  const serviceDisplay = getServiceTypeDisplay(fee);
                  return (
                    <tr key={index} className="bg-white/5 animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                      <td className="border border-white/20 p-3 text-sm text-white">{fee.fees_title}</td>
                      <td className="border border-white/20 p-3 text-sm text-white">{academicYearName}</td>
                      <td className="border border-white/20 p-3 text-sm text-white">{subheadName}</td>
                      <td className="border border-white/20 p-3 text-sm text-white">{format(new Date(fee.startdate), 'dd-MM-yyyy')}</td>
                      <td className="border border-white/20 p-3 text-sm text-white">{format(new Date(fee.enddate), 'dd-MM-yyyy')}</td>
                      <td className="border border-white/20 p-3 text-sm text-white">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${serviceDisplay.color} text-white`}
                        >
                          {serviceDisplay.label}
                        </span>
                      </td>
                      <td className="border border-white/20 p-3 text-sm text-white">{fee.status === 'ACTIVE' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewOnlyServiceFees;