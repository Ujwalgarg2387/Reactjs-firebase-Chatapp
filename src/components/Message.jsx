import React, { useContext, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";

const Message = ({ message }) => {
  const { currUser } = useContext(AuthContext);
  // const { data } = useContext(ChatContext);

  const ref = useRef();

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);


  return (
    <div
      ref={ref}
      className={`message flex flex-col sm:flex-row gap-2 ${
        message.senderId === currUser.uid ? "justify-end" : "justify-start"
      } mb-4`}
    >
      <div className="messageContent max-w-[80%] flex flex-col gap-4">
        {/* Conditionally render the message area */}
        {message.text && (
          <p
            className={`p-4 rounded-bl-lg rounded-br-lg break-words ${
              message.senderId === currUser.uid ? "bg-amber-600 text-white rounded-tl-lg":"bg-gray-300 rounded-tr-lg"
            }`}
            style={{ maxWidth: '100%' }}
          >
            {message.text}
          </p>
        )}
        {/* Render image if it exists */}
        {message.img && <img src={message.img} className="w-auto h-60 rounded-lg" alt="" />}
      </div>
    </div>
  );
};

export default Message;
