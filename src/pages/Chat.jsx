import { useEffect, useState } from "react";
import {
  auth,
  db,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "../firebase";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import SearchUser from "../components/SearchUser";
import Navbar from "../components/Navbar";

export default function Chat() {
  const user = auth.currentUser;
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]);

  // Load users
  useEffect(() => {
    if (!user) return;

    async function fetchUsers() {
      try {
        const snap = await getDocs(collection(db, "users"));
        const list = snap.docs.map((d) => d.data());
        setUsers(list.filter((u) => u.uid !== user.uid));
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    }

    fetchUsers();
  }, [user]);

  // Listen to ALL messages for sorting + unread count + last message
  useEffect(() => {
    if (!user) return;

    const msgsRef = collection(db, "messages");
    const q = query(
      msgsRef,
      where("participants", "array-contains", user.uid),
      orderBy("timestamp", "asc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = [];
        snap.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        setAllMessages(list);
      },
      (err) => console.error("All messages listener error:", err)
    );

    return () => unsub();
  }, [user]);

  // Listen to messages with selected user
  useEffect(() => {
    if (!user || !selected) {
      setMessages([]);
      return;
    }

    const msgsRef = collection(db, "messages");
    const q = query(
      msgsRef,
      where("participants", "array-contains", user.uid),
      orderBy("timestamp", "asc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = [];
        snap.forEach((docSnap) => {
          const m = { id: docSnap.id, ...docSnap.data() };
          const betweenBoth =
            (m.senderId === user.uid && m.receiverId === selected.uid) ||
            (m.receiverId === user.uid && m.senderId === selected.uid);
          if (betweenBoth) list.push(m);
        });
        setMessages(list);
      },
      (err) => console.error("Messages listener error:", err)
    );

    return () => unsub();
  }, [user, selected]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (!user || !selected) return;

    async function markAsRead() {
      const unreadMessages = allMessages.filter(
        (m) =>
          m.senderId === selected.uid &&
          m.receiverId === user.uid &&
          !m.read
      );

      for (const msg of unreadMessages) {
        try {
          await updateDoc(doc(db, "messages", msg.id), { read: true });
        } catch (error) {
          console.error("Failed to mark message as read:", error);
        }
      }
    }

    markAsRead();
  }, [selected, user, allMessages]);

  // Sort users by most recent message timestamp
  const sortedUsers = [...users].sort((a, b) => {
    const messagesA = allMessages.filter(
      (m) =>
        (m.senderId === user.uid && m.receiverId === a.uid) ||
        (m.receiverId === user.uid && m.senderId === a.uid)
    );
    const lastMsgA = messagesA[messagesA.length - 1];

    const messagesB = allMessages.filter(
      (m) =>
        (m.senderId === user.uid && m.receiverId === b.uid) ||
        (m.receiverId === user.uid && m.senderId === b.uid)
    );
    const lastMsgB = messagesB[messagesB.length - 1];

    const timeA =
      lastMsgA?.timestamp && typeof lastMsgA.timestamp.toMillis === "function"
        ? lastMsgA.timestamp.toMillis()
        : 0;
    const timeB =
      lastMsgB?.timestamp && typeof lastMsgB.timestamp.toMillis === "function"
        ? lastMsgB.timestamp.toMillis()
        : 0;

    return timeB - timeA;
  });

  // Add unread count and lastMessage to each user
  const usersWithMeta = sortedUsers.map((u) => {
    const userMessages = allMessages.filter(
      (m) =>
        (m.senderId === user.uid && m.receiverId === u.uid) ||
        (m.receiverId === user.uid && m.senderId === u.uid)
    );
    const lastMsg = userMessages[userMessages.length - 1];

    const unreadCount = userMessages.filter(
      (m) => m.senderId === u.uid && m.receiverId === user.uid && !m.read
    ).length;

    return {
      ...u,
      unreadCount,
      lastMessage: lastMsg ? lastMsg.content : "",
    };
  });

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <div className="w-80 bg-white shadow-lg border-r border-gray-200 flex flex-col">
          <div className="px-4 py-5 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Messages</h2>
            <SearchUser setSelected={setSelected} />
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-2">
            <ChatList
              users={usersWithMeta}
              setSelected={setSelected}
              selected={selected}
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selected ? (
            <ChatWindow
              selected={selected}
              user={user}
              messages={messages}
              setMessages={setMessages}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Welcome to ChatApp
                </h3>
                <p className="text-gray-500">
                  Select a user from the list to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
