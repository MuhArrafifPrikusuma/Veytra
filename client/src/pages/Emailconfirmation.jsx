import { useNavigate } from "react-router-dom";

const EmailConfirmation = () => {
  const navigate = useNavigate(); // Hook untuk navigasi

  const handleBackToLogin = () => {
    navigate("/login"); // Arahkan ke halaman login
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#824D74] to-[#E29773] p-4">
      <div className="bg-[#FCE8D5] p-8 rounded-2xl shadow-lg w-full max-w-sm text-center">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Check your email</h1>
        <p className="text-gray-700">
          A verification link has been sent to your email. Immediately check your email and click the
          <span className="font-bold"> verify email </span> button so you can continue the login process.
        </p>
        <button
          onClick={handleBackToLogin}
          className="w-full mt-6 bg-purple-700 text-white p-2 rounded-md hover:bg-purple-800 transition"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default EmailConfirmation;
