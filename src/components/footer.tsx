import React from 'react';
import Logo from '../assets/logo.svg';

function Footer() {
    return (
      <footer className="bg-Background/Bottom text-white px-10 py-2 mt-auto z-20 border-Primary/Dark border-solid box-border border-t-2">
        {/* Main Footer Section */}
        <div className="flex justify-between items-center">
          {/* Logo and Name */}
          <div className="flex flex-col">
          <div className="flex items-center py-4">
            <img src={Logo} alt="CoDash Logo" className="logo w-10 h-auto" />
            <span className="text-4xl font-semibold pl-2">Co</span>
            <span className="text-4xl font-semibold text-Accent/Light">Dash</span>
            </div>
            <p className="text-xl">Contact with us:</p>
            <a href="mailto:xxxxxxxxx@gmail.com" className="text-blue-400 ">xxxxxxxxx@gmail.com</a>
          </div>
          
          {/* Links Section */}
          <div className="text-xl space-y-2 flex flex-col items-center justify-center">
            <h4 className="font-semibold text-3xl  text-Accent/Target">About us</h4>
            <ul>
              <li><p>Privacy policy</p></li>
              <li><p>Terms of use</p></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Section */}
        <div className="mt-4">
          <hr className="border-white" />
          <p className="text-xl mt-2">©2024 CoDash. All rights reserved</p>
        </div>
      </footer>
    );
  }
  
  export default Footer;