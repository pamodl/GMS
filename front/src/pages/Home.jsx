import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">University Gymnasium Management System</h1>
          <p className="text-xl">Digital Solution for Gymnasium Management</p>
        </div>
      </header>

      {/* Main Features Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Check In/Out */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Check In/Out</h2>
            <p className="text-gray-600 mb-4">Quick digital check-in and check-out for gym access</p>
            <Link to="/check-in-out" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Check In/Out
            </Link>
          </div>
          
          {/* Availability Check */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Check Availability</h2>
            <p className="text-gray-600 mb-4">View gym and equipment availability</p>
            <Link to="/view-equipment" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              View Status
            </Link>
          </div>
        </div>
      </section>

      {/* System Features */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">System Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold mb-2">Real-time Tracking</h3>
            <ul className="list-disc pl-5 text-gray-600">
              <li>Attendance monitoring</li>
              <li>Equipment usage tracking</li>
              <li>Occupancy statistics</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold mb-2">Digital Management</h3>
            <ul className="list-disc pl-5 text-gray-600">
              <li>Automated check-in/out</li>
              <li>Equipment inventory</li>
              <li>Usage analytics</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}