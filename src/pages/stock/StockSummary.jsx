import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './stocksummary.scss';
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';

const StockSummary = () => {
  const [summary, setSummary] = useState([]);
  const [expandedItem, setExpandedItem] = useState(null);
  const [inStockBalance, setInStockBalance] = useState(0);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/stocks/summary');
      setSummary(res.data.items || []);
      setInStockBalance(res.data.inStockBalance || 0);
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  const toggleExpand = (itemName) => {
    setExpandedItem(prev => (prev === itemName ? null : itemName));
  };

  return (
    <div className="stockSummary">
      <Sidebar />
      <div className="stockSummaryContainer">
        <Navbar />
        <h2>Stock Summary</h2>

        <div className="instock-balance" style={{ marginBottom: '15px', fontWeight: 'bold' }}>
          Total In-Stock Balance: Rs. {inStockBalance.toFixed(2)}
        </div>

        <table className="summaryTable">
          <thead>
            <tr>
              <th>Item</th>
              <th>Total Quantity</th>
              <th>Available Quantity</th>
              <th>Sold Quantity</th>
              <th>Lost Quantity</th>
              <th>Return Stock Quantity</th>
              <th>Sold Balance Quantity</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((item, idx) => (
              <React.Fragment key={idx}>
                <tr
                  className="item-row"
                  onClick={() => toggleExpand(item.item)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>{item.item}</td>
                  <td>{item.totalQuantity}</td>
                  <td>{item.totalAvailableQuantity}</td>
                  <td>{item.totalSoldQuantity}</td>
                  <td>{item.totalLostQuantity}</td>
                  <td>{item.totalReturnStockQuantity || 0}</td>
                  <td>{item.totalSoldBalanceQuantity}</td>
                </tr>

                {expandedItem === item.item && (
                  <tr>
                    <td colSpan="7">
                      <table className="details-table">
                        <thead>
                          <tr>
                            <th>Item Code</th>
                            <th>Brand</th>
                            <th>Model</th>
                            <th>Quality</th>
                            <th>Quantity</th>
                            <th>Available Quantity</th>
                            <th>Sold Quantity</th>
                            <th>Lost Quantity</th>
                            <th>Return Stock Quantity</th>
                            <th>Sold Balance Quantity</th>
                            <th>Sale Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.isArray(item.qualities) &&
                            item.qualities.map((detail, i) => (
                              <tr key={i}>
                                <td>{detail.itemCode}</td>
                                <td>{detail.brand}</td>
                                <td>{detail.model}</td>
                                <td>{detail.quality}</td>
                                <td>{detail.quantity}</td>
                                <td>{detail.availableQuantity}</td>
                                <td>{detail.soldQuantity}</td>
                                <td>{detail.lostQuantity}</td>
                                <td>{detail.returnStockQuantity || 0}</td>
                                <td>{detail.soldBalanceQuantity}</td>
                                <td>Rs. {parseFloat(detail.salePrice || 0).toFixed(2)}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockSummary;
