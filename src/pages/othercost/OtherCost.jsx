import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';
import './othercost.scss';

const categoryOptions = ['Rent', 'Courier', 'Utilities', 'Repairing Tools', 'Maintenance'];
const paymentOptions = ['Cash', 'Bank'];

const OtherCost = () => {
  const [costs, setCosts] = useState([]);
  const [loans, setLoans] = useState([]);
  const [newCost, setNewCost] = useState({
    category: '',
    item: '',
    details: '',
    unitPrice: '',
    quantity: '',
    total: '',
    date: '',
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // -------------------
  // Fetch Other Costs
  // -------------------
  const fetchCosts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/costs');
      setCosts(res.data);
    } catch (err) {
      console.error('Error fetching costs:', err);
    }
  };

  // -------------------
  // Fetch Loans with optional date filter
  // -------------------
  const fetchLoans = useCallback(async () => {
    try {
      let url = 'http://localhost:5000/api/sales/loans';
      const params = {};
      if (filterStartDate) params.from = filterStartDate;
      if (filterEndDate) params.to = filterEndDate;

      const res = await axios.get(url, { params });
      setLoans(res.data);
    } catch (err) {
      console.error('Error fetching loans:', err);
    }
  }, [filterStartDate, filterEndDate]);

  useEffect(() => {
    fetchCosts();
    fetchLoans();
  }, [fetchLoans]);

  // -------------------
  // Handle form input changes
  // -------------------
  const handleChange = (field, value) => {
    const updated = { ...newCost, [field]: value };
    if (field === 'unitPrice' || field === 'quantity') {
      const price = parseFloat(updated.unitPrice) || 0;
      const qty = parseFloat(updated.quantity) || 0;
      updated.total = (price * qty).toFixed(2);
    }
    setNewCost(updated);
  };

  // -------------------
  // Save or update cost
  // -------------------
  const handleSave = async () => {
    const { category, total, date } = newCost;
    if (!category || !total || !date) {
      alert('Category, Total and Date are required');
      return;
    }
    try {
      if (editingIndex !== null) {
        const id = costs[editingIndex]._id;
        await axios.put(`http://localhost:5000/api/costs/${id}`, newCost);
        alert('Cost updated');
      } else {
        await axios.post('http://localhost:5000/api/costs', newCost);
        alert('Cost added');
      }
      setNewCost({ category:'', item:'', details:'', unitPrice:'', quantity:'', total:'', date:'' });
      setEditingIndex(null);
      fetchCosts();
    } catch (err) {
      console.error('Error saving cost:', err);
    }
  };

  // -------------------
  // Edit and Delete handlers
  // -------------------
  const handleEdit = (index) => {
    setNewCost({ ...costs[index] });
    setEditingIndex(index);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this cost?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/costs/${id}`);
      fetchCosts();
    } catch (err) {
      console.error('Error deleting cost:', err);
    }
  };

  // -------------------
  // Mark Loan as Paid
  // -------------------
  const handleMarkPaid = async (loanId, paymentMethod) => {
    if (!window.confirm('Mark this loan as paid?')) return;

    try {
      const res = await axios.put(`http://localhost:5000/api/sales/loans/${loanId}/paid`, {
        paymentMethod
      });
      alert(res.data.message);
      fetchLoans();  // refresh the loan table
    } catch (err) {
      console.error('Error marking loan as paid:', err);
      alert(err.response?.data?.message || 'Failed to mark as paid');
    }
  };

  // -------------------
  // Filtered Costs & Loans
  // -------------------
  const filteredCosts = costs.filter(c => {
    const d = new Date(c.date);
    const from = filterStartDate ? new Date(filterStartDate) : null;
    const to = filterEndDate ? new Date(filterEndDate) : null;
    return (!from || d >= from) && (!to || d <= to);
  });

  const filteredLoans = loans.filter(l => {
    const d = new Date(l.saleDate);
    return (!filterStartDate || d >= new Date(filterStartDate)) &&
           (!filterEndDate || d <= new Date(filterEndDate));
  });

  const totalCost = filteredCosts.reduce((sum, c) => sum + Number(c.total || 0), 0);
  const totalLoan = filteredLoans.reduce((sum, l) => sum + Number(l.amount || 0), 0);

  return (
    <div className="other-cost">
      <Sidebar />
      <div className="costContainer">
        <Navbar />
        <h2>Other Costs</h2>

        {/* Cost Form */}
        <div className="form-section">
          <select value={newCost.category} onChange={e => handleChange('category', e.target.value)}>
            <option value="">Select Category</option>
            {categoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <input type="text" placeholder="Item" value={newCost.item} onChange={e => handleChange('item', e.target.value)} />
          <input type="text" placeholder="Details" value={newCost.details} onChange={e => handleChange('details', e.target.value)} />
          <input type="number" placeholder="Per Unit Price" value={newCost.unitPrice} onChange={e => handleChange('unitPrice', e.target.value)} />
          <input type="number" placeholder="Quantity" value={newCost.quantity} onChange={e => handleChange('quantity', e.target.value)} />
          <input type="number" placeholder="Total" value={newCost.total} readOnly />
          <input type="date" value={newCost.date} onChange={e => handleChange('date', e.target.value)} />
          <button onClick={handleSave}>{editingIndex !== null ? 'Update' : 'Add Cost'}</button>
        </div>

        {/* Filters */}
        <div className="filter-section">
          <label>From: <input type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} /></label>
          <label>To: <input type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} /></label>
        </div>

        {/* Other Costs Table */}
        <table className="cost-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Category</th>
              <th>Item</th>
              <th>Details</th>
              <th>Unit Price</th>
              <th>Quantity</th>
              <th>Total</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCosts.map((cost, index) => (
              <tr key={cost._id}>
                <td>{index + 1}</td>
                <td>{cost.category}</td>
                <td>{cost.item}</td>
                <td>{cost.details}</td>
                <td>Rs. {parseFloat(cost.unitPrice || 0).toFixed(2)}</td>
                <td>{cost.quantity}</td>
                <td>Rs. {parseFloat(cost.total || 0).toFixed(2)}</td>
                <td>{new Date(cost.date).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleEdit(index)}>Edit</button>
                  <button onClick={() => handleDelete(cost._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="total-display">
          <strong>Total Costs:</strong> Rs. {totalCost.toFixed(2)}
        </div>

        {/* Loan Details Table */}
        <h2>Loan Details</h2>
        <table className="cost-table">
          <thead>
            <tr>
              <th>Job No</th>
              <th>Customer Name</th>
              <th>Phone No</th>
              <th>Brand</th>
              <th>Model</th>
              <th>Item</th>
              <th>Service</th>
              <th>Loan Amount</th>
              <th>Sale Date</th>
              <th>Payment Method</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLoans.map((loan) => (
              <tr key={loan._id}>
                <td>{loan.jobNo}</td>
                <td>{loan.customerName}</td>
                <td>{loan.phone}</td>
                <td>{loan.brand}</td>
                <td>{loan.model}</td>
                <td>{loan.item || '-'}</td>
                <td>{loan.service || '-'}</td>
                <td>Rs. {parseFloat(loan.amount || 0).toFixed(2)}</td>
                <td>{new Date(loan.saleDate).toLocaleDateString()}</td>
                <td>
                  {loan.paymentStatus === 'Paid' 
                    ? loan.paymentMethod || '-' 
                    : (
                      <select
                        value={loan.paymentMethod || 'Cash'}
                        onChange={(e) =>
                          setLoans((prev) =>
                            prev.map((l) =>
                              l._id === loan._id ? { ...l, paymentMethod: e.target.value } : l
                            )
                          )
                        }
                      >
                        {paymentOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    )
                  }
                </td>
                <td>
                  {loan.paymentStatus !== 'Paid' ? (
                    <button onClick={() => handleMarkPaid(loan._id, loan.paymentMethod || 'Cash')}>Paid</button>
                  ) : (
                    <span>Paid</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="total-display">
          <strong>Total Loan Amount:</strong> Rs. {totalLoan.toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default OtherCost;
