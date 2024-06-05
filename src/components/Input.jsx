// Input.jsx
import React, { useContext, useState } from 'react';
import { FaPaperclip, FaImage } from 'react-icons/fa';
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { Timestamp, arrayUnion, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from "../firebase";
import { v4 as uuid } from "uuid";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const Input = () => {
  const [text, setText] = useState('');
  const [img, setImg] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(''); // State for managing upload status
  const { currUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);
  
  // Function to handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImg(file);
  };
  
  const handleSend = async () => {
    if (!text && !img) {
      return; // If there's no text or image content, do nothing
    }
    try {
      if (img) {
        setUploadStatus('Sending...');
        
        const storageRef = ref(storage, uuid());
        
        const uploadTask = uploadBytesResumable(storageRef, img);
        const snapshot = await uploadTask;
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        await updateDoc(doc(db, "chats", data.chatId), {
          messages: arrayUnion({
            id: uuid(),
            text,
            senderId: currUser.uid,
            date: Timestamp.now(),
            img: downloadURL,
          }),
        });

        setUploadStatus('Sent');
      } else {
        await updateDoc(doc(db,"chats", data.chatId), {
          messages: arrayUnion({
            id:uuid(),
            text,
            senderId:currUser.uid,
            date:Timestamp.now(),
          })
        });
      }
      
      await updateDoc(doc(db, "userChats", currUser.uid), {
        [data.chatId + ".lastMessage"]: {
          text,
        },
        [data.chatId + ".date"]: serverTimestamp(),
      });

      await updateDoc(doc(db, "userChats", data.user.uid), {
        [data.chatId + ".lastMessage"]: {
          text,
        },
        [data.chatId + ".date"]: serverTimestamp(),
      });
  
      setText("");
      setImg(null);
      setUploadStatus('');
    } catch (error) {
      console.error("Error sending message:", error);
      // Handle error
    }
  };

  return (
    <div className="input p-4 border-t border-gray-300 flex items-center bg-white rounded-b-lg shadow-md">
      <input
        type="text"
        placeholder="Type something..."
        className="w-full p-2 rounded-lg border border-gray-300 outline-none transition-colors duration-300 focus:border-amber-600"
        onChange={(e) => setText(e.target.value)}
        value={text}
      />
      <div className="send flex items-center gap-3 ml-2">
        <label htmlFor="file" className="cursor-pointer text-gray-400 hover:text-amber-600 transition-colors duration-300">
          <FaPaperclip size={24} />
        </label>
        <input 
          type="file" 
          style={{ display: 'none' }} 
          id="file" 
          onChange={handleFileChange} // Call handleFileChange when file is selected
        />
        <label htmlFor="file" className="cursor-pointer text-gray-400 hover:text-amber-600 transition-colors duration-300">
          <FaImage size={24} />
        </label>
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors duration-300 cursor-pointer"
          disabled={!text && !img} // Disable send button if there's no text or image
        >
          Send
        </button>
      </div>
      {uploadStatus && (
        <span className="ml-4 text-sm">{uploadStatus}</span>
      )}
    </div>
  );
};

export default Input;
