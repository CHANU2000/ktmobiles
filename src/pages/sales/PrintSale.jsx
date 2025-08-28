import React, { useEffect } from 'react';
import logo from '../../images/Logo.png'; // Adjust path as needed
import './printsale.scss';

const PrintSale = ({ sale, onAfterPrint }) => {
  useEffect(() => {
    if (sale) {
      window.print();
      if (onAfterPrint) {
        setTimeout(() => onAfterPrint(), 300);
      }
    }
  }, [sale, onAfterPrint]);

  if (!sale) return null;

  const {
    invoiceNo,
    saleDate,
    customer,
    phone,
    brand,
    model,
    items = [],
    services = [],
    advance = 0,
    totalAmount = 0,
    paymentMethod,
  } = sale;

  const calculateTotalDiscount = () =>
    items.reduce((acc, item) => acc + (item.discount || 0), 0);

  const calculateGrandTotal = () => (totalAmount - advance).toFixed(2);

  return (
    <div className="print-container">
      <div className="shop-header">
        <img src={logo} alt="Shop Logo" className="shop-logo" />
        <div className="shop-details">
          <h2 className="shop-name">KT Mobiles</h2>
          <p>No. 35/2, Pananval, Delgoda</p>
          <p>Phone: 0769278221 / 0720326066</p>
          <p>Email: ktsranaweera@gmail.com</p>
        </div>
      </div>
<div className="print-header">
        <h1>Sales Invoice</h1>
        <p>Invoice No: {invoiceNo}</p>
        <p>Date: {saleDate ? new Date(saleDate).toLocaleDateString() : 'N/A'}</p>
        <p>Payment Method: {paymentMethod || 'N/A'}</p>
      </div>
      {/* From & Bill To Section */}
      <div className="addresses-section">
        <div className="from-address">
          <h3>From</h3>
          <p><strong>KT Mobiles</strong></p>
          <p>No. 35/2, Pananval, Delgoda</p>
          <p>Phone: 0769278221 / 0720326066</p>
          <p>Email: ktsranaweera@gmail.com</p>
        </div>

        <div className="billto-address">
          <h3>Bill To</h3>
          <p><strong>{customer || 'Customer Name'}</strong></p>
          <p>{phone || 'Customer Phone'}</p>
          <p>{brand || 'Brand'}</p>
          <p>{model || 'Model'}</p>
        </div>
      </div>
      <h3>Items</h3>
      <table className="print-table items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Brand</th>
            <th>Model</th>
            <th>Quality</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Discount</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => {
            const total = (item.unitPrice * item.quantity) - (item.discount || 0);
            return (
              <tr key={i}>
                <td>{item.itemName}</td>
                <td>{item.brand}</td>
                <td>{item.model}</td>
                <td>{item.quality}</td>
                <td>{item.quantity}</td>
                <td>Rs. {(item.unitPrice ?? 0).toFixed(2)}</td>
                <td>Rs. {(item.discount ?? 0).toFixed(2)}</td>
                <td>Rs. {total.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {services.length > 0 && (
        <>
          <h3>Services</h3>
          <table className="print-table services-table">
            <thead>
              <tr>
                <th>Fault</th>
                <th>Description</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service, i) => (
                <tr key={i}>
                  <td>{service.serviceName}</td>
                  <td>{service.description}</td>
                  <td>Rs. {(service.price ?? 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <table className="print-table totals-table">
        <tbody>
          <tr>
            <td><strong>Advance Payment:</strong></td>
            <td>Rs. {advance.toFixed(2)}</td>
          </tr>
          <tr>
            <td><strong>Total Discount:</strong></td>
            <td>Rs. {calculateTotalDiscount().toFixed(2)}</td>
          </tr>
          <tr>
            <td><strong>Total Amount:</strong></td>
            <td>Rs. {totalAmount.toFixed(2)}</td>
          </tr>
          <tr>
            <td><strong>Grand Total:</strong></td>
            <td>Rs. {calculateGrandTotal()}</td>
          </tr>
        </tbody>
      </table>

      <div className="print-footer">
        <p>Customer Signature: ___________________________</p>
        <p>Shop Signature: ___________________________</p>
      </div>
    </div>
  );
};

export default PrintSale;
