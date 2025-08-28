import React from 'react';
import "./navbar.scss";
import SearchIcon from '@mui/icons-material/Search';
import LanguageIcon from '@mui/icons-material/Language';
import Switch from '@mui/material/Switch';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import MenuIcon from '@mui/icons-material/Menu';

const Navbar = () => {
  return (
    <div className='navbar'>
      <div className="navbarContainer">
      <div className="search">
        <input type='text' placeholder='search'/>
        <SearchIcon/>
      </div>
      <div className='items'>
        <div className='item'>
          <LanguageIcon className='icon'/>
         <span>English</span>
        </div>
        <div className='item'>
          <Switch style={{color:"#210876"}} className='icon'/>
        </div>
        <div className='item'>
          <FullscreenIcon className='icon'/>
        </div>
        <div className='item'>
        <MenuIcon className='icon'/>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Navbar;
