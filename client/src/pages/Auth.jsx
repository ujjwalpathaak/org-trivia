import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/auth.context';

import LoginForm from '../components/Auth/LoginForm';
import RegistrationFormForm from '../components/Auth/RegistrationForm';

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
    <div className="h-[75vh] flex-grow flex justify-center items-center flex-col">
      <div className="floating-div min-w-[23rem] flex flex-col justify-center items-center py-8">
        {isLogin ? <LoginForm /> : <RegistrationFormForm />}
        <button className="underline mt-8" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "I don't have an account" : 'I already have an account'}
        </button>
      </div>
    </div>
  );
};

export default Auth;
