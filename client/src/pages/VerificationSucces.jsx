import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const VerificationSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login after 3 seconds
    const timer = setTimeout(() => {
      navigate("/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#824D74] to-[#E29773] p-4">
      <div className="bg-[#FCE8D5] p-8 rounded-2xl shadow-lg w-full max-w-sm text-center">
        <div className="text-green-600 text-5xl mb-4">✓</div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Email Verified!</h1>
        <p className="text-gray-700">
          Your email has been successfully verified. You will be redirected to the login page shortly.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="w-full mt-6 bg-purple-700 text-white p-2 rounded-md hover:bg-purple-800 transition"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default VerificationSuccess;