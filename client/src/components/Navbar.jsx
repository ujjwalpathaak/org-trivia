import React from "react";
import { Link } from "react-router-dom";

import DarwinboxLogo from "../assets/darwinboxlogo.png";

const Navbar = () => {
  return (
    <nav className="bg-blue-600 h-16 px-12 fixed top-0 w-full shadow-md text-white flex items-center justify-between">
      <Link to="/">
        <div className="text-lg h-16 flex items-center bg-white font-bold">
          <img src={DarwinboxLogo} />
        </div>
      </Link>
    </nav>
  );
};

export default Navbar;
