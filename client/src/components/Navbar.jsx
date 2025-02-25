import React from 'react';
import { Link } from 'react-router-dom';

import ProfilePhoto from '../assets/profile_photo.avif';

import DarwinboxLogo from '../assets/darwinboxlogo.png';
import { useAuth } from '../context/auth.context';

const Navbar = () => {
  const { isAuthenticated, data, logout } = useAuth();

  return (
    <nav className="bg-blue-600 h-16 px-12 fixed top-0 w-full shadow-md text-white flex items-center justify-between">
      <Link to="/">
        <div className="text-lg h-16 flex items-center bg-white font-bold">
          <img src={DarwinboxLogo} />
        </div>
      </Link>
      {isAuthenticated && (
        <div className="flex font-bold gap-2 items-center">
          {data?.user?.name && `Welcome ${data.user.name}`}
          <img className="inline rounded-full w-10" src={ProfilePhoto} />
          <button className="ml-6" onClick={logout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
