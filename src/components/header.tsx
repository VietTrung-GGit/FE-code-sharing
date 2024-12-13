import React from "react";
import Logo from "../assets/logo.svg";

function Header() {
  return (
    <header className="sticky top-0 flex justify-center py-2 z-20">
      <img src={Logo} alt="CoDash Logo" className="logo w-10 h-auto" />
    </header>
  );
}

export default Header;
