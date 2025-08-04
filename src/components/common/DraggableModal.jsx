import React, { useState, useEffect, useRef } from "react";
import { languageCode } from "../../utilitis/getTheme";

const DraggableModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = languageCode === 'bn' ? 'নিশ্চিত করুন' : 'Confirm',
  cancelText = languageCode === 'bn' ? 'বাতিল' : 'Cancel',
  confirmButtonClass = "bg-pmColor hover:bg-pmColor/80",
  cancelButtonClass = "bg-secColor/20 hover:bg-secColor/30 text-pmColor"
}) => {
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const modalRef = useRef(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });

  // Track mouse position continuously
  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Set initial modal position when it opens - exactly where user clicked
  useEffect(() => {
    if (isOpen) {
      const modalWidth = 400;
      const modalHeight = 250;
      // Position modal exactly at mouse cursor with slight offset to avoid cursor overlap
      const adjustedX = Math.max(0, Math.min(mousePositionRef.current.x + -50, window.innerWidth - modalWidth));
      const adjustedY = Math.max(0, Math.min(mousePositionRef.current.y + -100, window.innerHeight - modalHeight));
      setModalPosition({ x: adjustedX, y: adjustedY });
    }
  }, [isOpen]);

  // Handle drag start
  const handleMouseDown = (e) => {
    if (modalRef.current && e.target.closest('.modal-header')) {
      const rect = modalRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  // Handle drag movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging && modalRef.current) {
        const modalWidth = 400;
        const modalHeight = 250;
        let newX = e.clientX - dragOffset.x;
        let newY = e.clientY - dragOffset.y;

        // Boundary checks
        newX = Math.max(0, Math.min(newX, window.innerWidth - modalWidth));
        newY = Math.max(0, Math.min(newY, window.innerHeight - modalHeight));

        setModalPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Handle double-click to center modal
  const handleDoubleClick = () => {
    const modalWidth = 400;
    const modalHeight = 250;
    const centerX = (window.innerWidth - modalWidth) / 2;
    const centerY = (window.innerHeight - modalHeight) / 2;
    setModalPosition({ x: centerX, y: centerY });
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <style>
        {`
          @keyframes modalFadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
          
          .modal-container {
            animation: modalFadeIn 0.3s ease-out forwards;
          }
          
          .modal-backdrop {
            backdrop-filter: blur(8px);
            background: rgba(0, 0, 0, 0.4);
          }
          
          .draggable-modal {
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          }
          
          .modal-header {
            cursor: move;
            user-select: none;
            background: rgba(255, 255, 255, 0.05);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .modal-header:hover {
            background: rgba(255, 255, 255, 0.1);
          }
        `}
      </style>

      {/* Backdrop */}
      <div className="fixed inset-0 modal-backdrop z-40" onClick={onClose} />

      {/* Modal */}
      <div
        className="fixed z-50 modal-container"
        style={{
          top: `${modalPosition.y}px`,
          left: `${modalPosition.x}px`,
          width: '400px',
        }}
        ref={modalRef}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
      >
        <div className="draggable-modal rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="modal-header px-6 py-4">
            <h3 className="text-lg font-semibold text-white">
              {title}
            </h3>
            <p className="text-xs text-white/70 mt-1">
              {languageCode === 'bn' ? 'টেনে আনুন বা ডাবল ক্লিক করুন' : 'Drag to move or double-click to center'}
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <p className="text-white/90 mb-6 leading-relaxed">
              {message}
            </p>

            {/* Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-300 ${cancelButtonClass}`}
                title={cancelText}
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`px-5 py-2.5 rounded-lg font-medium text-white transition-all duration-300 ${confirmButtonClass}`}
                title={confirmText}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DraggableModal;