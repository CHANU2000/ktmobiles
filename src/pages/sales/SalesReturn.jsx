import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';
import './salesreturn.scss';

const SalesReturn = () => {
  const [invoiceNo, setInvoiceNo] = useState('');
  const [saleData, setSaleData] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [returnServices, setReturnServices] = useState([]);
  const [returnHistory, setReturnHistory] = useState([]);

  useEffect(() => {
    fetchReturnHistory();
  }, []);

  const fetchReturnHistory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/sales-returns');
      setReturnHistory(res.data);
    } catch (err) {
      console.error('Error fetching return history:', err);
    }
  };

  const fetchSale = async () => {
    if (!invoiceNo.trim()) return alert('Please enter an invoice number');

    try {
      const res = await axios.get(`http://localhost:5000/api/sales/by-invoice/${invoiceNo}`);
      setSaleData(res.data);

      // Prepare items for return
      setReturnItems(
        res.data.items.map(i => ({
          ...i,
          itemCode: i.itemCode,
          originalQuantity: i.quantity,
          returnQuantity: 0,
          returnType: 'not return' // default
        }))
      );

      // Prepare services for return
      setReturnServices(
        res.data.services
          ? res.data.services.map(s => ({
              ...s,
              returnPrice: s.price,
              returnType: 'not return' // default
            }))
          : []
      );
    } catch (err) {
      console.error(err);
      alert('Sale not found');
      setSaleData(null);
      setReturnItems([]);
      setReturnServices([]);
    }
  };

  const handleReturnQtyChange = (index, qty) => {
    const updated = [...returnItems];
    if (qty < 0) qty = 0;
    if (qty > updated[index].originalQuantity) qty = updated[index].originalQuantity;
    updated[index].returnQuantity = qty;
    setReturnItems(updated);
  };

  const handleItemReturnTypeChange = (index, type) => {
    const updated = [...returnItems];
    updated[index].returnType = type;
    setReturnItems(updated);
  };

  const handleServiceReturnPriceChange = (index, price) => {
    const updated = [...returnServices];
    if (price < 0) price = 0;
    if (price > updated[index].price) price = updated[index].price;
    updated[index].returnPrice = price;
    setReturnServices(updated);
  };

  const handleServiceReturnTypeChange = (index, type) => {
    const updated = [...returnServices];
    updated[index].returnType = type;
    setReturnServices(updated);
  };

  const handleSaveReturn = async () => {
  const itemsToReturn = returnItems.filter(i => i.returnQuantity > 0);
  const servicesToReturn = returnServices.filter(s => s.returnPrice > 0);

  if (itemsToReturn.length === 0 && servicesToReturn.length === 0) {
    alert('Please enter at least one item or service to return.');
    return;
  }

  const payload = {
    originalInvoiceNo: invoiceNo,
    customer: saleData.customer,
    phone: saleData.phone,
    items: itemsToReturn.map(i => ({
      itemCode: i.itemCode,
      itemName: i.itemName,
      brand: i.brand,
      model: i.model,
      quality: i.quality,
      unitPrice: i.unitPrice,
      quantity: i.returnQuantity,
      returnType: i.returnType || 'not return'
    })),
    services: servicesToReturn.map(s => ({
      serviceName: s.serviceName,
      description: s.description || '',
      price: s.returnPrice,
      returnType: s.returnType || 'not return',
      brand: s.brand || saleData.brand,  // add brand
      model: s.model || saleData.model   // add model
    })),
    paymentMethod: saleData.paymentMethod
  };

  try {
    await axios.post('http://localhost:5000/api/sales-returns', payload);
    alert('Sales return saved successfully');
    setInvoiceNo('');
    setSaleData(null);
    setReturnItems([]);
    setReturnServices([]);
    fetchReturnHistory();
  } catch (err) {
    console.error(err);
    alert('Error saving sales return');
  }
};


  return (
    <div className="sales-return">
      <Sidebar />
      <div className="salesReturnContainer">
        <Navbar />
        <h2>Sales Return</h2>

        {/* Fetch Sale Section */}
        <div className="fetch-section">
          <label>Original Invoice No:</label>
          <input
            value={invoiceNo}
            onChange={e => setInvoiceNo(e.target.value)}
            placeholder="Enter invoice number"
          />
          <button onClick={fetchSale}>Fetch Sale</button>
        </div>

        {/* Return Form */}
        {saleData && (
          <>
            <h3>Customer: {saleData.customer}</h3>
            <h4>Phone: {saleData.phone}</h4>
            <h4>Brand: {saleData.brand}</h4>
            <h4>Model: {saleData.model}</h4>

            {/* Items Table */}
            {returnItems.length > 0 && (
              <>
                <h4>Items</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Brand / Model</th>
                      <th>Qty Sold</th>
                      <th>Qty to Return</th>
                      <th>Unit Price</th>
                      <th>Return Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnItems.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.itemName}</td>
                        <td>{item.brand} / {item.model}</td>
                        <td>{item.originalQuantity}</td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            max={item.originalQuantity}
                            value={item.returnQuantity}
                            onChange={e =>
                              handleReturnQtyChange(idx, parseInt(e.target.value) || 0)
                            }
                          />
                        </td>
                        <td>{item.unitPrice}</td>
                        <td>
                          <select
                            value={item.returnType}
                            onChange={e => handleItemReturnTypeChange(idx, e.target.value)}
                          >
                            <option value="return stock">Return Stock</option>
                            <option value="return lost">Return Lost</option>
                            <option value="replaced">Replaced</option>
                            <option value="not return">Not Return</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

           {/* Services Table */}
{returnServices.length > 0 && (
  <>
    <h4>Services</h4>
    <table>
      <thead>
        <tr>
          <th>Service</th>
          <th>Brand / Model</th>
          <th>Original Price</th>
          <th>Return Price</th>
          <th>Return Type</th>
        </tr>
      </thead>
      <tbody>
        {returnServices.map((s, idx) => (
          <tr key={idx}>
            <td>{s.serviceName}</td>
            <td>{s.brand || saleData.brand} / {s.model || saleData.model}</td>
            <td>{s.price}</td>
            <td>
              <input
                type="number"
                min="0"
                max={s.price}
                value={s.returnPrice}
                onChange={e =>
                  handleServiceReturnPriceChange(idx, parseFloat(e.target.value) || 0)
                }
              />
            </td>
            <td>
              <select
                value={s.returnType}
                onChange={e => handleServiceReturnTypeChange(idx, e.target.value)}
              >
                <option value="return">Return</option>
                <option value="not return">Not Return</option>
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
)}


            <button onClick={handleSaveReturn}>Save Return</button>
          </>
        )}

        {/* Return History Table */}
        <h2>Sales Return History</h2>
        {/* Reset Button */}
<button
  className="reset-btn"
  onClick={async () => {
    if (window.confirm('Delete all sales returns and reset IDs?')) {
      try {
        await axios.delete('http://localhost:5000/api/sales-returns/reset');
        alert('Sales returns reset successfully');
        fetchReturnHistory(); // refresh table
      } catch (err) {
        console.error(err);
        alert('Error resetting sales returns');
      }
    }
  }}
>
  Reset Sales Returns
</button>
        <table className="history-table">
          <thead>
            <tr>
              <th>Return ID</th>
              <th>Original Invoice</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Brand / Model</th>
              <th>Items</th>
              <th>Services</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {returnHistory.length > 0 ? (
              returnHistory.map((r, idx) => (
                <tr key={idx}>
                  <td>{String(r.salesReturnNumber).padStart(3, '0')}</td>
                  <td>{r.originalInvoiceNo}</td>
                  <td>{r.customer}</td>
                  <td>{r.phone}</td>
                  <td>
                    {r.items.map((i, iIdx) => (
                      <div key={iIdx}>{i.brand} / {i.model}</div>
                    ))}
                  </td>
                  <td>
                    {r.items.map((i, iIdx) => (
                      <div key={iIdx}>{i.itemName} ({i.quantity}) - {i.returnType}</div>
                    ))}
                  </td>
                 <td>
  {r.services && r.services.length > 0
    ? r.services.map((s, sIdx) => (
        <div key={sIdx}>
          {s.serviceName} - {s.price} ({s.returnType})<br />
          {s.brand} / {s.model}
        </div>
      ))
    : 'N/A'}
</td>

                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">No sales returns found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesReturn;
