import React from 'react';
import './inventory.scss';
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';

const Inventory = () => {
  return (
    <div className='inventory'>
      <Sidebar/>
      <div className='inventoryContainer'>
        <Navbar/>
      </div>
    </div>
  )
}

export default Inventory;
