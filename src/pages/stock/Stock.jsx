import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './stock.scss';
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';

const Stock = () => {
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState({
    supplier: '', itemCode:'', brand: '', model: '', item: '', quality: '', from: '', to: '', formattedStockId: ''
  });
  const [supplier, setSupplier] = useState('');
  const [otherCost, setOtherCost] = useState(0);
  const [editingItem, setEditingItem] = useState(null);
  const [formItems, setFormItems] = useState([
    {
      brand: "",
      model: "",
      item: "",
      quality: "",
      description: "",
      unitPrice: "",
      quantity: 1,
      saleprice: "",
      availability: "Available",
      totalprice: 0,
      itemCode: "",
    },
  ]);
  const [nextStockId, setNextStockId] = useState(null);
  const [viewMode, setViewMode] = useState("all");
  const [expandedRows, setExpandedRows] = useState({}); // track expanded state per item-wise group
  const [soldQuantities, setSoldQuantities] = useState({});


  const toggleRow = (key) => {
    setExpandedRows(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    fetchData();
    fetchNextStockId();
  }, []);

  const fetchData = async () => {
    try {
      const [supplierRes, stockRes] = await Promise.all([
        axios.get('http://localhost:5000/api/suppliers'),
        axios.get('http://localhost:5000/api/stocks')
      ]);
      setSuppliers(supplierRes.data);
      setItems(stockRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
      alert("Failed to load suppliers or stock data.");
    }
  };

  const fetchNextStockId = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/stocks/next-id');
      setNextStockId(res.data.nextId);
    } catch (err) {
      console.error('Failed to fetch next stock ID:', err);
    }
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const filteredItems = items.filter(item => {
    const createdDate = new Date(item.createdAt);
    const from = filter.from ? new Date(filter.from) : null;
    const to = filter.to ? new Date(filter.to) : null;

    return (
      (!filter.supplier || item.supplier?.toLowerCase().startsWith(filter.supplier.toLowerCase())) &&
      (item.itemCode || '').toLowerCase().startsWith(filter.itemCode.toLowerCase()) &&
      (!filter.brand || item.brand?.toLowerCase().startsWith(filter.brand.toLowerCase())) &&
      (!filter.model || item.model?.toLowerCase().startsWith(filter.model.toLowerCase())) &&
      (!filter.item || item.item?.toLowerCase().startsWith(filter.item.toLowerCase())) &&
      (!filter.formattedStockId || item.formattedStockId?.toLowerCase().startsWith(filter.formattedStockId.toLowerCase())) &&
      (!filter.quality || item.quality?.toLowerCase().startsWith(filter.quality.toLowerCase())) &&
      (!from || createdDate >= from) &&
      (!to || createdDate <= to)
    );
  });
  const handleSoldQtyChange = (groupKey, purchaseIndex, value) => {
  const qty = parseInt(value) || 0;

  setSoldQuantities(prev => ({
    ...prev,
    [`${groupKey}-${purchaseIndex}`]: qty
  }));
};


  const calculateTotalStockCost = () => {
  return items.reduce((sum, item) => {
    const totalCost = item.totalcost !== undefined
      ? parseFloat(item.totalcost) || 0
      : ((parseFloat(item.totalprice) || 0) + (parseFloat(item.othercost) || 0));
    return sum + totalCost;
  }, 0).toFixed(2);
};


  const calculateGrandTotal = () => {
  const totalPriceSum = formItems.reduce((sum, item) => sum + ((parseFloat(item.unitPrice) || 0) * (parseInt(item.quantity) || 0)), 0);
  return (totalPriceSum + (parseFloat(otherCost) || 0)).toFixed(2);
};

  const calculateTotalPriceSum = () => {
    return formItems.reduce((sum, item) => {
      const total = (parseFloat(item.unitPrice) || 0) * (parseFloat(item.quantity) || 0);
      return sum + total;
    }, 0).toFixed(2);
  };

  const handleItemChange = async (index, e) => {
  const { name, value } = e.target;
  const updatedItems = [...formItems];
  updatedItems[index][name] = value;

  const qty = parseFloat(updatedItems[index].quantity) || 0;
  const unit = parseFloat(updatedItems[index].unitPrice) || 0;
  updatedItems[index].totalprice = unit * qty;

  setFormItems(updatedItems);

  // ✅ When brand/model/item/quality are entered, fetch itemCode from backend
  if (['brand', 'model', 'item', 'quality'].includes(name)) {
    const current = updatedItems[index];

    if (current.brand && current.model && current.item && current.quality) {
      try {
        const res = await axios.get("http://localhost:5000/api/stocks/by-details", {
          params: {
            brand: current.brand,
            model: current.model,
            item: current.item,
            quality: current.quality
          }
        });

        updatedItems[index].itemCode = res.data.itemCode || "";
        updatedItems[index].description = res.data.description || "";
        updatedItems[index].unitPrice = res.data.unitPrice || "";
        updatedItems[index].saleprice = res.data.saleprice || "";

        setFormItems([...updatedItems]);
      } catch (err) {
        console.warn("No stock found for given details");
        // If not found, clear itemCode
        updatedItems[index].itemCode = "";
        setFormItems([...updatedItems]);
      }
    }
  }
};

 const calculateCosts = () => {
  const fixedOtherCost = parseFloat(otherCost) || 0;
  const totalQty = formItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);

  return formItems.map(item => {
    const qty = parseInt(item.quantity) || 0;
    const unit = parseFloat(item.unitPrice) || 0;
    const totalprice = unit * qty;
    const extraCost = totalQty ? (fixedOtherCost / totalQty) * qty : 0; // allocate otherCost proportionally
    const totalcost = totalprice + extraCost; // ✅ total cost = total price + other cost
    const unitothercost = qty ? extraCost / qty : 0;
    const unittotalcost = qty ? totalcost / qty : 0;

    return {
      ...item,
      supplier,
      unitPrice: unit,
      quantity: qty,
      totalprice,
      othercost: extraCost,
      unitothercost,
      totalcost,      // ✅ updated
      unittotalcost,  // ✅ updated
      saleprice: parseFloat(item.saleprice) || 0,
      availability: item.availability || 'Available'
    };
  });
};

  const handleKeyDown = (e, index) => {
  if (e.key === 'Enter') {
    e.preventDefault();

    const currentItem = formItems[index];
    const isLastRow = index === formItems.length - 1;

    const isFilled =
      (currentItem.item || '').trim() !== '' &&
      (currentItem.itemCode || '').trim() !== '' &&
      currentItem.unitPrice !== '' &&
      currentItem.quantity !== '';

    if (isLastRow && isFilled) {
      setFormItems(prev => [
        ...prev,
        {
          brand: '', model: '', item: '', quality: '', description: '',
          unitPrice: '', quantity: 1, saleprice: '', availability: 'Available', totalprice: 0, itemCode: ''
        }
      ]);
    }
  }
};

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!supplier) return alert("Please select a supplier.");
  if (formItems.some(item => !item.item || !item.itemCode || item.unitPrice === '' || item.quantity === '')) {
    return alert("Please fill all required fields, including Item Code.");
  }

  const year = new Date().getFullYear();
  const formattedStockId = editingItem?.formattedStockId || `STK-${year}-${String(nextStockId).padStart(4, '0')}`;

  const payload = calculateCosts().map(item => ({ ...item, formattedStockId, purchaseNo: formattedStockId }));

  try {
    if (editingItem) {
      const res = await axios.put(`http://localhost:5000/api/stocks/${editingItem._id}`, payload[0]);
      setItems(prev => prev.map(item => item._id === res.data._id ? res.data : item));
    } else {
      const res = await axios.post('http://localhost:5000/api/stocks/add-multiple', { items: payload });
      setItems(prev => [...prev, ...res.data]);
      fetchNextStockId();
    }
    resetForm();
  } catch (err) {
    console.error("Submission failed", err);
    if (err.response?.data?.message?.includes('itemCode_1 dup key')) {
      alert('Duplicate Item Code detected. Please check your entries or try again.');
    } else {
      alert("Submission failed.");
    }
  }
};


  const handleEdit = (item) => {
    setEditingItem(item);
    setSupplier(item.supplier);
    setOtherCost(item.othercost || 0);
    setFormItems([{ ...item, saleprice: item.saleprice || '', availability: item.availability || 'Available' }]);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await axios.delete(`http://localhost:5000/api/stocks/${id}`);
        setItems(prev => prev.filter(item => item._id !== id));
      } catch (err) {
        console.error("Delete failed", err);
        alert("Delete failed.");
      }
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setSupplier('');
    setOtherCost(0);
    setFormItems([{
      brand: '', model: '', item: '', quality: '', description: '',
      unitPrice: '', quantity: 1, saleprice: '', availability: 'Available', totalprice: 0, itemCode: ''
    }]);
    setShowForm(false);
  };

  return (
    <div className='stock'>
      <Sidebar />
      <div className='stockCon'>
        <Navbar />
        <div className="stockContainer">
          <h2>STOCK MANAGEMENT</h2>

          {/* Filters */}
          <div className="filters">
            <select name="supplier" value={filter.supplier} onChange={handleFilterChange}>
              <option value="">All Suppliers</option>
              {suppliers.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
            </select>
            <input name="itemCode" placeholder="Item Code" value={filter.itemCode} onChange={handleFilterChange} />
            <input name="brand" placeholder="Brand" value={filter.brand} onChange={handleFilterChange} />
            <input name="model" placeholder="Model" value={filter.model} onChange={handleFilterChange} />
            <input name="item" placeholder="Item" value={filter.item} onChange={handleFilterChange} />
            <input name="quality" placeholder="Quality" value={filter.quality} onChange={handleFilterChange} />
            <input name="formattedStockId" placeholder="Enter Purchase NO" value={filter.formattedStockId} onChange={handleFilterChange} />
            <input type="date" name="from" value={filter.from} onChange={handleFilterChange} />
            <input type="date" name="to" value={filter.to} onChange={handleFilterChange} />
            <button className="addbtn" onClick={() => { setShowForm(true); setFilter({ supplier: '', itemCode:'', brand: '', model: '', item: '', quality: '', from: '', to: '', formattedStockId: '' }); }}>
              + ADD PURCHASE
            </button>
          </div>

          <div className="view-toggle">
            <button onClick={() => setViewMode("all")}>All Stock Data</button>
            <button onClick={() => setViewMode("itemwise")}>Item-wise Stock</button>
          </div>

          <div className="stock-total">
            <strong>Total Stock Cost: Rs. {calculateTotalStockCost()}</strong>
          </div>

          {/* Stock Tables */}
          {viewMode === "all" ? (
            <table className="stocktable">
              <thead>
                <tr>
                  <th>ID</th><th>Item Code</th><th>Item</th><th>Brand</th>
                  <th>Model</th><th>Quality</th><th>Description</th><th>Supplier</th>
                  <th>Unit Price</th><th>Qty</th><th>Total Price</th>
                  <th>Other Cost</th><th>Unit Other Cost</th><th>Total Cost</th>
                  <th>Unit Total Cost</th><th>Sale Price</th><th>Purchase No</th><th>Date</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, i) => (
                  <tr key={item._id}>
                    <td>{item.stockId || (i+1)}</td>
                    <td>{item.itemCode}</td>
                    <td>{item.item}</td>
                    <td>{item.brand}</td>
                    <td>{item.model}</td>
                    <td>{item.quality}</td>
                    <td>{item.description}</td>
                    <td>{item.supplier}</td>
                    <td>Rs. {(parseFloat(item.unitPrice) || 0).toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td>Rs. {(parseFloat(item.totalprice) || 0).toFixed(2)}</td>
                    <td>Rs. {(parseFloat(item.othercost) || 0).toFixed(2)}</td>
                    <td>Rs. {(parseFloat(item.unitothercost) || 0).toFixed(2)}</td>
                    <td>Rs. {(parseFloat(item.totalcost) || 0).toFixed(2)}</td>
                    <td>Rs. {(parseFloat(item.unittotalcost) || 0).toFixed(2)}</td>
                    <td>Rs. {(parseFloat(item.saleprice) || 0).toFixed(2)}</td>
                    <td>{item.formattedStockId}</td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button onClick={() => handleEdit(item)}>✏️</button>
                      <button onClick={() => handleDelete(item._id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="stocktable">
  <thead>
    <tr>
      <th>#</th>
      <th>Item</th>
      <th>Brand</th>
      <th>Model</th>
      <th>Quality</th>
      <th>Total Qty</th>
      <th>Available Qty</th>
      <th>Total Cost</th>
      <th>Sale Price</th>
    </tr>
  </thead>
  <tbody>
    {Object.values(items.reduce((acc, item, idx) => {
      const key = `${item.item}-${item.brand}-${item.model}-${item.quality}`;
      if (!acc[key]) acc[key] = { ...item, totalQty: 0, totalCost: 0, purchases: [] };
      acc[key].totalQty += parseInt(item.quantity) || 0;
      acc[key].totalCost += parseFloat(item.totalcost || (item.unitPrice * item.quantity)) || 0;
      acc[key].purchases.push({ ...item, index: idx });
      return acc;
    }, {})).map((group, idx) => {
      const key = `${group.item}-${group.brand}-${group.model}-${group.quality}`;
      const isExpanded = !!expandedRows[key];

      // Calculate sold quantity for this group
      const soldQty = group.purchases.reduce((sum, p, i) => {
        return sum + (soldQuantities?.[`${key}-${i}`] || 0);
      }, 0);

      const availableQty = group.totalQty - soldQty;

      return (
        <React.Fragment key={idx}>
          {/* Group Row */}
          <tr onClick={() => toggleRow(key)} style={{ cursor: 'pointer' }}>
            <td>{isExpanded ? '▼' : '▶'}</td>
            <td>{group.item}</td>
            <td>{group.brand}</td>
            <td>{group.model}</td>
            <td>{group.quality}</td>
            <td>{group.totalQty}</td>
            <td>{availableQty}</td>
            <td>Rs. {(group.totalCost || 0).toFixed(2)}</td>
            <td>Rs. {(parseFloat(group.saleprice) || 0).toFixed(2)}</td>
          </tr>

          {/* Expanded Purchase Rows */}
{isExpanded && group.purchases.map((p, i) => (
  <tr key={i} className="nested-row">
    <td></td>
    <td>Purchase No: {p.formattedStockId}</td>
    <td>Date: {new Date(p.createdAt).toLocaleDateString()}</td>
    <td>Supplier: {p.supplier}</td>
    <td>Qty: {p.quantity}</td>
    <td>
      Sold Qty: 
      <input
        type="number"
        min="0"
        max={p.quantity}
        value={soldQuantities?.[`${key}-${i}`] || 0}
        onChange={(e) => handleSoldQtyChange(key, i, e.target.value)}
        style={{ width: '60px' }}
      />
    </td>
    <td>Unit Price: Rs. {(parseFloat(p.unitPrice) || 0).toFixed(2)}</td>
    <td>Total Price: Rs. {(parseFloat(p.totalprice) || 0).toFixed(2)}</td>
    <td>Total Cost: Rs. {(parseFloat(p.totalcost) || 0).toFixed(2)}</td>
    <td>Unit Total Cost: Rs.{(parseFloat(p.unittotalcost) || 0).toFixed(2)}</td>
    <td>Sale Price: Rs. {(parseFloat(p.saleprice) || 0).toFixed(2)}</td>
  </tr>
))}

        </React.Fragment>
      );
    })}
  </tbody>
</table>

          )}

          
          {/* Popup Bill View */}
          {showForm && (
            <div className="popup bill-popup">
              <div className="bill-header">
                <div className="bill-info">
                  <h2>{editingItem ? 'Edit Stock Invoice' : 'New Purchase'}</h2>
                  <p><strong>Purchase No:</strong> {
                    editingItem?.formattedStockId ||
                    (nextStockId !== null
                      ? `STK-${new Date().getFullYear()}-${String(nextStockId).padStart(4, '0')}`
                      : 'Loading...')
                  }</p>
                  <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                  <label>
                    <strong>Supplier:</strong>{' '}
                    <select value={supplier} onChange={(e) => setSupplier(e.target.value)} required>
                      <option value="">Select Supplier</option>
                      {suppliers.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                    </select>
                  </label>
                </div>
              </div>

              <table className="bill-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Brand</th>
                    <th>Model</th>
                    <th>Item</th>
                    <th>Quality</th>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Sale Price</th>
                    <th>Total Price</th>
                    <th>Item Code</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formItems.map((item, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td><input name="brand" value={item.brand} onChange={(e) => handleItemChange(idx, e)} /></td>
                      <td><input name="model" value={item.model} onChange={(e) => handleItemChange(idx, e)} /></td>
                      <td><input name="item" value={item.item} onChange={(e) => handleItemChange(idx, e)} required /></td>
                      <td><input name="quality" value={item.quality} onChange={(e) => handleItemChange(idx, e)} /></td>
                      <td><textarea name='description' value={item.description} onChange={(e) => handleItemChange(idx, e)} /></td>
                      <td className='design'>
                        <input
                          type="number"
                          name="quantity"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, e)}
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          name="unitPrice"
                          min="0"
                          step="0.01"
                          value={item.unitPrice || ''}
                          onChange={(e) => handleItemChange(idx, e)}
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          name="saleprice"
                          min="0"
                          step="0.01"
                          value={item.saleprice || ''}
                          onChange={(e) => handleItemChange(idx, e)}
                        />
                      </td>
                      <td>Rs. {item.totalprice.toFixed(2)}</td>
                      <td>
                        <input
  name="itemCode"
  value={item.itemCode || ''}
  onChange={(e) => handleItemChange(idx, e)}
  onKeyDown={(e) => handleKeyDown(e, idx)} // ✅ here
  placeholder="Enter Item Code"
  required
/>

                      </td>
                      <td>
                        <button type="button" onClick={() => setFormItems(items => items.filter((_, i) => i !== idx))}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="totals">
                <label>Total Items: {formItems.length}</label>
                <label>Total Price : Rs. <input type='number' value={calculateTotalPriceSum()} readOnly /></label>
              </div>

              <div className="bill-footer">
                <label>Total Other Cost: &nbsp;
                  <input
                    type="number"
                    value={otherCost}
                    min="0"
                    step="0.01"
                    onChange={(e) => setOtherCost(e.target.value)}
                    required
                  />
                </label>
                <label>Grand Total : Rs. <input type='number' value={calculateGrandTotal()} readOnly /></label>
              </div>

              <div className="bill-actions">
                <button type="button" onClick={handleSubmit}>{editingItem ? 'Update' : 'Save'}</button>
                <button type="button" onClick={resetForm}>Cancel</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Stock;
