import React, { useContext, useState } from "react";
import {
  collection, query, where, getDocs, setDoc, doc, updateDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "../context/AuthContext";

const Searchbar = () => {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [err, setErr] = useState(false);

  const { currUser } = useContext(AuthContext);

  const handleSearch = async () => {
    const q = query(
      collection(db, "users"),
      where("displayName", "==", username)
    );
    try {
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        setUser(doc.data());
      });
    } catch (err) {
      setErr(true);
    }
  };

  const handleKey = (e) => {
    e.code === "Enter" && handleSearch();
  };

  const handleSelect = async () => {
    //check whether the group(chats in firestore) exists, if not then create it
    const combinedId = currUser.uid > user.uid 
        ? currUser.uid + user.uid 
        : user.uid + currUser.uid;
    try {
      const res = await getDoc(doc(db, "chats", combinedId));
      
      if(!res.exists()) {
        // create a chat in chats collections
        await setDoc(doc(db, "chats", combinedId), { messages : [] });

        //create user chats
        await updateDoc(doc(db, "userChats", currUser.uid), {
          [combinedId + ".userInfo"]: {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
          },
          [combinedId + ".date"] : serverTimestamp(),
        });
        await updateDoc(doc(db, "userChats", user.uid), {
          [combinedId + ".userInfo"]: {
            uid: currUser.uid,
            displayName: currUser.displayName,
            photoURL: currUser.photoURL,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });
      }

    } catch (err) {}
    
    setUser(null);
    setUsername("")
  }

  return (
    <div className="search p-4">
      <input
        onKeyDown={handleKey}
        onChange={(e) => setUsername(e.target.value)}
        type="text"
        placeholder="Find a user"
        value={username}
        className="w-full p-2 rounded-md bg-orange-100 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
      />
      {err && <span>User not found</span>}
      <div className="chats flex-1 overflow-y-auto">
        {user && 
          <div 
          onClick={handleSelect}
          className="chat p-4 border-b border-orange-100 flex items-center space-x-4 cursor-pointer hover:bg-orange-50">
            <img src={user.photoURL} alt="" className="w-12 h-12 rounded-full"/>
            <div className="userChatInfo">
              <span>{user.displayName}</span>
            </div>
          </div>}
      </div>
    </div>
  );
};

export default Searchbar;
