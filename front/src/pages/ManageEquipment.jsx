import React, { useState } from 'react'

export default function ManageEquipment() {
  // Sample equipment data - replace with API call later
  const [equipment] = useState([
    { id: 1, name: 'Basketball', quantity: 10, available: 8, category: 'Sports Ball' },
    { id: 2, name: 'Dumbbell Set', quantity: 5, available: 3, category: 'Weights' },
    { id: 3, name: 'Yoga Mat', quantity: 15, available: 12, category: 'Exercise Mat' },
    { id: 4, name: 'Badminton Racket', quantity: 8, available: 6, category: 'Racket Sports' },
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = ['all', 'Sports Ball', 'Weights', 'Exercise Mat', 'Racket Sports']

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Equipment Management</h1>

        {/* Search and Filter Section */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search equipment..."
              className="border p-2 rounded flex-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="border p-2 rounded w-full md:w-48"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Equipment List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">{item.name}</h2>
              <p className="text-gray-600 mb-2">Category: {item.category}</p>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm">
                  Available: {item.available}/{item.quantity}
                </span>
                <span className={`px-2 py-1 rounded text-sm ${
                  item.available > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {item.available > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              <div className="flex gap-2">
                <button 
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex-1"
                  disabled={item.available === 0}
                >
                  Borrow
                </button>
                <button 
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex-1"
                  disabled={item.available === item.quantity}
                >
                  Return
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}