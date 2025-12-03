// src/components/ChatWindow.jsx
import { useState, useEffect, useRef } from "react";
import { db, collection, addDoc, serverTimestamp, storage } from "../firebase";
import AttachmentDropdown from "./AttachmentDropdown";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { query, where, getDocs, writeBatch } from "firebase/firestore";


export default function ChatWindow({ selected, user, messages, setMessages }) {
  const [message, setMessage] = useState("");
  const [showAttachmentDropdown, setShowAttachmentDropdown] = useState(false);
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingMessages, setUploadingMessages] = useState([]); // Track uploading messages
  const messagesEndRef = useRef(null);
  const dropdownRef = useRef(null);
  const attachButtonRef = useRef(null);
  const optionsDropdownRef = useRef(null); // Add this
  const optionsButtonRef = useRef(null); // Add this

  // Hidden file input refs for different file types
  const photoInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const otherInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, uploadingMessages]);

  // Close attachment dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        attachButtonRef.current &&
        !attachButtonRef.current.contains(e.target)
      ) {
        setShowAttachmentDropdown(false);
      }
    }
    if (showAttachmentDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAttachmentDropdown]);

  // Close options dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        optionsDropdownRef.current &&
        !optionsDropdownRef.current.contains(e.target) &&
        optionsButtonRef.current &&
        !optionsButtonRef.current.contains(e.target)
      ) {
        setShowOptionsDropdown(false);
      }
    }
    if (showOptionsDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showOptionsDropdown]);


