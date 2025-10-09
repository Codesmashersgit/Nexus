import React from 'react'

const Pricing = () => {
  return (
    <div className="max-w-4xl mx-auto py-20 z-0 relative lg:mt-40">
      <h2 className="text-3xl font-bold text-center mb-8">Choose Your Plan</h2>
      <div className="flex flex-col md:flex-row gap-6 justify-center">
        
        {/* Free Plan */}
        <div className="border rounded-lg p-6 flex-1 text-center shadow-md hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-4">Free</h3>
          <p className="text-4xl font-bold mb-2">₹0</p>
          <p className="mb-6">Forever free</p>
          <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded cursor-not-allowed" disabled>
            Current Plan
          </button>
        </div>

        {/* Monthly Plan */}
        <div className="border rounded-lg p-6 flex-1 text-center shadow-md hover:shadow-lg transition border-blue-500">
          <h3 className="text-xl font-semibold mb-4">Monthly</h3>
          <p className="text-4xl font-bold mb-2">₹11</p>
          <p className="mb-6">per month</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Subscribe
          </button>
        </div>

        {/* Yearly Plan */}
        <div className="border rounded-lg p-6 flex-1 text-center shadow-md hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-4">Yearly</h3>
          <p className="text-4xl font-bold mb-2">₹59</p>
          <p className="mb-6">per year</p>
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Subscribe
          </button>
        </div>

      </div>
    </div>
  );
};



export default Pricing