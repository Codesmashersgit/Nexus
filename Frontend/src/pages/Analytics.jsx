import React from 'react'

function Analytics() {
  return (
    
    <div className="min-h-screen pt-[10%] px-7">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-light text-gray-900 ">Meeting Platform Analytics</h1>
        <p className="text-gray-600 font-light mt-1">Key metrics for your meetings and users</p>
      </header>

      {/* Metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm font-medium">Total Meetings</h2>
          <p className="mt-1 text-3xl font-semibold text-gray-900">1,234</p>
          <p className="text-green-500 mt-2">+12% since last week</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm font-medium">Active Users</h2>
          <p className="mt-1 text-3xl font-semibold text-gray-900">567</p>
          <p className="text-green-500 mt-2">+7% since last week</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm font-medium">Avg Meeting Duration</h2>
          <p className="mt-1 text-3xl font-semibold text-gray-900">42 min</p>
          <p className="text-yellow-500 mt-2">-2% since last week</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm font-medium">Recordings Used</h2>
          <p className="mt-1 text-3xl font-semibold text-gray-900">128 GB</p>
          <p className="text-green-500 mt-2">+15% since last week</p>
        </div>
      </div>

      {/* Chart placeholder */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-gray-700 text-xl font-semibold mb-4">Meetings Over Time</h2>
        <div className="h-56 flex items-center justify-center text-gray-400 italic">
          {/* Replace this with a real chart */}
          Chart goes here
        </div>
      </div>
    </div>
  );
}


export default Analytics