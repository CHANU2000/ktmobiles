import React, {useState} from 'react';

const AddRepair = () => {
const [form, setForm] = useState({
    customerName: '',
    phone: '',
    device: '',
    issue: '',
    status: 'Pending',
  });

const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Repair job submitted:', form);
    // TODO: send to backend or localStorage
    setForm({ customerName: '', phone: '', device: '', issue: '', status: 'Pending' });
  };

  return (
    <div className="max-w-xl mx-auto mt-8 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Add Repair Job</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="customerName" value={form.customerName} onChange={handleChange} placeholder="Customer Name" className="w-full p-2 border rounded" />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="w-full p-2 border rounded" />
        <input name="device" value={form.device} onChange={handleChange} placeholder="Device (e.g., iPhone 13)" className="w-full p-2 border rounded" />
        <input name="issue" value={form.issue} onChange={handleChange} placeholder="Issue Description" className="w-full p-2 border rounded" />
        <select name="status" value={form.status} onChange={handleChange} className="w-full p-2 border rounded">
          <option>Pending</option>
          <option>In Progress</option>
          <option>Repaired</option>
          <option>Delivered</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Repair</button>
      </form>
    </div>
  )
}

export default AddRepair;
