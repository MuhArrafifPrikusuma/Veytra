import { useNavigate } from 'react-router-dom';

const VerificationError = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#824D74] to-[#E29773] p-4">
      <div className="bg-[#FCE8D5] p-8 rounded-2xl shadow-lg w-full max-w-sm text-center">
        <div className="text-red-600 text-5xl mb-4">✕</div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          Verification Failed
        </h1>
        <p className="text-gray-700 mb-4">
          We couldn't verify your email address. Please try again or contact support.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="w-full mt-4 bg-purple-700 text-white p-2 rounded-md hover:bg-purple-800 transition"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default VerificationError;