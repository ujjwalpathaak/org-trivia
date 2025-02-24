import React, { useEffect, useState } from "react";
import { getEmployeesByOrg } from "../../services";
import { useOrgId } from "../../context/auth.context";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const orgId = useOrgId();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchAllEmployees = async () => {
      try {
        const response = await getEmployeesByOrg(orgId);
        const responseJSON = await response.json();
        const employeesList = responseJSON.employees;

        setEmployees(Array.isArray(employeesList) ? employeesList : []);
      } catch (error) {
        console.error("Error fetching employees:", error);
        setEmployees([]);
      }
    };
    fetchAllEmployees();
  }, []);

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
    <div className="bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold mb-2">All Employees</h2>
          <ListEmployees />
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold mb-2">Leaderboard</h2>
          <ul className="text-gray-700">
            <li>🥇 Alice - 980 pts</li>
            <li>🥈 Bob - 920 pts</li>
            <li>🥉 Charlie - 860 pts</li>
          </ul>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold mb-2">Approve Questions</h2>
          <p className="text-gray-600">Review and approve pending questions.</p>
          <button
            onClick={() => navigate("approve-questions")}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            View Pending Questions
          </button>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold mb-2">Settings</h2>
          <p className="text-gray-600">
            Manage admin settings and configurations.
          </p>
          <button
            onClick={() => navigate("settings")}
            className="mt-3 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Open Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
