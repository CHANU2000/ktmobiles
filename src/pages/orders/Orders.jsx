import React from 'react';
import './orders.scss';
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';

const Orders = () => {
  return (
    <div className='orders'>
      <Sidebar/>
      <div className='ordersContainer'>
        <Navbar/>
      </div>
    </div>
  )
}

export default Orders
