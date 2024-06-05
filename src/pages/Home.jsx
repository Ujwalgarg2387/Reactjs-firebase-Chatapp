import React from 'react';
import Sidebar from '../components/Sidebar';
import Chat from '../components/Chat';

const Home = () => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center h-screen bg-gradient-to-l from-amber-300 via-orange-200 to-amber-100">
      <div className="container flex flex-col md:flex-row border border-white rounded-lg overflow-hidden md:mx-auto md:max-w-4xl w-full">
        <Sidebar />
        <Chat />
      </div>
    </div>
  );
};

export default Home;
