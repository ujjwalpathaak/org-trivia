import React, { useState } from "react";

const RegistrationForm = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  return (
    <form className="max-w-sm mx-auto">
      <h1>Create a new account</h1>
      <div className="flex items-start mb-5">
        <div className="flex items-center h-5">
          <label
            for="userType"
            className="ms-2 text-sm font-medium text-gray-900"
          >
            I am an
          </label>
          <input
            checked={isAdmin === false}
            onChange={() => setIsAdmin(false)}
            type="radio"
            id="employee"
            name="userType"
            value="employee"
          />
          <label for="employee">Employee</label>
          <input
            checked={isAdmin === true}
            onChange={() => setIsAdmin(true)}
            type="radio"
            id="css"
            name="userType"
            value="admin"
          />
          <label for="admin">Admin</label>
        </div>
      </div>
      <div className="mb-5">
        <label
          for="email"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Your email
        </label>
        <input
          type="email"
          id="email"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          placeholder="name@flowbite.com"
          required
        />
      </div>
      <div className="mb-5">
        <label
          for="password"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Your password
        </label>
        <input
          type="password"
          id="password"
          placeholder="********"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          required
        />
      </div>
      {!isAdmin && (
        <div className="flex items-start mb-5">
          <div className="flex items-center h-5">
            <input
              id="remember"
              type="checkbox"
              value=""
              className="w-4 h-4 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300"
              required
            />
          </div>
          <label
            for="remember"
            className="ms-2 text-sm font-medium text-gray-900"
          >
            Remember me
          </label>
        </div>
      )}
      <button
        type="submit"
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        Register
      </button>
    </form>
  );
};

export default RegistrationForm;
