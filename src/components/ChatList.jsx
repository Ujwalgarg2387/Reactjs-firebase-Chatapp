export default function ChatList({ users, setSelected, selected }) {
  return (
    <div className="space-y-1">
      {users.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg
            className="w-12 h-12 mx-auto mb-2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <p className="text-sm">No users available</p>
        </div>
      ) : (
        users.map((u) => {
          const isSelected = selected?.uid === u.uid;
          // Use profilePic from Firestore or fallback to photoURL from Google Auth
          const profileImage = u.profilePic || u.photoURL;

          return (
            <div
              key={u.uid}
              onClick={() => setSelected({ ...u, messages: [] })}
              className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
                isSelected
                  ? "bg-blue-50 border-l-4 border-blue-600"
                  : "hover:bg-gray-50 border-l-4 border-transparent"
              }`}
            >
              {/* Avatar with unread badge */}
              <div className="relative flex-shrink-0">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={u.name || u.displayName || "User"}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-medium text-lg">
                    {(u.name || u.displayName || u.email || "U")[0].toUpperCase()}
                  </div>
                )}

                {u.unreadCount > 0 && !isSelected && (
                  <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 border-2 border-white shadow-md">
                    {u.unreadCount > 99 ? "99+" : u.unreadCount}
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <h3
                  className={`font-medium truncate ${
                    isSelected ? "text-blue-700" : "text-gray-800"
                  }`}
                >
                  {u.name || u.displayName || u.email || "Unnamed User"}
                </h3>

                {u.lastMessage && (
                  <p className="text-sm text-gray-500 truncate">
                    {u.lastMessage}
                  </p>
                )}
              </div>

              {/* Selected Indicator */}
              {isSelected && (
                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
