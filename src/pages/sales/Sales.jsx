import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './sale.scss';
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';
import PrintSale from '../sales/PrintSale';

const Sale = () => {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [prebillDate, setPrebillDate] = useState('');
  const [customerType, setCustomerType] = useState('prebill');
  const [customer, setCustomer] = useState('');
  const [phone, setPhone] = useState('');
  const [customerBrand, setCustomerBrand] = useState('');
  const [customerModel, setCustomerModel] = useState('');
  const [issue, setIssue] = useState('');
  const [condition, setCondition] = useState('');
  const [advance, setAdvance] = useState(0);
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [items, setItems] = useState([
    { itemCode: '', itemName: '', brand: '', model: '', quality: '', quantity: 1, unitPrice: 0, discount: 0 }
  ]);
  const [services, setServices] = useState([{ serviceName: '', description: '', price: 0 }]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [itemCodeOptions, setItemCodeOptions] = useState([]);
   const [printSaleData, setPrintSaleData] = useState(null);

  const itemRefs = useRef([]);
  const serviceRefs = useRef([]);

  // Fetch stock summary to populate itemCode dropdown options
  useEffect(() => {
    axios.get('http://localhost:5000/api/stocks/summary')
      .then(res => {
        const items = res.data.items;
        if (Array.isArray(items)) {
          const flattened = items.flatMap(item => item.qualities || []);
          setItemCodeOptions(flattened);
        }
      })
      .catch(err => console.error('Error fetching item codes:', err));
  }, []);

  // Fetch next invoice number for new customers
  useEffect(() => {
    if (customerType === 'new') {
      fetchNextJobNumber();
    }
  }, [customerType]);

  const fetchNextJobNumber = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/invoices/next-invoice-number');
      setInvoiceNumber(res.data.formattedJobNumber || '');
    } catch (error) {
      console.error('Error fetching next job number:', error);
      alert('Could not fetch next job number.');
    }
  };

  // Calculate total amount whenever items or services change
  useEffect(() => {
    const itemTotal = items.reduce((acc, curr) => {
      const qty = parseFloat(curr.quantity) || 0;
      const price = parseFloat(curr.unitPrice) || 0;
      const discount = parseFloat(curr.discount) || 0;
      return acc + (qty * price - discount);
    }, 0);

    const serviceTotal = services.reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0);
    setTotalAmount(itemTotal + serviceTotal);
  }, [items, services]);

  // Fetch customer info by invoice number for prebill customers
  const fetchCustomerByInvoice = async () => {
    if (!invoiceNumber.trim()) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/invoices/by-invoice/${invoiceNumber}`);
      const data = res.data;

      setCustomer(data.name || '');
      setPhone(data.phone || '');
      setPrebillDate(data.date ? new Date(data.date).toISOString().split('T')[0] : '');
      setCustomerBrand(data.brand || '');
      setCustomerModel(data.model || '');
      setAdvance(data.advance || 0);
      setStatus(data.status || '');

      if (data.issue || data.description || data.salePrice) {
        setServices([
          {
            serviceName: data.issue || '',
            description: data.description || '',
            price: parseFloat(data.salePrice) || 0
          }
        ]);
      } else {
        setServices([{ serviceName: '', description: '', price: 0 }]);
      }
    } catch (err) {
      console.error('Customer pre-invoice not found', err);
      alert('No pre-invoice found for this invoice number');
    }
  };

  // Add new item row in the items table
  const addItemRow = () => {
    setItems(prev => [...prev, { itemCode: '', itemName: '', brand: '', model: '', quality: '', quantity: 1, unitPrice: 0, discount: 0 }]);
  };

  // Add new service row in the services table
  const addServiceRow = () => {
    setServices(prev => [...prev, { serviceName: '', description: '', price: 0 }]);
  };

  // Check if an item has enough data to fetch unit price
  const isFetchable = (item) =>
    item.itemName?.trim() && item.brand?.trim() && item.model?.trim() && item.quality?.trim();

  // Handle changes in items input fields
  const handleItemChange = async (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = ['quantity', 'unitPrice', 'discount'].includes(field)
      ? parseFloat(value) || 0
      : value;
    setItems(updatedItems);

    // If user selects an itemCode, fetch full item details
    if (field === 'itemCode' && value.trim()) {
      try {
        const res = await axios.get(`http://localhost:5000/api/stocks/by-item-code/${encodeURIComponent(value.trim())}`);
        if (res.data) {
          updatedItems[index] = {
            ...updatedItems[index],
            itemCode: res.data.itemCode,
            itemName: res.data.itemName,
            brand: res.data.brand,
            model: res.data.model,
            quality: res.data.quality,
            unitPrice: parseFloat(res.data.unitPrice) || 0,
          };
          setItems([...updatedItems]);
        }
      } catch (error) {
        console.error('Error fetching by itemCode:', error);
        alert('Item code not found.');
      }
    }
  };

  // Fetch unit price for a specific item row based on item details
  const fetchUnitPriceForRow = async (index) => {
    const item = items[index];
    if (!isFetchable(item)) {
      alert('Please fill all fields: Item, Brand, Model, Quality');
      return;
    }

    try {
      const res = await axios.get('http://localhost:5000/api/stocks/unit-price', {
        params: {
          item: item.itemName,
          brand: item.brand,
          model: item.model,
          quality: item.quality,
        },
      });

      const updatedItems = [...items];
      updatedItems[index].unitPrice = parseFloat(res.data?.unitPrice) || 0;
      setItems(updatedItems);
    } catch (error) {
      console.error('Error fetching unit price:', error);
      alert('Unit price not found.');
    }
  };

  // Handle changes in services input fields
  const handleServiceChange = (index, field, value) => {
    const updated = [...services];
    updated[index][field] = field === 'price' ? parseFloat(value) || 0 : value;
    setServices(updated);
  };

  // Keyboard navigation and adding new item rows on Enter key
  const handleItemKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index === items.length - 1) {
        addItemRow();
        setTimeout(() => itemRefs.current[(index + 1) * 8]?.focus(), 100);
      } else {
        itemRefs.current[(index + 1) * 8]?.focus();
      }
    }
  };

  // Keyboard navigation and adding new service rows on Enter key
  const handleServiceKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index === services.length - 1) {
        addServiceRow();
        setTimeout(() => serviceRefs.current[(index + 1) * 3]?.focus(), 100);
      } else {
        serviceRefs.current[(index + 1) * 3]?.focus();
      }
    }
  };

  // Save sale to backend; optionally print after save
  const handleSave = async (printAfterSave, receiptStatus) => {
    const validItems = items.filter(item => item.itemName && item.quantity > 0);
    const validServices = services.filter(service => service.serviceName && service.price >= 0);

    const payload = {
      invoiceNo: invoiceNumber,
      prebillDate,
      customerType,
      customer,
      phone,
      brand: customerBrand,
      model: customerModel,
      issue,
      condition,
      advance,
      status,
      paymentStatus,
      paymentMethod,
      saleDate: new Date(),
      items: validItems,
      services: validServices,
      totalAmount,
      customerReceiptStatus: receiptStatus,
    };

    try {
      await axios.post('http://localhost:5000/api/sales', payload);
      alert('Sale saved successfully');
      
      if (printAfterSave) {
        setPrintSaleData(payload); // show PrintSale with data
      } else {
        resetForm();
      }
    } catch (error) {
      console.error('Error saving sale:', error);
      alert('Failed to save sale');
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setInvoiceNumber('');
    setPrebillDate('');
    setCustomer('');
    setPhone('');
    setCustomerBrand('');
    setCustomerModel('');
    setIssue('');
    setCondition('');
    setAdvance(0);
    setStatus('');
    setPaymentStatus('');
    setPaymentMethod('');
    setItems([{ itemCode: '', itemName: '', brand: '', model: '', quality: '', quantity: 1, unitPrice: 0, discount: 0 }]);
    setServices([{ serviceName: '', description: '', price: 0 }]);
    setTotalAmount(0);
  };

  const remainingAmount = totalAmount - advance;

  return (
    <div className="sale">
      <Sidebar />
      <div className="saleContainer">
        <Navbar />
        <h2>Sales Invoice</h2>
        <form className="sale-form">
          <div className="form-top">
            <label>
              Customer Type:
              <select
                value={customerType}
                onChange={(e) => {
                  const type = e.target.value;
                  setCustomerType(type);
                  if (type === 'new') resetForm();
                }}
              >
                <option value="prebill">Pre Bill Customer</option>
                <option value="new">New Customer</option>
              </select>
            </label>

            {customerType === 'prebill' && (
              <>
                <label>
                  Job No:
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    onBlur={fetchCustomerByInvoice}
                    required
                  />
                </label>
                <label>
                  Prebill Date:
                  <input type="date" value={prebillDate} readOnly />
                </label>
                <label>
                  Advance:
                  <input type="number" value={advance} readOnly />
                </label>
                <label>
                  Status:
                  <input type="text" value={status} readOnly />
                </label>
              </>
            )}

            {customerType === 'new' && (
              <>
                <label>
                  Job No:
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    required
                  />
                </label>
                <label>
                  Issue:
                  <input
                    type="text"
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    required
                  />
                </label>
                <label>
                  Condition:
                  <input
                    type="text"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    required
                  />
                </label>
              </>
            )}

            <label>
              Customer Name:
              <input
                type="text"
                value={customer}
                onChange={customerType === 'new' ? (e) => setCustomer(e.target.value) : undefined}
                readOnly={customerType === 'prebill'}
                required
              />
            </label>
            <label>
              Phone No:
              <input
                type="text"
                value={phone}
                onChange={customerType === 'new' ? (e) => setPhone(e.target.value) : undefined}
                readOnly={customerType === 'prebill'}
                required
              />
            </label>
            <label>
              Brand:
              <input
                type="text"
                value={customerBrand}
                onChange={customerType === 'new' ? (e) => setCustomerBrand(e.target.value) : undefined}
                readOnly={customerType === 'prebill'}
              />
            </label>
            <label>
              Model:
              <input
                type="text"
                value={customerModel}
                onChange={customerType === 'new' ? (e) => setCustomerModel(e.target.value) : undefined}
                readOnly={customerType === 'prebill'}
              />
            </label>
          </div>

          <h3>Items</h3>
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Item</th>
                <th>Brand</th>
                <th>Model</th>
                <th>Quality</th>
                <th className="qty-col">Qty</th>
                <th>Unit Price</th>
                <th>Discount</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row, index) => (
                <tr key={index}>
                  {["itemCode", "itemName", "brand", "model", "quality", "quantity", "unitPrice", "discount"].map((field, i) => (
                    <td key={i}>
                      {field === 'itemCode' ? (
                        <select
                          value={row.itemCode}
                          onChange={(e) => handleItemChange(index, 'itemCode', e.target.value)}
                          ref={(el) => (itemRefs.current[index * 8 + i] = el)}
                        >
                          <option value="">Select Code</option>
                          {itemCodeOptions.map((item, idx) => (
                            <option key={idx} value={item.itemCode}>{item.itemCode}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={["quantity", "unitPrice", "discount"].includes(field) ? "number" : "text"}
                          className={field === 'quantity' ? 'qty-col' : ''}
                          value={row[field]}
                          min={["quantity", "unitPrice", "discount"].includes(field) ? "0" : undefined}
                          ref={(el) => (itemRefs.current[index * 8 + i] = el)}
                          onChange={(e) => handleItemChange(index, field, e.target.value)}
                          onKeyDown={(e) => handleItemKeyDown(e, index)}
                          readOnly={field === 'unitPrice'}
                          style={field === 'unitPrice' ? { backgroundColor: row.unitPrice === 0 ? '#ffd6d6' : '#f0f0f0' } : {}}
                        />
                      )}
                    </td>
                  ))}

                  <td>{(((row.quantity || 0) * (row.unitPrice || 0)) - (row.discount || 0)).toFixed(2)}</td>
                  <td>
                    <button type="button" onClick={() => fetchUnitPriceForRow(index)}>Fetch Price</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Services</h3>
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Fault</th>
                <th>Description</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {services.map((row, index) => (
                <tr key={index}>
                  {["serviceName", "description", "price"].map((field, i) => (
                    <td key={i}>
                      <input
                        type={field === 'price' ? 'number' : 'text'}
                        min={field === 'price' ? "0" : undefined}
                        value={row[field]}
                        ref={(el) => (serviceRefs.current[index * 3 + i] = el)}
                        onChange={(e) => handleServiceChange(index, field, e.target.value)}
                        onKeyDown={(e) => handleServiceKeyDown(e, index)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="payment-section">
  <label>
    Payment Status:
    <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} required>
      <option value="">Select Status</option>
      <option value="Paid">Paid</option>
      <option value="Unpaid">Unpaid</option>
      <option value="Pending">Pending</option>
    </select>
  </label>

  <label>
    Payment Method:
    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} required>
      <option value="">Select Method</option>
      <option value="Cash">Cash</option>
      <option value="Bank">Bank</option>
      <option value="Loan">Loan</option>
    </select>
  </label>
</div>

          <h3>Total: Rs. {totalAmount.toFixed(2)}</h3>
          <h3>Remaining: Rs. {remainingAmount.toFixed(2)}</h3>

          <div className="button-group">
            <button
              type="button"
              className="save-btn"
              onClick={() => handleSave(false, 'Repaired Done - Instock')}
            >
              Save Sale
            </button>
            <button
              type="button"
              className="save-print-btn"
              onClick={() => handleSave(true, 'Repaired Done - Issued')}
            >
              Save and Print Sale
            </button>
          </div>
        </form>
      </div>
       {/* PrintSale component rendered conditionally */}
      {printSaleData && (
        <PrintSale
          sale={printSaleData}
          onAfterPrint={() => {
            setPrintSaleData(null);
            resetForm();
          }}
        />
      )}
    </div>
  );
};

export default Sale;
