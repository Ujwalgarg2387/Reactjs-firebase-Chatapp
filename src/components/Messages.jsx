import { doc, onSnapshot } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import { db } from "../firebase";
import Message from "./Message";

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const { data } = useContext(ChatContext);
  const { currUser } = useContext(AuthContext);

  useEffect(() => {
    if (data.chatId === "null" || !currUser) return;

    const unSub = onSnapshot(doc(db, "chats", data.chatId), (doc) => {
      doc.exists() && setMessages(doc.data().messages || []);
    });

    return () => {
      unSub();
    };
  }, [data.chatId, currUser]);

  return (
    <div className="messagesContainer flex-1 bg-gray-100 rounded-lg p-4 overflow-y-auto h-auto md:h-96">
      {messages.length ? (
        messages.map((m) => (
          <Message message={m} key={m.id} />
        ))
      ) : (
        <p className="text-center text-gray-500">No messages to display.</p>
      )}
    </div>
  );
};

export default Messages;
