import React, { useEffect } from 'react';
import './printview.scss';
import logo from '../../images/Logo.png'; // Make sure this path is correct

const PrintView = ({ invoice }) => {
  useEffect(() => {
    if (invoice) {
      window.print();
    }
  }, [invoice]);

  if (!invoice) return null;

  const {
    formattedJobNumber,
    date,
    name,
    phone,
    brand,
    model,
    issue,
    condition,
    screenLockType,
    screenLockCode,
    note,
    status,
    advance, // ✅ New field
  } = invoice;

  return (
    <div className="print-container">
      {/* --- Shop Logo and Details --- */}
      <div className="shop-header">
        <img src={logo} alt="Shop Logo" className="shop-logo" />
        <div className="shop-details">
          <h2 className="shop-name">KT Mobiles</h2>
          <p className="shop-address">No. 35/2, Pananval, Delgoda</p>
          <p className="shop-contact">Phone: 0769278221 / 0720326066</p>
          <p className="shop-email">Email: ktsranaweera@gmail.com</p>
        </div>
      </div>

      {/* --- Invoice Title --- */}
      <div className="print-header">
        <h1 className="print-title">Customer Pre-Job Receipt</h1>
        <p className="print-subtext">Date: {new Date(date).toLocaleDateString()}</p>
        <p className="print-subtext">Job No: {formattedJobNumber}</p>
      </div>

      {/* --- Job Info Table --- */}
      <table className="print-table">
        <tbody>
          <tr><td className="print-label">Customer Name:</td><td>{name}</td></tr>
          <tr><td className="print-label">Contact Number:</td><td>{phone}</td></tr>
          <tr><td className="print-label">Brand:</td><td>{brand}</td></tr>
          <tr><td className="print-label">Model:</td><td>{model}</td></tr>
          <tr><td className="print-label">Issue:</td><td>{issue}</td></tr>
          <tr><td className="print-label">Condition:</td><td>{condition}</td></tr>
          <tr><td className="print-label">Screen Lock Type:</td><td>{screenLockType}</td></tr>
          <tr><td className="print-label">Screen Lock Code:</td><td>{screenLockCode}</td></tr>
          <tr><td className="print-label">Note:</td><td>{note}</td></tr>
          <tr><td className="print-label">Advance Payment:</td><td>{advance ? `Rs.${advance}` : '-'}</td></tr> {/* ✅ New row */}
          <tr><td className="print-label">Status:</td><td>{status}</td></tr>
        </tbody>
      </table>

      <div className="print-footer">
        <p>Customer Signature: ___________________________</p>
        <p className="shop-signature">Shop Signature: ___________________________</p>
      </div>
    </div>
  );
};

export default PrintView;
