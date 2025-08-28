import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './customerreceipt.scss';
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';
import PrintView from '../printview/PrintView';

const API = process.env.REACT_APP_API || 'http://localhost:5000';

const CustomerReceipt = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [form, setForm] = useState({
  sequence: null,
  jobNumber: '',
  name: '',
  phone: '',
  brand: '',
  model: '',
  issue: '',
  condition: '',
  screenLockType: '',
  screenLockCode: '',
  note: '',
  status: 'Pending',
  date: '',
  advance: '',
  description: '',  
  cost: '',          
  salePrice: '',     
  specialNote: ''   
});

  const [jobs, setJobs] = useState([]);
  const [notification, setNotification] = useState('');
const [showNotification, setShowNotification] = useState(false);
const [inlineEditId, setInlineEditId] = useState(null); // for inline edit mode
const [inlineEditValues, setInlineEditValues] = useState({});
  const [printData, setPrintData] = useState(null);

  const showNotificationMessage = (msg) => {
  setNotification(msg);
  setShowNotification(true);
  setTimeout(() => {
    setShowNotification(false);
    setNotification('');
  }, 3000);
};


  const loadJobs = async () => {
    try {
      const res = await axios.get(`${API}/api/invoices`);
      setJobs(res.data);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    }
  };

  const fetchNextJobNumber = async () => {
    try {
      const res = await axios.get(`${API}/api/invoices/next-invoice-number`);
      setForm((prev) => ({
        ...prev,
        sequence: res.data.nextSeq,
        jobNumber: res.data.formattedJobNumber,
        date: new Date().toISOString().slice(0, 10),
      }));
    } catch (err) {
      console.error('Failed to fetch job number:', err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
const handleInlineChange = (e) => {
    setInlineEditValues({
      ...inlineEditValues,
      [e.target.name]: e.target.value
    });
  };

const handleInlineEdit = async (id) => {
    try {
      await axios.put(`${API}/api/invoices/${id}`, inlineEditValues);

      // Update local jobs state for immediate UI update
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job._id === id ? { ...job, ...inlineEditValues } : job
        )
      );

      setInlineEditId(null);
      setInlineEditValues({});
      showNotificationMessage('Inline update saved!');
    } catch (err) {
      console.error('Inline save failed:', err);
      showNotificationMessage('Failed to save inline changes.');
    }
  };


  const startInlineEdit = (job) => {
    setInlineEditId(job._id);
    setInlineEditValues({
      description: job.description || '',
      cost: job.cost || '',
      salePrice: job.salePrice || '',
      specialNote: job.specialNote || ''
    });
  };


  
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = { ...form };
    delete payload.jobNumber; // remove virtual

    try {
      if (editingId) {
        await axios.put(`${API}/api/invoices/${editingId}`, payload);
showNotificationMessage('Job updated!');
      } else {
        await axios.post(`${API}/api/invoices`, payload);
showNotificationMessage('Job created!');
      }
      resetForm();
      loadJobs();
    } catch (err) {
      console.error('Save failed:', err);
      showNotificationMessage('Failed to save job.');
    }
  };

  const resetForm = () => {
    setForm({
  sequence: null,
  jobNumber: '',
  name: '',
  phone: '',
  brand: '',
  model: '',
  issue: '',
  condition: '',
  screenLockType: '',
  screenLockCode: '',
  note: '',
  status: 'Pending',
  date: '',
  advance: '',
  description: '',
  cost: '',
  salePrice: '',
  specialNote: ''
});

    setEditingId(null);
    setShowModal(false);
  };

  const handleEdit = (job) => {
    setForm({
      sequence: job.sequence || null,
      jobNumber: job.formattedJobNumber || '',
      name: job.name || '',
      phone: job.phone || '',
      brand: job.brand || '',
      model: job.model || '',
      issue: job.issue || '',
      condition: job.condition || '',
      screenLockType: job.screenLockType || '',
      screenLockCode: job.screenLockCode || '',
      note: job.note || '',
      status: job.status || 'Pending',
      date: job.date ? new Date(job.date).toISOString().slice(0, 10) : '',
      advance: job.advance || '',
      description: job.description || '',
cost: job.cost || '',
salePrice: job.salePrice || '',
specialNote: job.specialNote || ''

    });
    setEditingId(job._id);
    setShowModal(true);
    setSelectedJob(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure to delete this job?')) {
      try {
        await axios.delete(`${API}/api/invoices/${id}`);
        loadJobs();
      } catch (err) {
        console.error('Delete failed:', err);
        alert('Failed to delete job.');
      }
    }
  };

  const handlePrint = (job) => {
    setPrintData(job);
    // Optional: Remove printData after printing is triggered, adjust timeout if needed
    setTimeout(() => setPrintData(null), 1000);
  };

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (showModal && !editingId) {
      fetchNextJobNumber();
    }
  }, [showModal, editingId]);

  return (
    <div className="invoice">
      <Sidebar />
      <div className="invoiceContainer">
        <Navbar />
{showNotification && (
    <div className="notification">
      {notification}
    </div>
  )}
        <div className="invoicePopup">
          <button
            onClick={() => {
              setShowModal(true);
              setEditingId(null);
              setSelectedJob(null);
            }}
            className="btn"
          >
            + Create Job
          </button>

          {showModal && (
            <div className="modal">
              <div className="Content">
                <h2>{editingId ? 'Edit Job' : 'Customer Pre-Job'}</h2>
                <form onSubmit={handleSubmit}>
                  <div className="invoiceNumberRow">
                    <label>Job Number: </label>
                    <span>{form.jobNumber || ''}</span>
                  </div>
                  <table className="formTable">
                    <tbody>
                      <tr>
                        <td><label>Date</label></td>
                        <td>
                          <input
                            type="date"
                            name="date"
                            value={form.date}
                            onChange={handleChange}
                            required
                          />
                        </td>
                      </tr>
                      <tr>
                        <td><label>Customer Name</label></td>
                        <td>
                          <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                          />
                        </td>
                      </tr>
                      <tr>
                        <td><label>Contact No</label></td>
                        <td>
                          <input
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            required
                          />
                        </td>
                      </tr>
                      <tr>
                        <td><label>Phone Details</label></td>
                        <td>
                          <table>
                            <thead>
                              <tr>
                                <th>Brand</th>
                                <th>Model</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>
                                  <input
                                    name="brand"
                                    value={form.brand}
                                    onChange={handleChange}
                                    required
                                  />
                                </td>
                                <td>
                                  <input
                                    name="model"
                                    value={form.model}
                                    onChange={handleChange}
                                    required
                                  />
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td><label>Fault</label></td>
                        <td>
                          <textarea
                            name="issue"
                            value={form.issue}
                            onChange={handleChange}
                            required
                          />
                        </td>
                      </tr>
                      <tr>
                        <td><label>Phone Condition</label></td>
                        <td>
                          <textarea
                            name="condition"
                            value={form.condition}
                            onChange={handleChange}
                            required
                          />
                        </td>
                      </tr>
                      <tr>
                        <td><label>Screen Lock Type</label></td>
                        <td>
                          <select
                            name="screenLockType"
                            value={form.screenLockType}
                            onChange={handleChange}
                            required
                          >
                            <option value="">-- Select Lock Type --</option>
                            <option value="None">None</option>
                            <option value="PIN">PIN</option>
                            <option value="Password">Password</option>
                            <option value="Pattern">Pattern</option>
                          </select>
                        </td>
                      </tr>
                      <tr>
                        <td><label>Screen Lock</label></td>
                        <td>
                          <input
                            type="text"
                            name="screenLockCode"
                            placeholder="Enter PIN/Password/Pattern"
                            value={form.screenLockCode}
                            onChange={handleChange}
                            required={
                              form.screenLockType !== 'None' &&
                              form.screenLockType !== ''
                            }
                          />
                        </td>
                      </tr>
                      <tr>
                        <td><label>Note</label></td>
                        <td>
                          <textarea
                            name="note"
                            value={form.note}
                            onChange={handleChange}
                            required
                          />
                        </td>
                      </tr>
                      <tr>
  <td><label>Advance Payment</label></td>
  <td>
    <input
      type="number"
      name="advance"
      value={form.advance}
      onChange={handleChange}
      placeholder="Enter advance amount"
    />
  </td>
</tr>

                      <tr>
                        <td><label>Status</label></td>
                        <td>
                          <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Repairedinstock">Repaired Done-INStock</option>
                            <option value="Repairedissue">Repaired Done-Issued</option>
                            <option value="Returninstock">Return - InStock</option>
                            <option value="Returnissue">Return - Issued</option>
                          </select>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="Action">
                    <button type="submit">
                      {editingId ? 'Update' : 'Create'} Job
                    </button>
                    <button type="button" onClick={resetForm}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        <hr />
        <h1>Jobs</h1>
<div className="tableWrapper">
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Job No</th>
        <th>Date</th>
        <th>Customer Name</th>
        <th>Contact No</th>
        <th>Brand</th>
        <th>Model</th>
        <th>Issue</th>
        <th>Advance</th>
        <th>Description</th>
        <th>Cost</th>
        <th>Sale Price</th>
        <th>Special Note</th>

        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {jobs.map((job,index) => (
        <tr
          key={job._id}
          onClick={(e) => {
            if (!e.target.closest('button')) {
              setSelectedJob(job);
            }
          }}
          style={{ cursor: 'pointer' }}
        >
          <td>{job.sequence || index + 1}</td>
          <td>{job.formattedJobNumber}</td>
          <td>{new Date(job.date).toLocaleDateString()}</td>
          <td>{job.name}</td>
          <td>{job.phone}</td>
          <td>{job.brand}</td>
          <td>{job.model}</td>
          <td>{job.issue}</td>
          <td>{job.advance ? `Rs.${job.advance}` : '-'}</td>
          <td>
                    {inlineEditId === job._id ? (
                      <input name="description" value={inlineEditValues.description} onChange={handleInlineChange} />
                    ) : (job.description || '-')}
                  </td>
                  <td>
                    {inlineEditId === job._id ? (
                      <input name="cost" value={inlineEditValues.cost} onChange={handleInlineChange} />
                    ) : (job.cost ? `Rs.${job.cost}` : '-')}
                  </td>
                  <td>
                    {inlineEditId === job._id ? (
                      <input name="salePrice" value={inlineEditValues.salePrice} onChange={handleInlineChange} />
                    ) : (job.salePrice ? `Rs.${job.salePrice}` : '-')}
                  </td>
                  <td>
                    {inlineEditId === job._id ? (
                      <textarea name="specialNote" value={inlineEditValues.specialNote} onChange={handleInlineChange} />
                    ) : (job.specialNote || '-')}
                  </td>
          <td>{job.status}</td>
          <td>
                    {inlineEditId === job._id ? (
                      <>
                        <button onClick={() => handleInlineEdit(job._id)}>💾</button>
                        <button onClick={() => setInlineEditId(null)}>❌</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(job)}>✏️</button>
                        <button onClick={() => handleDelete(job._id)}>🗑️</button>
                        <button onClick={() => handlePrint(job)}>🖨️</button>
                        <button onClick={() => startInlineEdit(job)}>✏️ Inline</button>
                      </>
                    )}
                  </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


        {selectedJob && (
          <div className="readOnlyPanel">
            <h2>Job Details</h2>
            <table className="readOnlyTable">
              <tbody>
                <tr>
  <td><strong>ID:</strong></td>
  <td>{selectedJob.sequence || '-'}</td>
</tr>

                <tr>
                  <td>
                    <strong>Job No:</strong>
                  </td>
                  <td>{selectedJob.formattedJobNumber}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Date:</strong>
                  </td>
                  <td>{new Date(selectedJob.date).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Name:</strong>
                  </td>
                  <td>{selectedJob.name}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Phone:</strong>
                  </td>
                  <td>{selectedJob.phone}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Brand:</strong>
                  </td>
                  <td>{selectedJob.brand}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Model:</strong>
                  </td>
                  <td>{selectedJob.model}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Issue:</strong>
                  </td>
                  <td>{selectedJob.issue}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Condition:</strong>
                  </td>
                  <td>{selectedJob.condition}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Lock Type:</strong>
                  </td>
                  <td>{selectedJob.screenLockType}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Lock Code:</strong>
                  </td>
                  <td>{selectedJob.screenLockCode}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Note:</strong>
                  </td>
                  <td>{selectedJob.note}</td>
                </tr>
                <tr>
                  <td><strong>Advance:</strong></td>
                  <td>{selectedJob.advance ? `Rs.${selectedJob.advance}` : '-'}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Status:</strong>
                  </td>
                  <td>{selectedJob.status}</td>
                </tr>
              </tbody>
            </table>
            <button onClick={() => setSelectedJob(null)}>Close View</button>
          </div>
        )}

        {printData && (
          <div
            className="print-section"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              backgroundColor: 'white',
              zIndex: 1000,
            }}
          >
            <PrintView invoice={printData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerReceipt;
