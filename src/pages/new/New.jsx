import React,{useState,useEffect} from "react";
import "./new.scss";
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';
import axios from "axios";

 


export default function New() {
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({ name: '', email: '',phone:'',address:'' });

useEffect(() => {
        axios.get('http://localhost:5000/api/new')
            .then(res => setUsers(res.data));
    }, []);

const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await axios.post('http://localhost:5000/api/new',form);
        setUsers([...users, res.data]);
        setForm({ name: '', email: '',phone:'',address:'' });
    };



  return (
        <div className="new">
          <Sidebar/>
          <div className="newContainer">
            <Navbar/>
            <div className="container">
            
            <form onSubmit={handleSubmit} className="form">
            <h1>Add Customer</h1>
              <div className="formgroup">
                <label>Customer Name:</label><br/>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Customer Name" />
              </div>
              <div>
                <label>Email:</label><br/>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email" />
              </div>
              <div>
                <label>Phone No:</label><br/>
                <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Phone Number" />
              </div>
              <div>
                <label>Address:</label><br/> 
                <textarea type="" value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Address" />
              </div>
                <button type="submit" className="btn">Add User</button>
            </form>
            <ul>
                {users.map((user, i) => (
                    <li key={i}>{user.name} - {user.email}-{user.phone}-{user.address}</li>
                ))}
            </ul>
            </div>
            </div>
        </div>
    );
}






