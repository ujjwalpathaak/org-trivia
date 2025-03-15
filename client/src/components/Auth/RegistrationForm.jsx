import React, { useState } from 'react';
import { toast } from 'react-toastify';

import { validateForm } from '../../utils';
import { registerRequest } from '../../api';
import OrgSearch from './OrgSearch';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    isAdmin: false,
    rememberMe: false,
    org: {},
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : type === 'radio'
            ? value === 'true'
            : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm(formData, setErrors)) return;

    try {
      const response = await registerRequest(formData);
      const data = await response.json();

      if (response.ok) {
        toast.success(
          `Successfully registered you as an ${
            formData.isAdmin ? 'Admin' : 'Employee'
          }. Login again to get access to the dashboard!`
        );
        window.location.href = '/';
      } else {
        setErrors({ ...errors, serverError: data.message });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form className="flex flex-col" onSubmit={handleSubmit}>
      <div className="flex justify-start">
        <h1 className="text-lg font-bold mb-6 mx-12">Create New Account</h1>
      </div>
      <div className="flex items-start">
        <div className="px-12">
          <div className="mb-5">
            <label className="block mb-2 text-sm font-medium text-gray-900">
              New account for
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="isAdmin"
                  value="false"
                  checked={!formData.isAdmin}
                  onChange={handleChange}
                  className="mr-2"
                />
                Employee
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="isAdmin"
                  value="true"
                  checked={formData.isAdmin}
                  onChange={handleChange}
                  className="mr-2"
                />
                Admin
              </label>
            </div>
            {errors.isAdmin && (
              <p className="text-red-500 text-xs mt-1">{errors.isAdmin}</p>
            )}
          </div>
          <OrgSearch setFormData={setFormData} />
        </div>
        <div className="px-12">
          <div className="mb-5">
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Your Name
            </label>
            <input
              type="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`bg-gray-50 border ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
              placeholder="John Doe"
              required
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>
          <div className="mb-5">
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Your email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`bg-gray-50 border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
              placeholder="name@example.com"
              required
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>
          <div className="mb-5">
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Your password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`bg-gray-50 border ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
              placeholder="********"
              required
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>
        </div>
      </div>
      <div className="px-12 w-full">
        <button
          type="submit"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 mt-8 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center"
        >
          Register
        </button>
        {errors.serverError && (
          <p className="text-red-500 text-xs mt-1">{errors.serverError}</p>
        )}
      </div>
    </form>
  );
};

export default RegistrationForm;
