import React, { useContext, useState } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { AuthContext } from '../context/AuthContext';
import ProfilePictureModal from './ProfilePictureModal';

const Navbar = () => {
  const { currUser } = useContext(AuthContext);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  return (
    <div className="navbar flex justify-between items-center bg-orange-100 p-4 text-gray-800 rounded-t-lg shadow-md">
      <span className="logo font-bold text-2xl sm:text-3xl text-amber-600">Chat-Me</span>
      <div className="user flex items-center space-x-2">
        <img
          src={currUser.photoURL}
          alt="User Avatar"
          className="w-10 h-10 rounded-full border-2 border-amber-600 transition-transform duration-300 hover:scale-110 cursor-pointer"
          onClick={openModal}
        />
        <span className="hidden sm:inline font-semibold transition-colors duration-300 hover:text-amber-600">
          {currUser.displayName}
        </span>
        <button
          onClick={() => signOut(auth)}
          className="bg-amber-600 text-white py-1 px-2 rounded-md hover:bg-amber-700 transition-colors duration-300"
        >
          Logout
        </button>
      </div>
      <ProfilePictureModal
        isOpen={modalIsOpen}
        onClose={closeModal}
        photoURL={currUser.photoURL}
      />
    </div>
  );
};

export default Navbar;
