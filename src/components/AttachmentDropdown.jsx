// src/components/AttachmentDropdown.jsx
import { useEffect } from "react";

export default function AttachmentDropdown({ 
  isOpen, 
  onClose, 
  dropdownRef,
  attachButtonRef, // Add this prop
  onPhotoSelect,
  onDocumentSelect,
  onAudioSelect,
  onOtherSelect 
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      // Check if click is outside both dropdown AND attach button
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target) &&
        attachButtonRef.current &&
        !attachButtonRef.current.contains(e.target)
      ) {
        onClose();
      }
    };

    // Add a small delay to prevent immediate closing
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, dropdownRef, attachButtonRef]);

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute bottom-full left-0 mb-2 z-50 animate-[slideUp_0.2s_ease-out]"
      style={{ transformOrigin: "bottom left" }}
    >
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-64 py-4">
        <div className="px-5 pb-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-lg">Attach file</h3>
        </div>

        <div className="space-y-1 px-2 mt-2">
          <button 
            onClick={onPhotoSelect}
            className="cursor-pointer flex items-center space-x-3 w-full p-3 rounded-xl hover:bg-blue-50 transition-all group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-medium text-gray-900 group-hover:text-blue-600">Photo</span>
          </button>

          <button 
            onClick={onDocumentSelect}
            className="cursor-pointer flex items-center space-x-3 w-full p-3 rounded-xl hover:bg-green-50 transition-all group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-medium text-gray-900 group-hover:text-green-600">Document</span>
          </button>

          <button 
            onClick={onAudioSelect}
            className="cursor-pointer flex items-center space-x-3 w-full p-3 rounded-xl hover:bg-purple-50 transition-all group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" stroke="currentColor">
                <path d="M 6 12 Q 6 5, 12 5 Q 18 5, 18 12" strokeWidth="1.5" strokeLinecap="round" />
                <rect x="4" y="12" width="4" height="6" rx="1.5" strokeWidth="1.5" />
                <line x1="5.5" y1="14" x2="5.5" y2="16" strokeWidth="0.5" />
                <line x1="6.5" y1="14" x2="6.5" y2="16" strokeWidth="0.5" />
                <rect x="16" y="12" width="4" height="6" rx="1.5" strokeWidth="1.5" />
                <line x1="17.5" y1="14" x2="17.5" y2="16" strokeWidth="0.5" />
                <line x1="18.5" y1="14" x2="18.5" y2="16" strokeWidth="0.5" />
                <line x1="6" y1="12" x2="6" y2="12.5" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="18" y1="12" x2="18" y2="12.5" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-medium text-gray-900 group-hover:text-purple-600">Audio</span>
          </button>

          <button 
            onClick={onOtherSelect}
            className="cursor-pointer flex items-center space-x-3 w-full p-3 rounded-xl hover:bg-orange-50 transition-all group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18.53l-5.071-5.072a2 2 0 012.828-2.828l2.243 2.243 5.657-5.657a2 2 0 012.828 2.828L12 18.53z" />
              </svg>
            </div>
            <span className="font-medium text-gray-900 group-hover:text-orange-600">Other</span>
          </button>
        </div>
      </div>
    </div>
  );
}