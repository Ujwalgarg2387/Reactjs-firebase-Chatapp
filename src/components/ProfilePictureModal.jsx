import React from 'react';
import Modal from "react-modal";

Modal.setAppElement('#root');

const ProfilePictureModal = ({ isOpen, onClose, photoURL }) => {
    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        contentLabel="User Profile Picture"
        className="flex items-center justify-center w-full h-full fixed inset-0 bg-black bg-opacity-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-4 w-auto max-w-3xl mx-auto flex flex-col items-center">
          <img
            src={photoURL}
            alt="User Avatar"
            className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full object-cover"
          />
          <button
            onClick={onClose}
            className="mt-4 bg-amber-600 text-white py-1 px-4 rounded-md hover:bg-amber-700 transition-colors duration-300"
          >
            Close
          </button>
        </div>
      </Modal>
    );
  };
  
  export default ProfilePictureModal;