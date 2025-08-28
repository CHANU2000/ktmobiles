import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './services.scss';
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';

const ServiceHistory = () => {
  const [services, setServices] = useState([]);
  const [serviceReturns, setServiceReturns] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [filteredReturns, setFilteredReturns] = useState([]);
  const [search, setSearch] = useState({
    jobNo: '',
    customer: '',
    phone: '',
  });

  // Fetch service history and service return history
  useEffect(() => {
    // Service history from sales
    axios
      .get('http://localhost:5000/api/sales/service-history')
      .then((res) => {
        setServices(res.data);
        setFilteredServices(res.data);
      })
      .catch((err) => {
        console.error('Error fetching service history:', err);
        alert('Failed to fetch service history');
      });

    // Service return history from sales-returns
    axios
      .get('http://localhost:5000/api/sales-returns/service-return-history')
      .then((res) => {
        setServiceReturns(res.data);
        setFilteredReturns(res.data);
      })
      .catch((err) => {
        console.error('Error fetching service return history:', err);
        alert('Failed to fetch service return history');
      });
  }, []);

  // Filter service history
  useEffect(() => {
    const filtered = services.filter((srv) =>
      srv.invoiceNo?.toLowerCase().includes(search.jobNo.toLowerCase()) &&
      srv.customer?.toLowerCase().includes(search.customer.toLowerCase()) &&
      srv.phone?.toLowerCase().includes(search.phone.toLowerCase())
    );
    setFilteredServices(filtered);
  }, [search, services]);

  // Filter service returns
  useEffect(() => {
    const filtered = serviceReturns.filter((srv) =>
      srv.invoiceNo?.toLowerCase().includes(search.jobNo.toLowerCase()) &&
      srv.customer?.toLowerCase().includes(search.customer.toLowerCase()) &&
      srv.phone?.toLowerCase().includes(search.phone.toLowerCase())
    );
    setFilteredReturns(filtered);
  }, [search, serviceReturns]);

  const totalPrice = filteredServices.reduce((sum, srv) => sum + (srv.price || 0), 0);
  const totalReturnPrice = filteredReturns.reduce((sum, srv) => sum + (srv.price || 0), 0);

  return (
    <div className="service-history">
      <Sidebar />
      <div className="serviceContainer">
        <Navbar />
        <h2>Service History</h2>

        {/* Filters */}
        <div className="filter-container">
          <input
            type="text"
            placeholder="Search Job No"
            value={search.jobNo}
            onChange={(e) => setSearch({ ...search, jobNo: e.target.value })}
          />
          <input
            type="text"
            placeholder="Search Customer"
            value={search.customer}
            onChange={(e) => setSearch({ ...search, customer: e.target.value })}
          />
          <input
            type="text"
            placeholder="Search Phone"
            value={search.phone}
            onChange={(e) => setSearch({ ...search, phone: e.target.value })}
          />
        </div>

        {/* Service History Table */}
        <table className="service-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Job No</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Brand</th>
              <th>Model</th>
              <th>Fault</th>
              <th>Description</th>
              <th>Price (Rs.)</th>
            </tr>
          </thead>
          <tbody>
            {filteredServices.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center' }}>No records found</td>
              </tr>
            ) : (
              filteredServices.map((srv, idx) => (
                <tr key={srv._id || idx}>
                  <td>{idx + 1}</td>
                  <td>{srv.invoiceNo}</td>
                  <td>{srv.customer}</td>
                  <td>{srv.phone}</td>
                  <td>{srv.brand}</td>
                  <td>{srv.model}</td>
                  <td>{srv.fault}</td>
                  <td>{srv.description}</td>
                  <td>{srv.price?.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
          {filteredServices.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan="8" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total Price:</td>
                <td style={{ fontWeight: 'bold' }}>{totalPrice.toFixed(2)} Rs.</td>
              </tr>
            </tfoot>
          )}
        </table>

        {/* Service Return History Table */}
        <h2 style={{ marginTop: '40px' }}>Service Return History</h2>
        <table className="service-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Job No</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Brand</th>
              <th>Model</th>
              <th>Description</th>
              <th>Price (Rs.)</th>
            </tr>
          </thead>
          <tbody>
            {filteredReturns.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center' }}>No records found</td>
              </tr>
            ) : (
              filteredReturns.map((srv, idx) => (
                <tr key={srv._id || idx}>
                  <td>{idx + 1}</td>
                  <td>{srv.invoiceNo}</td>
                  <td>{srv.customer}</td>
                  <td>{srv.phone}</td>
                  <td>{srv.brand}</td>
                  <td>{srv.model}</td>
                  <td>{srv.description}</td>
                  <td>{srv.price?.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
          {filteredReturns.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan="7" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total Return Price:</td>
                <td style={{ fontWeight: 'bold' }}>{totalReturnPrice.toFixed(2)} Rs.</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default ServiceHistory;
