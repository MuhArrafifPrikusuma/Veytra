import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiLogOut, FiCheck } from "react-icons/fi";
import ProfileContext from "../components/ProfileContext";

const Profile = () => {
  const navigate = useNavigate();
  const [editingField, setEditingField] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const { profileImageUrl, setProfileImageUrl } = useContext(ProfileContext);
  const [profile, setProfile] = useState({
    name: "Tenochtiltan",
    email: "EmailSaya@gmail.com",
    phone: "08080808080",
    address: "Jl. A. P. Pettarani No.4",
    about: "Saya suka makan bakso",
  });

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setEditingField(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("userSession");
    navigate("/login");
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImageUrl(reader.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen h-screen bg-gray-100 flex flex-col items-center p-6 overflow-hidden">
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        id="profile-image-upload"
        onChange={handleImageChange}
      />
      <h1 className="text-3xl font-bold text-[#86507B] w-full max-w-4xl mb-2 border-b pb-2">
        Profile
      </h1>

      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-8 border flex flex-col items-center md:flex-row md:items-start">
        <div className="flex flex-col items-center md:w-1/4">
          <img
            src={profileImageUrl}
            alt="Profile"
            className="w-40 h-40 rounded-full border-2 border-gray-300 cursor-pointer"
            onClick={() => document.getElementById('profile-image-upload').click()}
          />
          <button
            onClick={() => setShowPopup(true)}
            className="bg-gray-200 text-black px-4 py-2 rounded mt-2 flex items-center gap-2 border shadow-sm hover:bg-gray-300 transition hidden md:flex"
          >
            <FiLogOut className="text-lg" /> Log Out
          </button>
        </div>

        <div className="md:w-3/4 md:pl-8 mt-4 md:mt-0 w-full">
          {["name", "email", "phone", "address"].map((field) => (
            <div key={field} className="mb-2 flex items-center">
              <span className="font-semibold capitalize w-1/3">{field}:</span>
              <div className="flex items-center w-2/3">
                {editingField === field ? (
                  <input
                    type="text"
                    name={field}
                    value={profile[field]}
                    onChange={handleChange}
                    className="border p-2 rounded w-full bg-white focus:outline-[#86507B]"
                  />
                ) : (
                  <span className="flex-grow">{profile[field]}</span>
                )}
                {editingField === field ? (
                  <FiCheck
                    className="text-green-600 cursor-pointer ml-1"
                    onClick={handleSave}
                  />
                ) : (
                  <FiEdit2
                    className="text-gray-500 cursor-pointer ml-1"
                    onClick={() => setEditingField(field)}
                  />
                )}
              </div>
            </div>
          ))}

          <div className="mt-4">
            <h2 className="font-semibold">About me</h2>
            {editingField === "about" ? (
              <textarea
                name="about"
                value={profile.about}
                onChange={handleChange}
                onBlur={handleSave}
                className="w-full min-h-[250px] border bg-white p-2 rounded mt-1 resize-none focus:outline-[#86507B]"
                autoFocus
              />
            ) : (
              <p
                className="w-full min-h-[250px] border bg-gray-200 p-2 rounded mt-1 cursor-pointer text-left"
                onClick={() => setEditingField("about")}
              >
                {profile.about}
              </p>
            )}
            <button
              onClick={() => setShowPopup(true)}
              className="bg-gray-200 text-black px-4 py-2 rounded mt-2 flex items-center gap-2 border shadow-sm hover:bg-gray-300 transition md:hidden"
            >
              <FiLogOut className="text-lg" /> Log Out
            </button>
          </div>
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/30 backdrop-blur-md">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
            <p className="mb-4">Apakah Anda yakin ingin keluar?</p>
            <div className="flex justify-between">
              <button
                className="px-4 py-2 bg-gray-300 text-black rounded-lg w-1/2 mr-2"
                onClick={() => setShowPopup(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-[#86507B] text-white rounded-lg w-1/2"
                onClick={handleLogout}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;