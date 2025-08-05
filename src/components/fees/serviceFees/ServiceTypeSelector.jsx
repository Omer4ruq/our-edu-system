// components/ServiceTypeSelector.jsx
import { FaBus, FaHome, FaGraduationCap } from 'react-icons/fa';
import { IoAddCircle } from 'react-icons/io5';
import toast from 'react-hot-toast';

const ServiceTypeSelector = ({ 
  selectedServiceType, 
  setSelectedServiceType, 
  serviceTypes, 
  configurations,
  setConfigurations,
  hasAddPermission 
}) => {
  
  const getIcon = (key) => {
    switch(key) {
      case 'hostel': return FaHome;
      case 'transport': return FaBus;
      case 'coaching': return FaGraduationCap;
      default: return FaHome;
    }
  };

  // Handle service type tab change
  const handleServiceTypeChange = (serviceType) => {
    if (!hasAddPermission) {
      toast.error('সার্ভিস ধরন নির্বাচন করার অনুমতি নেই।');
      return;
    }
    setSelectedServiceType(serviceType);
    // Clear configurations when switching service types
    setConfigurations([]);
  };

  return (
    <div>
      <div className="flex items-center space-x-4 mb-6">
        <IoAddCircle className="text-4xl text-white" />
        <h2 className="text-2xl font-bold text-white tracking-tight">সার্ভিস ফি কনফিগারেশন যোগ করুন</h2>
      </div>

      {/* Service Type Tabs */}
      {hasAddPermission && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">সার্ভিস ধরন নির্বাচন করুন</h3>
          <div className="flex space-x-2">
            {serviceTypes.map((service) => {
              const IconComponent = getIcon(service.key);
              return (
                <button
                  key={service.key}
                  onClick={() => handleServiceTypeChange(service.key)}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                    selectedServiceType === service.key
                      ? `${service.color} text-white shadow-lg transform scale-105`
                      : 'bg-gray-500/20 text-white hover:bg-gray-500/30'
                  }`}
                >
                  <IconComponent className="w-5 h-5 mr-2" />
                  {service.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceTypeSelector;