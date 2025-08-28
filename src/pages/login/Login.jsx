import React, { useState } from 'react';
import "./login.scss";
import { useNavigate } from 'react-router-dom';
import Image from '../../images/cutomerlogo.png';


const Login = () => {
const [username, setUsername]=useState("");
const[password, setPassword]=useState("");
const[error,setError]=useState("");
const navigate=useNavigate();

const handleLogin=(e) =>{
    e.preventDefault();


    const adminCredentials={
      username: "admin",
      password: "admin1234",
    }

if (username===adminCredentials.username && password===adminCredentials.password)
{
navigate('/Home');
}
else
{
  setError("Access Denide: Only admin can log the system");
}
};

  return (
    <div className='login'>
      <form className='form1' onSubmit={handleLogin}>
        <img src={Image} alt=''/>
<h2 className='admin'>ADMIN LOGIN</h2>
<br/><br/>
<div>
  <label className='log'>Username:</label>
  <br/>
  <input className='box' type='text' placeholder='Enter Username' value={username} onChange={(e) =>setUsername(e.target.value)}/>
</div>
<div>
  <label className='log'>Password:</label>
  <input className='box' type='password' placeholder='Enter Password' value={password} onChange={(e) =>setPassword(e.target.value)}/>
</div>

<button className='formbtn' type='submit' >Login</button>
</form> 

{error && <p style={{color: "red"}}>{error}</p>}
    </div>
  );
};

export default Login;
