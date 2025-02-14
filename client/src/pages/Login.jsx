import { useContext } from "react";
// import { AuthContext } from "../App";
import { useNavigate } from "react-router-dom";

const Login = () => {
//   const { setIsAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = () => {
    setIsAuthenticated(true);
    navigate("/dashboard");
  };

  return (
    <div>
      <h1>Login Page</h1>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
