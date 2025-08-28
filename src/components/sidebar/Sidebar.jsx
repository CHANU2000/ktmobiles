    import React from 'react';
    import Image from '../../images/Logo.png';
    import DashboardIcon from "@mui/icons-material/Dashboard";
    import PersonIcon from '@mui/icons-material/Person';
    import AddBusinessIcon from '@mui/icons-material/AddBusiness';
    import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
    import StoreIcon from '@mui/icons-material/Store';
    import LogoutIcon from '@mui/icons-material/Logout';
    import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
    import PaidIcon from '@mui/icons-material/Paid';
    import RestorePageIcon from '@mui/icons-material/RestorePage';
    import "./sidebar.scss";
    import {Link} from "react-router-dom";

    const Sidebar = () => {
    return (
        <div className='sidebar'>
            <img src={Image} alt=''/>
            
        <div className='top'>
            <span className='logo'>KT Mobiles</span>
        </div>
        <hr/>
        <div className='bottom'>
    <ul>
        <p className='title'>Main</p>
        <li>
            <DashboardIcon className='icon'/>
            <span >Dashboard</span>
        </li>

        <p className='title'>Lists</p>

        <Link to="/cusreceipt" style={{textDecoration:"none"}}>
        <li>
            <PersonIcon className='icon'/>
            <span>Jobs</span>
        </li>
        </Link>
        <Link to="/sales" style={{textDecoration:"none"}}>
        <li>
            <AddBusinessIcon className='icon'/>
            <span>Sales</span>
            
        </li>
        </Link>
        
        <Link to="/sales-history" style={{textDecoration:"none"}}>
        <li>
        <WorkHistoryIcon className='icon'/>  
    <span>Sales History</span>
        </li>
        </Link>
        <Link to="/sales-return" style={{textDecoration:"none"}}>
        <li>
    <RestorePageIcon className='icon'/>
    <span>Sales Return</span>
        </li>
        </Link>
        <Link to="/service-history" style={{textDecoration:"none"}}>
        <li>
            <MiscellaneousServicesIcon className='icon'/>
            <span>Services</span>
            
            </li>
        </Link>
        <Link to="/other-costs" style={{textDecoration:"none"}}>
        <li>
    <PaidIcon className='icon'/>
    <span>Other Costs</span>
        </li>
        </Link>
        <Link to="/supplier" style={{textDecoration:"none"}}>
        <li>
            <AddBusinessIcon className='icon'/>
            <span>Suppliers</span>
            </li>
        </Link>
    
        <Link to="/stock" style={{textDecoration:"none"}}>
        <li>
            <StoreIcon className='icon'/>
            <span>Stock</span>
        </li>
        </Link>
        <p className='title'>Charts</p>
        <Link to="/stocks/summary" style={{textDecoration:"none"}}>
        <li>
            <StoreIcon className='icon'/>
            <span >Stock Summary</span>
        </li>
        </Link>
        <Link to="/final-account" style={{textDecoration:"none"}}>
        <li>
            <AddBusinessIcon className='icon'/>
            <span>Account</span>
        </li>
        </Link>
        <li>
            <LogoutIcon className='icon'/>
            <span>Logout</span>
            
        </li>
    </ul>
        </div>
        </div>
    )
    }

    export default Sidebar;
