import React, { useEffect, useState } from 'react';
import LoginForm from '../components/Auth/LoginForm';
import RegistrationFormForm from '../components/Auth/RegistrationForm';
import { useAuth } from '../context/auth.context';
import { redirect, useNavigate } from 'react-router-dom';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="parent-page-div flex-grow flex justify-center items-center flex-col">
      <div className="floating-div w-[23rem] flex flex-col justify-center items-center py-8">
        {isLogin ? <LoginForm /> : <RegistrationFormForm />}
        <button className="underline mt-8" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "I don't have an account" : 'I already have an account'}
        </button>
      </div>
    </div>
  );
};

export default Auth;
