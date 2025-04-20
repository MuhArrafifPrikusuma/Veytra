import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "../services/api";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    password_confirmation: "",
    token: token
  });
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await api.post('/reset-password', formData);
      setSuccess("Password has been reset successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#824D74] to-[#E29773] p-4">
      <div className="bg-[#FCE8D5] p-4 sm:p-6 md:p-8 rounded-xl shadow-lg w-full max-w-xs sm:max-w-sm md:max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Set New Password
        </h1>
        <hr className="border-t border-gray-300 mb-4" />
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleReset}>
          <div>
            <label className="block text-gray-700 font-medium">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="w-full mt-1 p-2 sm:p-3 border rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
              required
              disabled={isLoading}
            />
          </div>
          <div className="mt-4">
            <label className="block text-gray-700 font-medium">New Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter new password"
              value={formData.password}
              onChange={handleChange}
              className="w-full mt-1 p-2 sm:p-3 border rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
              required
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className="w-full mt-4 bg-purple-700 text-white p-2 sm:p-3 rounded-md hover:bg-purple-800 transition disabled:opacity-50 disabled:cursor-not-allowed relative"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="opacity-0">Reset Password</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;