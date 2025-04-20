import { createContext, useState } from "react";
import PropTypes from "prop-types"; // Tambahkan import PropTypes

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profileImageUrl, setProfileImageUrl] = useState("/images/irpang.jpg");

  return (
    <ProfileContext.Provider value={{ profileImageUrl, setProfileImageUrl }}>
      {children}
    </ProfileContext.Provider>
  );
};

// Tambahkan validasi PropTypes
ProfileProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProfileContext;