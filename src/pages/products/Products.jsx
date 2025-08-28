import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';
import "./products.scss";

function Product() {
  const [form, setForm] = useState({ name: '', brand: '', category: '',ql:'' });
  const [products, setProducts] = useState([]);
  const [editId, setEditId] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      setProducts(res.data);
    } catch (err) {
      alert("Failed to fetch products");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/products/${editId}`, form);
        setEditId(null);
      } else {
        await axios.post("http://localhost:5000/api/products", form);
      }
      setForm({ name: '', brand: '', category: '',ql:'' });
      fetchProducts();
    } catch (err) {
      alert("Failed to save product");
    }
  };

  const handleEdit = (product) => {
    const { _id, ...rest } = product;
    setEditId(_id);
    setForm(rest);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this product?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert("Failed to delete product");
    }
  };

  return (
    <div className='product'>
      <Sidebar />
      <div className='productContainer'>
        <Navbar />
        <div className='container'>
          <h2>{editId ? 'Edit Product' : 'Add Product'}</h2>
          <form onSubmit={handleSubmit}>
            <label>Product Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required />
            <label>Brand</label>
            <input type="text" name="brand" value={form.brand} onChange={handleChange} />
            <label>Model</label>
            <input type="text" name="category" value={form.category} onChange={handleChange} />
            <label>Quality</label>
            <select value={form.ql} onChange={handleChange} type="text" name='ql'>
        <option value="">-- Choose --</option>
        <option >SVC</option>
        <option >OLED</option>
        <option >H/Q</option>
        <option>Local</option>
        <option>Used Original</option>
        <option>Original New</option>
      </select>
            
            <br /><br />
            <button type="submit">{editId ? 'Update' : 'Add'} Product</button>
          </form>

          <h3>Product List</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Brand</th><th>Model</th><th>Quality</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{p.brand}</td>
                  <td>{p.category}</td>
                  <td>{p.ql}</td>
                  <td>
                    <button className='btn' onClick={() => handleEdit(p)}>Edit</button><br /><br />
                    <button className='btn' onClick={() => handleDelete(p._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </div>
    </div>
  );
}

export default Product;