const clearChatHistory = async () => {
  if (window.confirm("Are you sure you want to clear all chat history? This action cannot be undone.")) {
    try {
      // Query messages between current user and selected user
      const messagesRef = collection(db, "messages");
      const q = query(
        messagesRef,
        where("participants", "array-contains", user.uid)
      );

      const querySnapshot = await getDocs(q);
      
      // Filter messages that are between these two specific users
      const messagesToDelete = querySnapshot.docs.filter(doc => {
        const data = doc.data();
        return data.participants.includes(selected.uid);
      });

      // Use batched write for efficient deletion (max 500 operations per batch)
      const batchSize = 500;
      const batches = [];

      for (let i = 0; i < messagesToDelete.length; i += batchSize) {
        const batch = writeBatch(db);
        const batchDocs = messagesToDelete.slice(i, i + batchSize);
        
        batchDocs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        batches.push(batch.commit());
      }

      // Execute all batches
      await Promise.all(batches);

      // Clear local state
      setMessages([]);
      setUploadingMessages([]);
      setShowOptionsDropdown(false);
      
      console.log(`Deleted ${messagesToDelete.length} messages successfully`);
    } catch (error) {
      console.error("Error deleting chat history:", error);
      alert("Failed to delete chat history. Please try again.");
    }
  }
};


  async function sendMessage(e) {
    e.preventDefault();
    if (!message.trim() && selectedFiles.length === 0) return;

    const tempId = Date.now();

    const optimisticMsg = {
      id: tempId,
      senderId: user.uid,
      receiverId: selected.uid,
      content: message.trim(),
      files: selectedFiles.map(f => ({
        name: f.name,
        type: f.type,
        size: f.size,
        file: f,
        uploading: true,
        progress: 0
      })),
      status: 'uploading'
    };

    setUploadingMessages(prev => [...prev, optimisticMsg]);

    const messageCopy = message.trim();
    const filesCopy = [...selectedFiles];
    setMessage("");
    setSelectedFiles([]);

    try {
      const uploadedFiles = [];

      for (let i = 0; i < filesCopy.length; i++) {
        const file = filesCopy[i];
        const storageRef = ref(storage, `chat-files/${Date.now()}-${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        // Monitor upload progress
        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadingMessages(prev => prev.map(msg =>
                msg.id === tempId ? {
                  ...msg,
                  files: msg.files.map((f, idx) =>
                    idx === i ? { ...f, progress } : f
                  )
                } : msg
              ));
            },
            (error) => {
              console.error("Upload error:", error);
              reject(error);
            },
            () => {
              // Upload completed successfully
              resolve();
            }
          );
        });

        // Get download URL after upload completes
        const downloadURL = await getDownloadURL(storageRef);

        uploadedFiles.push({
          name: file.name,
          type: file.type,
          size: file.size,
          url: downloadURL
        });
      }

      const msg = {
        senderId: user.uid,
        receiverId: selected.uid,
        content: messageCopy,
        participants: [user.uid, selected.uid],
        files: uploadedFiles
      };

      await addDoc(collection(db, "messages"), {
        ...msg,
        timestamp: serverTimestamp(),
      });

      setUploadingMessages(prev => prev.filter(m => m.id !== tempId));
      setMessages((prev) => [...prev, msg]);

    } catch (err) {
      console.error("Failed to send message:", err);

      setUploadingMessages(prev => prev.map(msg =>
        msg.id === tempId ? { ...msg, status: 'failed', error: err.message } : msg
      ));
    }
  }


  // Retry failed message
  const retryMessage = async (failedMsg) => {
    const tempId = failedMsg.id;

    setUploadingMessages(prev => prev.map(msg =>
      msg.id === tempId ? { ...msg, status: 'uploading', error: null } : msg
    ));

    try {
      const uploadedFiles = [];

      for (let i = 0; i < failedMsg.files.length; i++) {
        const fileData = failedMsg.files[i];
        const storageRef = ref(storage, `chat-files/${Date.now()}-${fileData.name}`);
        const uploadTask = uploadBytesResumable(storageRef, fileData.file);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadingMessages(prev => prev.map(msg =>
                msg.id === tempId ? {
                  ...msg,
                  files: msg.files.map((f, idx) =>
                    idx === i ? { ...f, progress } : f
                  )
                } : msg
              ));
            },
            (error) => {
              reject(error);
            },
            () => {
              resolve();
            }
          );
        });

        const downloadURL = await getDownloadURL(storageRef);

        uploadedFiles.push({
          name: fileData.name,
          type: fileData.type,
          size: fileData.size,
          url: downloadURL
        });
      }

      const msg = {
        senderId: user.uid,
        receiverId: selected.uid,
        content: failedMsg.content,
        participants: [user.uid, selected.uid],
        files: uploadedFiles
      };

      await addDoc(collection(db, "messages"), {
        ...msg,
        timestamp: serverTimestamp(),
      });

      setUploadingMessages(prev => prev.filter(m => m.id !== tempId));
      setMessages((prev) => [...prev, msg]);

    } catch (err) {
      console.error("Retry failed:", err);
      setUploadingMessages(prev => prev.map(msg =>
        msg.id === tempId ? { ...msg, status: 'failed', error: err.message } : msg
      ));
    }
  };


  // Delete failed message
  const deleteFailed = (tempId) => {
    setUploadingMessages(prev => prev.filter(m => m.id !== tempId));
  };

  // File selection handlers
  const handlePhotoSelect = () => {
    photoInputRef.current?.click();
    setShowAttachmentDropdown(false);
  };

  const handleDocumentSelect = () => {
    documentInputRef.current?.click();
    setShowAttachmentDropdown(false);
  };

  const handleAudioSelect = () => {
    audioInputRef.current?.click();
    setShowAttachmentDropdown(false);
  };

  const handleOtherSelect = () => {
    otherInputRef.current?.click();
    setShowAttachmentDropdown(false);
  };

  // File change handlers
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
    }
    e.target.value = '';
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white shadow-sm">
        <div className="flex items-center space-x-3">
          {selected.profilePic ? (
            <img
              src={selected.profilePic}
              alt={selected.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-medium">
              {selected.name ? selected.name[0].toUpperCase() : "U"}
            </div>
          )}
          <div>
            <h2 className="font-semibold text-gray-800">{selected.name}</h2>
            <p className="text-xs text-gray-500">{selected.email}</p>
          </div>
        </div>

        <div>

          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            ref={optionsButtonRef}
            onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
          >
            <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
          {/* Options Dropdown */}
          {showOptionsDropdown && (
            <div
              ref={optionsDropdownRef}
              className="absolute right-5 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
            >
              <button
                onClick={clearChatHistory}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear Chat History
              </button>

              {/* You can add more options here */}
              <button
                onClick={() => {
                  console.log("View contact info");
                  setShowOptionsDropdown(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Contact Info
              </button>
            </div>
          )}
        </div>
      </div>


      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
        {messages.length === 0 && uploadingMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500">No messages yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Start the conversation!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Actual messages */}
            {messages.map((msg, idx) => {
              const isSent = msg.senderId === user.uid;
              return (
                <div
                  key={idx}
                  className={`flex ${isSent ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${isSent
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                      }`}
                  >
                    {msg.files && msg.files.length > 0 && (
                      <div className="mb-2 space-y-2">
                        {msg.files.map((file, fileIdx) => (
                          <div key={fileIdx}>
                            {file.type.startsWith('image/') ? (
                              <img
                                src={file.url}
                                alt={file.name}
                                className="max-w-[200px] rounded-lg cursor-pointer"
                                onClick={() => window.open(file.url, '_blank')}
                              />
                            ) : file.type.startsWith('audio/') ? (
                              <audio controls className="max-w-[200px]">
                                <source src={file.url} type={file.type} />
                              </audio>
                            ) : (
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 text-sm px-3 py-2 rounded ${isSent ? 'bg-blue-400 hover:bg-blue-300' : 'bg-gray-100 hover:bg-gray-200'}`}
                              >
                                📄 {file.name}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {msg.content && <p className="break-words">{msg.content}</p>}

                    <p
                      className={`text-xs mt-1 ${isSent ? "text-blue-100" : "text-gray-400"
                        }`}
                    >
                      {(() => {
                        let d;
                        if (msg.timestamp && typeof msg.timestamp.toDate === "function") {
                          d = msg.timestamp.toDate();
                        } else if (typeof msg.timestamp === "string" || typeof msg.timestamp === "number") {
                          d = new Date(msg.timestamp);
                        } else {
                          return "";
                        }
                        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                      })()}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Uploading messages */}
            {/* Uploading messages */}
            {uploadingMessages.map((msg) => {
              const isSent = msg.senderId === user.uid;
              const isFailed = msg.status === 'failed';

              return (
                <div
                  key={msg.id}
                  className={`flex ${isSent ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${isSent
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                      } ${isFailed ? 'opacity-70' : 'opacity-90'}`}
                  >
                    {msg.files && msg.files.length > 0 && (
                      <div className="mb-2 space-y-2">
                        {msg.files.map((file, fileIdx) => (
                          <div key={fileIdx} className="relative">
                            {file.type.startsWith('image/') ? (
                              <div className="relative group">
                                <img
                                  src={URL.createObjectURL(file.file)}
                                  alt={file.name}
                                  className={`max-w-[200px] rounded-lg transition-all ${isFailed ? 'blur-sm' : ''
                                    }`}
                                />
                                {isFailed ? (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <button
                                      onClick={() => retryMessage(msg)}
                                      className="bg-white rounded-full p-3 shadow-lg hover:scale-110 transition-transform flex items-center gap-2"
                                    >
                                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                      </svg>
                                      <span className="text-sm font-medium text-gray-700">Retry</span>
                                    </button>
                                  </div>
                                ) : (
                                  <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                                      <div className="text-white text-xs font-medium">
                                        {Math.round(file.progress || 0)}%
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : file.type.startsWith('audio/') ? (
                              <div className="relative">
                                <audio
                                  controls
                                  className={`max-w-[200px] transition-all ${isFailed ? 'blur-sm opacity-50' : 'opacity-50'
                                    }`}
                                >
                                  <source src={URL.createObjectURL(file.file)} type={file.type} />
                                </audio>
                                {isFailed ? (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <button
                                      onClick={() => retryMessage(msg)}
                                      className="bg-white rounded-full p-2 shadow-lg hover:scale-110 transition-transform flex items-center gap-1 text-xs"
                                    >
                                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                      </svg>
                                      <span className="font-medium text-gray-700">Retry</span>
                                    </button>
                                  </div>
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-xs font-medium text-white bg-black bg-opacity-60 px-2 py-1 rounded">
                                      {Math.round(file.progress || 0)}%
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className={`relative px-3 py-2 rounded ${isSent ? 'bg-blue-400' : 'bg-gray-100'}`}>
                                <div className={`flex items-center gap-2 text-sm transition-all ${isFailed ? 'blur-sm' : ''
                                  }`}>
                                  <span>📄 {file.name}</span>
                                  {!isFailed && (
                                    <span className="text-xs">({Math.round(file.progress || 0)}%)</span>
                                  )}
                                </div>
                                {isFailed && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <button
                                      onClick={() => retryMessage(msg)}
                                      className="bg-white rounded-full px-3 py-2 shadow-lg hover:scale-110 transition-transform flex items-center gap-1 text-xs"
                                    >
                                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                      </svg>
                                      <span className="font-medium text-gray-700">Retry</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {msg.content && <p className="break-words">{msg.content}</p>}

                    {isFailed ? (
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => deleteFailed(msg.id)}
                          className="text-xs px-3 py-1 bg-red-500 hover:bg-red-600 rounded-full text-white flex items-center gap-1"
                        >
                          <span>✕</span>
                          <span>Delete</span>
                        </button>
                      </div>
                    ) : (
                      <p className={`text-xs mt-1 ${isSent ? "text-blue-100" : "text-gray-400"}`}>
                        Sending...
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-6 py-4 bg-white border-t">
        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 text-sm">
                <span className="text-gray-700 truncate max-w-[200px]">
                  📎 {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="text-red-500 hover:text-red-700 font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={sendMessage} className="flex items-center space-x-3">
          <div className="flex items-center flex-1 bg-gray-100 rounded-full px-4 py-3 border border-gray-200 focus-within:bg-white focus-within:border-blue-300 transition-all relative">
            <button
              ref={attachButtonRef}
              type="button"
              onClick={() => setShowAttachmentDropdown(!showAttachmentDropdown)}
              className="p-2 text-gray-500 hover:text-blue-500 hover:bg-white rounded-full transition-all mr-2 -ml-1 cursor-pointer"
              title="Attach file"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>

            <AttachmentDropdown
              isOpen={showAttachmentDropdown}
              onClose={() => setShowAttachmentDropdown(false)}
              dropdownRef={dropdownRef}
              attachButtonRef={attachButtonRef}
              onPhotoSelect={handlePhotoSelect}
              onDocumentSelect={handleDocumentSelect}
              onAudioSelect={handleAudioSelect}
              onOtherSelect={handleOtherSelect}
            />

            {/* Hidden file inputs */}
            {/* Hidden file inputs */}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*,video/*"  // Accept both images and videos
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              ref={documentInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              ref={otherInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />


            <input
              type="text"
              className="flex-1 bg-transparent border-none outline-none placeholder-gray-500 text-gray-900 pr-2"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={!message.trim() && selectedFiles.length === 0}
            className="cursor-pointer p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
