import React, { useContext, useState } from 'react';
import Messages from './Messages';
import Input from './Input';
import { FaVideo, FaUserPlus, FaEllipsisH } from 'react-icons/fa';
import { ChatContext } from '../context/ChatContext';
import { doc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from "../firebase";


const Chat = () => {
  const { data } = useContext(ChatContext);
  const [showMenu, setShowMenu] = useState(false);

  const handleDeleteMessages = async () => {
    if (window.confirm("Are you sure you want to delete all messages?")) {
      try {
        const chatDoc = doc(db, "chats", data.chatId); 
        await updateDoc(chatDoc, {
          messages: deleteField()
        });
        alert("Messages deleted successfully.");
      } catch (error) {
        console.error("Error deleting messages: ", error);
        alert("Failed to delete messages.");
      }
    }
  };

  return (
    <div className="chat flex flex-col flex-1 bg-white rounded-lg shadow-lg p-4 sm:h-1/2 md:h-full overflow-hidden">
      <div className="chatInfo p-4 bg-orange-100 text-gray-800 flex justify-between items-center rounded-t-lg">
        <div className="userInfo flex items-center gap-2 truncate">
          <img src={data.user?.photoURL} alt="" className="w-10 h-10 rounded-full object-cover" />
          <span className="truncate font-semibold">{data.user?.displayName}</span>
        </div>
        <div className="chatIcons flex space-x-3 relative">
          <FaVideo className="text-amber-600 cursor-pointer hover:text-amber-700 transition-colors duration-300" size={24} />
          <FaUserPlus className="text-amber-600 cursor-pointer hover:text-amber-700 transition-colors duration-300" size={24} />
          <FaEllipsisH 
            className="text-amber-600 cursor-pointer hover:text-amber-700 transition-colors duration-300" 
            size={24} 
            onClick={() => setShowMenu(!showMenu)} 
          />
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white shadow-lg rounded-lg py-2 w-full">
              <button 
                className="block px-2 py-2 text-orange-500 hover:bg-orange-100 w-full text-center"
                onClick={handleDeleteMessages}
              >
                Clear Chat
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="messagesContainer flex-1 overflow-y-auto p-4">
        <Messages />
      </div>
      <div className="inputContainer p-4">
        <Input />
      </div>
    </div>
  );
};

export default Chat;
