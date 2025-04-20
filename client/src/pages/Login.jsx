import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await api.post('/login', formData);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        navigate("/reports");
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#824D74] to-[#E29773] p-4">
      <div className="bg-[#FCE8D5] p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-lg w-full max-w-xs sm:max-w-sm md:max-w-md">
        <div className="flex flex-col items-center">
          <img
            src="/images/logobaru.png"
            alt="Logo"
            className="w-24 h-24 sm:w-32 sm:h-32 mb-4"
          />
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleLogin} className="mt-4 sm:mt-6">
          <div>
            <label className="block text-gray-700 font-medium">Username</label>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full mt-1 p-2 sm:p-3 border rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
              disabled={isLoading}
            />
          </div>
          <div className="mt-4">
            <label className="block text-gray-700 font-medium">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full mt-1 p-2 sm:p-3 border rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
              disabled={isLoading}
            />
          </div>
          <div className="text-right mt-2">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs sm:text-sm text-purple-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              Forgot Password?
            </button>
          </div>
          <button
            type="submit"
            className="w-full mt-4 bg-purple-700 text-white p-2 sm:p-3 rounded-md hover:bg-purple-800 transition disabled:opacity-50 disabled:cursor-not-allowed relative"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="opacity-0">Login</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              </>
            ) : (
              "Login"
            )}
          </button>
          <p className="text-center text-xs sm:text-sm text-gray-600 mt-4">
            Don't have an account yet?{" "}
            <Link 
              to="/register" 
              className={`text-purple-600 hover:underline ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;