import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  
  // Set loaded to true after component mounts for animations
  useEffect(() => {
    setLoaded(true);
  }, []);

  return (

    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <motion.header 
        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-20 shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : -20 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-6">
          <motion.h1 
            className="text-5xl font-bold mb-4 tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: loaded ? 1 : 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            University Gymnasium Management System
          </motion.h1>
          <motion.p 
            className="text-xl text-blue-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: loaded ? 1 : 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Streamlining gym access, equipment management, and attendance tracking
          </motion.p>

        </div>
      </motion.header>

      {/* Main Features Section */}
      <section className="container mx-auto px-6 py-16 relative">
        <div className="absolute inset-0 bg-blue-50 rounded-3xl mx-4 my-10 -z-10"></div>
        <motion.h2 
          className="text-3xl font-bold mb-10 text-gray-800 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: loaded ? 1 : 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          What would you like to do?
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature Cards */}
          {[
            {
              title: "Check In/Out",
              description: "Quick digital check-in and check-out for gym access",
              link: "/check-in-out",
              linkText: "Check In/Out",
              icon: "🏃‍♂️",
              color: "from-green-500 to-green-600"
            },
            {
              title: "Check Availability",
              description: "View gym and equipment availability in real-time",
              link: "/view-equipment",
              linkText: "View Status",
              icon: "🔍",
              color: "from-blue-500 to-blue-600"
            },
            {
              title: "Book Equipment",
              description: "Request to borrow gym equipment online",
              link: "/book-equipment",
              linkText: "Book Equipment",
              icon: "🏋️‍♀️",
              color: "from-purple-500 to-purple-600"
            },
            {
              title: "User Dashboard",
              description: "View your activity history and borrowed equipment",
              link: "/dashboard",
              linkText: "Dashboard",
              icon: "📊",
              color: "from-amber-500 to-amber-600"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl shadow-lg overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 20 }}
              transition={{ delay: 0.6 + (index * 0.1), duration: 0.6 }}
            >
              <div className={`bg-gradient-to-r ${feature.color} h-2`}></div>
              <div className="p-8">
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 mb-6 h-14">{feature.description}</p>
                <Link 
                  to={feature.link} 
                  className={`bg-gradient-to-r ${feature.color} text-white px-6 py-3 rounded-lg font-medium inline-block hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {feature.linkText}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* System Features */}
      <section className="container mx-auto px-6 py-16">
        <motion.h2 
          className="text-3xl font-bold mb-10 text-gray-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: loaded ? 1 : 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          System Features
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              title: "Real-time Tracking",
              features: [
                "Attendance monitoring with timestamp records",
                "Equipment usage tracking with detailed histories",
                "Occupancy statistics with visual dashboards"
              ],
              icon: "⚡"
            },
            {
              title: "Digital Management",
              features: [
                "Automated check-in/out with QR code support",
                "Equipment inventory with maintenance status",
                "Usage analytics with exportable reports"
              ],
              icon: "💻"
            }
          ].map((feature, index) => (
            <motion.div 
              key={index}
              className="bg-white p-8 rounded-xl shadow-lg border border-gray-100"
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: loaded ? 1 : 0, x: loaded ? 0 : (index % 2 === 0 ? -20 : 20) }}
              transition={{ delay: 1.1 + (index * 0.1), duration: 0.6 }}
            >
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">{feature.icon}</span>
                <h3 className="text-xl font-semibold text-gray-800">{feature.title}</h3>
              </div>
              <ul className="space-y-3">
                {feature.features.map((item, i) => (
                  <li key={i} className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mt-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <motion.section 
        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ delay: 1.3, duration: 0.8 }}
      >
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join our digital gym management system today and enjoy a seamless experience.
          </p>
          <Link 
            to="/register" 
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-medium text-lg inline-block hover:bg-blue-50 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
          >
            Create an Account
          </Link>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>© 2025 University Gymnasium Management System</p>
            <div className="mt-4 md:mt-0 flex space-x-4">
              <Link to="/about" className="hover:text-blue-300 transition-colors">About</Link>
              <Link to="/contact" className="hover:text-blue-300 transition-colors">Contact</Link>
              <Link to="/help" className="hover:text-blue-300 transition-colors">Help & Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}