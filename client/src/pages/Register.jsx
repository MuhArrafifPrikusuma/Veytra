import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/register', formData);
      if (response.data) {
        navigate("/email-confirmation");
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#824D74] to-[#E29773] p-4">
      <div className="bg-[#FCE8D5] p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-lg w-full max-w-xs sm:max-w-sm md:max-w-md">
        <h1 className="text-xl sm:text-2xl font-semibold text-center text-gray-800 mb-4">
          Register
        </h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleRegister}>
          <div>
            <label className="block font-medium text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full mt-1 p-2 sm:p-3 border rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={isLoading}
              required
            />
          </div>
          <div className="mt-4">
            <label className="block font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full mt-1 p-2 sm:p-3 border rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={isLoading}
              required
            />
          </div>
          <div className="mt-4">
            <label className="block font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full mt-1 p-2 sm:p-3 border rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={isLoading}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full mt-4 bg-purple-700 text-white p-2 sm:p-3 rounded-md hover:bg-purple-800 transition disabled:opacity-50 disabled:cursor-not-allowed relative"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="opacity-0">Register</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;