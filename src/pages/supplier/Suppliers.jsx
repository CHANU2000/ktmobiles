import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "./supplier.scss";
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';

function Suppliers() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', desc: '' });
  const [suppliers, setSuppliers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
const [popupVisible, setPopupVisible] = useState(false);


const showPopup = (message) => {
  setPopupMessage(message);
  setPopupVisible(true);

  setTimeout(() => {
    setPopupVisible(false);
  }, 3000); // hides after 3 seconds
};


  const loadSuppliers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/suppliers');
      setSuppliers(res.data);
    } catch (err) {
      console.error('Error loading supplier:', err);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { ...form };
      if (editId) {
        await axios.put(`http://localhost:5000/api/suppliers/${editId}`, dataToSend);
showPopup('Supplier updated successfully');
        setEditId(null);
      } else {
        await axios.post('http://localhost:5000/api/suppliers', dataToSend);
        showPopup('Supplier added successfully');
      }
      setForm({ name: '', email: '', phone: '', address: '', desc: '' });
      setShowForm(false);
      loadSuppliers();
    } catch (err) {
      console.error('Error submitting supplier form:', err);
      alert('Failed to submit supplier. Check console for error.');
    }
  };

  const handleEdit = (supplier) => {
    const { _id, ...rest } = supplier;
    setForm(rest);
    setEditId(_id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/suppliers/${id}`);
      loadSuppliers();
    } catch (err) {
      console.error('Error deleting supplier:', err);
      alert('Failed to delete supplier');
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setForm({ name: '', email: '', phone: '', address: '', desc: '' });
    setEditId(null);
  };

  return (
    <div className="supplier">
      <Sidebar />
      <div className="supplierContainer">
        <Navbar />

        {popupVisible && (
  <div className="popupMessage">
    {popupMessage}
  </div>
)}


        <div className="header">
          <button className="btn open-btn" onClick={() => setShowForm(true)}>Add Supplier</button>
        </div>

        {showForm && (
          <div className="modalOverlay" onClick={closeForm}>
            <div className="modalContent" onClick={(e) => e.stopPropagation()}>
              <form onSubmit={handleSubmit}>
                <h2>{editId ? 'Edit Supplier' : 'Add Supplier'}</h2>

                <label>Supplier Name:</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />

                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />

                <label>Phone No:</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="Contact"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />

                <label>Address:</label>
                <textarea
                  name="address"
                  placeholder="Address"
                  value={form.address}
                  onChange={handleChange}
                  required
                />

                <label>Description:</label>
                <textarea
                  name="desc"
                  placeholder="Description"
                  value={form.desc}
                  onChange={handleChange}
                  required
                />

                <div className="formButtons">
                  <button type="submit" className="btn submit-btn">{editId ? 'Update' : 'Add'}</button>
                  <button type="button" className="btn cancel-btn" onClick={closeForm}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <h2>Suppliers List</h2>
        <table className='innertable'>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s._id}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.phone}</td>
                <td>{s.address}</td>
                <td>{s.desc}</td>
                <td>
                  <button onClick={() => handleEdit(s)} className='button'>Edit</button>
                  <br /><br />
                  <button onClick={() => handleDelete(s._id)} className='button'>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
}

export default Suppliers;
