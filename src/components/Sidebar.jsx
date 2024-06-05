// Sidebar.js
import React from 'react';
import Navbar from './Navbar';
import Searchbar from './Searchbar';
import Chats from './Chats';

const Sidebar = () => {
  return (
    <div className="bg-white rounded-l-lg shadow-lg p-4 md:max-w-sm w-full flex-shrink-0 h-1/2 md:h-auto flex flex-col">
      <Navbar />
      <Searchbar />
      <div className="flex-1 overflow-y-auto">
        <Chats />
      </div>
    </div>
  );
};

export default Sidebar;
