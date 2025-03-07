import React, { useEffect, useState } from 'react';
import { getEmployeesByOrg } from '../../api';
import { useOrgId } from '../../context/auth.context';
import { useNavigate } from 'react-router-dom';
import Settings from '../../pages/Settings';

const AdminDashboard = () => {
  const orgId = useOrgId();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchAllEmployees = async () => {
      if (!orgId) return;

      try {
        const employees = await getEmployeesByOrg(orgId);

        setEmployees(Array.isArray(employees) ? employees : []);
      } catch (error) {
        console.error('Error fetching employees:', error);
        setEmployees([]);
      }
    };

    fetchAllEmployees();
  }, [orgId]);

  function ListEmployees() {
    if (!Array.isArray(employees)) {
      return <p>No employees found.</p>;
    }

    return (
      <ul className="text-gray-700">
        {employees.map((emp, i) => (
          <li key={i}>👤 {emp.name}</li>
        ))}
      </ul>
    );
  }

  return (
    <div className="bg-[#f2f9ff] pt-12 items-center h-[93vh] w-[100vw] p-6">
      <div className="grid grid-cols-2 gap-6">
        <Settings />
        <div className="bg-white w-fit h-fit p-4 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold mb-2">Approve Questions</h2>
          <p className="text-gray-600">Review and approve pending questions.</p>
          <button
            onClick={() => navigate('approve-questions')}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            View Pending Questions
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
