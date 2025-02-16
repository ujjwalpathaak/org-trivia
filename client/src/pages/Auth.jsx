import React, { useState } from "react";
import LoginForm from "../components/LoginForm";
import RegistrationFormForm from "../components/RegistrationForm";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex-grow flex h-[calc(100vh-4rem)] justify-center items-center bg-gray-100 flex-col">
      <div className="floating-div">
        {isLogin ? <LoginForm /> : <RegistrationFormForm />}
        <button className="underline" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "I don't have an account" : "I already have an account"}
        </button>
      </div>
    </div>
  );
};

export default Auth;
