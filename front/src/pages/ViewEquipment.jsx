import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ViewEquipment() {
  const [equipment, setEquipment] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = ['all', 'Sports Ball', 'Weights', 'Exercise Mat', 'Racket Sports'];

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await axios.get('/Back/equipment/all');
        if (Array.isArray(response.data)) {
          setEquipment(response.data);
        } else {
          setEquipment([]);
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEquipment();
  }, []);

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div>
      <h1>View Equipment</h1>
      <input
        type="text"
        placeholder="Search equipment"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <ul>
        {filteredEquipment.map((item) => (
          <li key={item.id}>
            {item.name} - {item.available}/{item.quantity} available ({item.category})
          </li>
        ))}
      </ul>
    </div>
  );
}