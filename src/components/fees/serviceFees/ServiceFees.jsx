// ServiceFees.jsx - Main Component
import { useState } from 'react';
import { FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';

import ServiceTypeSelector from './ServiceTypeSelector';
import ServiceFeesForm from './ServiceFeesForm';
import ServiceFeesTable from './ServiceFeesTable';
import ServiceFeesModals from './ServiceFeesModals';
import ViewOnlyServiceFees from './ViewOnlyServiceFees';

import { useGetGroupPermissionsQuery } from '../../../redux/features/api/permissionRole/groupsApi';
import LoadingSpinner from '../../common/LoadingSpinner';

const ServiceFees = () => {
  const { user, group_id } = useSelector((state) => state.auth);
  const [selectedServiceType, setSelectedServiceType] = useState('hostel');
  const [configurations, setConfigurations] = useState([]);
  const [selectedFee, setSelectedFee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch group permissions
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });

  // Check permissions
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_fees_name') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_fees_name') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_fees_name') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_fees_name') || false;

  // Service type tabs configuration
  const serviceTypes = [
    { 
      key: 'hostel', 
      label: 'হোস্টেল', 
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    },
    { 
      key: 'transport', 
      label: 'ট্রান্সপোর্ট', 
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600'
    },
    { 
      key: 'coaching', 
      label: 'কোচিং', 
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600'
    },
  ];

  // Get service type flags based on selected service
  const getServiceFlags = (serviceType) => {
    return {
      is_hostel_fee: serviceType === 'hostel',
      is_transport_fee: serviceType === 'transport',
      is_coaching_fee: serviceType === 'coaching',
    };
  };

  // Validate dates before submission
  const validateDates = () => {
    const invalidConfigs = configurations.filter(
      (config) => !config.startDate || !config.endDate
    );
    if (invalidConfigs.length > 0) {
      return false;
    }
    return true;
  };

  // Open confirmation modal for create
  const handleOpenModal = () => {
    if (!hasAddPermission) {
      return;
    }
    if (configurations.length === 0) {
      return;
    }
    if (!validateDates()) {
      return;
    }
    setIsModalOpen(true);
  };

  if (permissionsLoading) {
    return <LoadingSpinner />;
  }

  if (!hasViewPermission) {
    return <div className="p-4 text-red-400 animate-fadeIn">এই পৃষ্ঠাটি দেখার অনুমতি নেই।</div>;
  }

  // If user only has view permission, show view-only component
  if (hasViewPermission && !hasAddPermission && !hasChangePermission && !hasDeletePermission) {
    return (
      <ViewOnlyServiceFees 
        selectedServiceType={selectedServiceType}
        setSelectedServiceType={setSelectedServiceType}
        serviceTypes={serviceTypes}
      />
    );
  }

  return (
    <div className="py-8 w-full relative">
      <Toaster position="top-right" toastOptions={{ style: { background: '#DB9E30', color: '#fff' } }} />
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out forwards;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out forwards;
        }
        .btn-glow:hover {
          box-shadow: 0 0 15px rgba(37, 99, 235, 0.3);
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(22, 31, 48, 0.26);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(10, 13, 21, 0.44);
        }
      `}</style>

      <ServiceFeesModals 
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        isUpdateModalOpen={isUpdateModalOpen}
        setIsUpdateModalOpen={setIsUpdateModalOpen}
        isDeleteModalOpen={isDeleteModalOpen}
        setIsDeleteModalOpen={setIsDeleteModalOpen}
        selectedFee={selectedFee}
        setSelectedFee={setSelectedFee}
        configurations={configurations}
        setConfigurations={setConfigurations}
        selectedServiceType={selectedServiceType}
        serviceTypes={serviceTypes}
        getServiceFlags={getServiceFlags}
        isSubmitting={isSubmitting}
        setIsSubmitting={setIsSubmitting}
        hasAddPermission={hasAddPermission}
        hasChangePermission={hasChangePermission}
        hasDeletePermission={hasDeletePermission}
      />

      <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl animate-fadeIn shadow-xl">
        {(hasAddPermission || hasChangePermission) && (
          <div>
            <ServiceTypeSelector 
              selectedServiceType={selectedServiceType}
              setSelectedServiceType={setSelectedServiceType}
              serviceTypes={serviceTypes}
              configurations={configurations}
              setConfigurations={setConfigurations}
              hasAddPermission={hasAddPermission}
            />

            <ServiceFeesForm 
              selectedServiceType={selectedServiceType}
              configurations={configurations}
              setConfigurations={setConfigurations}
              serviceTypes={serviceTypes}
              getServiceFlags={getServiceFlags}
              hasAddPermission={hasAddPermission}
              hasChangePermission={hasChangePermission}
            />

            <ServiceFeesTable 
              selectedServiceType={selectedServiceType}
              serviceTypes={serviceTypes}
              hasChangePermission={hasChangePermission}
              hasDeletePermission={hasDeletePermission}
              setSelectedFee={setSelectedFee}
              setIsUpdateModalOpen={setIsUpdateModalOpen}
              setIsDeleteModalOpen={setIsDeleteModalOpen}
            />

            {/* Submit Button */}
            {hasAddPermission && configurations.length > 0 && (
              <div className="mb-6">
                <button
                  onClick={handleOpenModal}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium bg-pmColor text-white transition-all duration-300 animate-scaleIn ${isSubmitting ? 'cursor-not-allowed opacity-70' : 'hover:text-white btn-glow'}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin text-lg mr-2" />
                      জমা হচ্ছে...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle className="w-5 h-5 mr-2" />
                      জমা দিন
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceFees;