import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './saleshistory.scss';
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';
import PrintSale from '../sales/PrintSale';

const SalesHistory = () => {
  const [salesHistory, setSalesHistory] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [printSaleData, setPrintSaleData] = useState(null);
  const [searchInvoice, setSearchInvoice] = useState('');
  const [settleSale, setSettleSale] = useState(null);
  const [installmentAmount, setInstallmentAmount] = useState('');
  const [method, setMethod] = useState('Cash');

  useEffect(() => {
    fetchSalesHistory();
  }, []);

  const fetchSalesHistory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/sales');
      setSalesHistory(res.data || []);
    } catch (err) {
      console.error('Error fetching sales history:', err);
      alert('Failed to fetch sales history.');
    }
  };

  const toggleRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const calculateRemaining = (sale) => {
    const totalPaid = sale.installments?.reduce((sum, i) => sum + i.amount, 0) || 0;
    return (sale.totalAmount - sale.advance - totalPaid).toFixed(2);
  };
 // --- CASH IN HAND CALCULATION ---
  const calculateCashInHand = () => {
    return salesHistory.reduce((total, sale) => {
      const installmentsPaid = sale.installments?.reduce((sum, i) => sum + i.amount, 0) || 0;
      const cashReceived = installmentsPaid;
      return total + cashReceived;
    }, 0).toFixed(2);
  };

  

  const handleAddInstallment = async () => {
    const amount = parseFloat(installmentAmount);
    if (isNaN(amount) || amount <= 0 || amount > calculateRemaining(settleSale)) {
      return alert('Invalid installment amount.');
    }

    try {
      await axios.put(`http://localhost:5000/api/sales/${settleSale._id}/settle`, {
        amount,
        method
      });
      alert('Installment added successfully.');
      setInstallmentAmount('');
      setSettleSale(null);
      fetchSalesHistory();
    } catch (err) {
      console.error(err);
      alert('Failed to add installment.');
    }
  };

  const handleFullSettle = async (sale) => {
    const remaining = parseFloat(calculateRemaining(sale));
    try {
      await axios.put(`http://localhost:5000/api/sales/${sale._id}/settle`, {
        amount: remaining,
        method
      });
      alert('Payment fully settled.');
      setSettleSale(null);
      fetchSalesHistory();
    } catch (err) {
      console.error(err);
      alert('Failed to settle payment.');
    }
  };

  const handlePrint = (sale) => {
    setPrintSaleData(sale);
  };

  return (
    <div className="sale">
      <Sidebar />
      <div className="saleContainer">
        <Navbar />
        <h2>Sales History</h2>

        <div className="search-section">
          <label>
            Search Invoice:
            <input
              type="text"
              value={searchInvoice}
              onChange={(e) => setSearchInvoice(e.target.value)}
              placeholder="Enter invoice number"
            />
          </label>
        </div>
        <div className="cash-in-hand">
  <h3>Cash in Hand: Rs. {calculateCashInHand()}</h3>
</div>


        <table className="invoice-table">
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Customer Type</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Brand</th>
              <th>Model</th>
              <th>Payment Status</th>
              <th>Payment Method</th>
              <th>Total Amount</th>
              <th>Advance</th>
              <th>Remaining</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {salesHistory
              .filter(sale => sale.invoiceNo.toLowerCase().includes(searchInvoice.toLowerCase()))
              .map((sale, index) => (
              <React.Fragment key={index}>
                <tr>
                  <td>{sale.invoiceNo}</td>
                  <td>{sale.customerType}</td>
                  <td>{sale.customer}</td>
                  <td>{sale.phone}</td>
                  <td>{sale.brand}</td>
                  <td>{sale.model}</td>
                  <td>{sale.paymentStatus}</td>
                  <td>{sale.paymentMethod}</td>
                  <td>{sale.totalAmount.toFixed(2)}</td>
                  <td>{sale.advance.toFixed(2)}</td>
                  <td>{(sale.totalAmount - sale.advance - (sale.installments?.reduce((sum,i)=>sum+i.amount,0)||0)).toFixed(2)}</td>
                  <td>
                    <button onClick={() => toggleRow(index)}>
                      {expandedRow === index ? 'Hide Details' : 'View Details'}
                    </button>
                    <button onClick={() => handlePrint(sale)}>🖨️</button>
                    {sale.paymentStatus === 'Pending' && sale.paymentMethod === 'Loan' && (
                      <button
                        className="settle-button"
                        onClick={() => setSettleSale(sale)}
                      >
                        💰
                      </button>
                    )}
                  </td>
                </tr>

                {expandedRow === index && (
                  <tr className="expanded-row">
                    <td colSpan="13">
                      {/* Items Table */}
                      <h4>Items</h4>
                      <table className="nested-table">
                        <thead>
                          <tr>
                            <th>Item</th><th>Brand</th><th>Model</th><th>Quality</th>
                            <th>Qty</th><th>Unit Price</th><th>Discount</th><th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sale.items?.map((item, idx) => (
                            <tr key={idx}>
                              <td>{item.itemName}</td><td>{item.brand}</td><td>{item.model}</td><td>{item.quality}</td>
                              <td>{item.quantity}</td><td>{item.unitPrice.toFixed(2)}</td><td>{item.discount.toFixed(2)}</td>
                              <td>{((item.quantity*item.unitPrice)-item.discount).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Services Table */}
                      <h4>Services</h4>
                      <table className="nested-table">
                        <thead>
                          <tr><th>Fault</th><th>Description</th><th>Price</th></tr>
                        </thead>
                        <tbody>
                          {sale.services?.map((srv, idx) => (
                            <tr key={idx}>
                              <td>{srv.serviceName}</td><td>{srv.description}</td><td>{srv.price.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Installments Table */}
                      {sale.paymentMethod === 'Loan' && sale.installments?.length > 0 && (
                        <>
                          <h4>Installments</h4>
                          <table className="nested-table">
                            <thead>
                              <tr><th>Date</th><th>Amount</th><th>Method</th></tr>
                            </thead>
                            <tbody>
                              {sale.installments.map((inst, idx) => (
                                <tr key={idx}>
                                  <td>{new Date(inst.date).toLocaleDateString()}</td>
                                  <td>{inst.amount.toFixed(2)}</td>
                                  <td>{inst.method}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {/* Settlement Modal */}
        {settleSale && (
          <div className="settle-modal">
            <div className="modal-content">
              <h3>Settle Payment - {settleSale.invoiceNo}</h3>
              <p>Remaining: Rs. {calculateRemaining(settleSale)}</p>

              <input
                type="number"
                placeholder="Installment Amount"
                value={installmentAmount}
                onChange={(e) => setInstallmentAmount(e.target.value)}
              />

              <select value={method} onChange={(e) => setMethod(e.target.value)}>
                <option value="Cash">Cash</option>
                <option value="Bank">Bank</option>
              </select>

              <div className="actions">
                <button onClick={handleAddInstallment}>➕ Add Installment</button>
                <button onClick={() => handleFullSettle(settleSale)}>✅ Full Settle</button>
                <button onClick={() => setSettleSale(null)}>❌ Cancel</button>
              </div>
            </div>
          </div>
        )}

      </div>

      {printSaleData && (
        <PrintSale
          sale={printSaleData}
          onAfterPrint={() => setPrintSaleData(null)}
        />
      )}
    </div>
  );
};

export default SalesHistory;
