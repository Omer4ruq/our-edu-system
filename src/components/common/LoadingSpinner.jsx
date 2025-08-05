// components/LoadingSpinner.jsx
import { FaSpinner } from 'react-icons/fa';

const LoadingSpinner = ({ message = "লোড হচ্ছে..." }) => {
  return (
    <div className="py-8 w-full relative">
      <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl animate-fadeIn shadow-xl">
        <div className="flex items-center justify-center space-x-3">
          <FaSpinner className="animate-spin text-2xl text-white" />
          <span className="text-white/70 text-lg">{message}</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;