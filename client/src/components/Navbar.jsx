import React from 'react';
import { Link } from 'react-router-dom';

import ProfilePhoto from '../assets/profile_photo.avif';

import { useAuth } from '../context/auth.context';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-blue-600 h-[7vh] px-12 top-0 w-full shadow-md text-white flex items-center justify-between">
      <Link to="/">
        <div className="text-lg h-16 flex items-center bg-white font-bold">
          <img src="https://s3.eu-north-1.amazonaws.com/asset.orgtrivia/darwinboxlogo.png" />
        </div>
      </Link>
      {isAuthenticated && (
        <div className="flex font-bold gap-2 items-center">
          {/* <img className="inline rounded-full w-10" src={ProfilePhoto} /> */}
          <button className="ml-6" onClick={logout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
