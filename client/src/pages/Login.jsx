import React, { useState } from 'react'
import EmployeeLoginForm from '../components/EmployeeLoginForm';
import AdminLoginForm from '../components/AdminLoginForm';

const Login = () => {
  const [employeeLogin, setEmployeeLogin] = useState(true);
  return (
    <div>
      {
        employeeLogin ? <EmployeeLoginForm /> : <AdminLoginForm />
      }
      {
        employeeLogin ? <button onClick={() => setEmployeeLogin(false)}>Admin?</button> : <button onClick={() => setEmployeeLogin(true)}>Employee?</button>
      }
    </div>
  )
}

export default Login