import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { ChatContext } from '../context/ChatContext';
import ProfilePictureModal from './ProfilePictureModal';

const Chats = () => {
  const [chats, setChats] = useState([]);
  const { currUser } = useContext(AuthContext);
  const { dispatch } = useContext(ChatContext);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedPhotoURL, setSelectedPhotoURL] = useState(null);

  useEffect(() => {
    const getChats = () => {
      const unsub = onSnapshot(doc(db, "userChats", currUser.uid), (doc) => {
        setChats(doc.data());
      });

      return () => {
        unsub();
      };
    };
    currUser.uid && getChats();
  }, [currUser.uid]);

  const handleSelect = (u) => {
    dispatch({ type: "CHANGE_USER", payload: u });
  };

  const openModal = (photoURL) => {
    setSelectedPhotoURL(photoURL);
    setModalIsOpen(true);
  };

  const closeModal = () => setModalIsOpen(false);

  return (
    <div className="chats flex-1 overflow-y-auto">
      {chats && Object.entries(chats)?.sort((a, b) => b[1].date - a[1].date).map((chat) => (
        <div
          key={chat[0]}
          onClick={() => handleSelect(chat[1].userInfo)}
          className="chat p-4 border-b border-orange-100 flex items-center space-x-4 cursor-pointer"
        >
          <img
            src={chat[1].userInfo.photoURL}
            alt="User Avatar"
            className="w-10 h-10 rounded-full cursor-pointer"
            onClick={(e) => {
              e.stopPropagation(); // Prevents triggering handleSelect
              openModal(chat[1].userInfo.photoURL);
            }}
          />
          <div>
            <span className="font-bold">{chat[1].userInfo.displayName}</span>
            <p className="text-sm text-gray-400">{chat[1].lastMessage?.text}</p>
          </div>
        </div>
      ))}
      {chats && Object.entries(chats).length === 0 && (
        <p className="text-center text-gray-500">No chats to display.</p>
      )}
      <ProfilePictureModal
        isOpen={modalIsOpen}
        onClose={closeModal}
        photoURL={selectedPhotoURL}
      />
    </div>
  );
};

export default Chats;
