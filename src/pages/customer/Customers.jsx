import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';

function Customers() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    brand: '',
    model: '',
    issue: ''
  });

  const [customers, setCustomers] = useState([]);

  const loadCustomers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error('Error loading customers:', err);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/customers', form);
      setForm({
        name: '',
        phone: '',
        brand: '',
        model: '',
        issue: ''
      });
      loadCustomers();
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  return (
    <div className='customers'>
      <Sidebar />
      <div className='customersContainer'>
        <Navbar />
        <div className='container'>
          <form onSubmit={handleSubmit}>
            <h2>Add Customer</h2>
            <label>Customer Name:</label>
            <input
              type='text'
              name='name'
              placeholder='Customer Name'
              value={form.name}
              onChange={handleChange}
              required
            />
            <label>Phone No:</label>
            <input
              type='text'
              name='phone'
              placeholder='Contact'
              value={form.phone}
              onChange={handleChange}
              required
            />
            <label>Brand:</label>
            <input
              type='text'
              name='brand'
              placeholder='Brand'
              value={form.brand}
              onChange={handleChange}
              required
            />
            <label>Model:</label>
            <input
              type='text'
              name='model'
              placeholder='Model'
              value={form.model}
              onChange={handleChange}
              required
            />
            <label>Issue:</label>
            <input
              type='text'
              name='issue'
              placeholder='Issue'
              value={form.issue}
              onChange={handleChange}
              required
            />
            <button type='submit' className='btn'>Save</button>
          </form>

          {/* Optional: show saved customers */}
          <h3>Customer List</h3>
          <ul>
            {customers.map((c) => (
              <li key={c._id}>{c.name} - {c.phone}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Customers;
