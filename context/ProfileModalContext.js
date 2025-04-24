import React, { createContext, useContext, useState } from 'react';

const ProfileModalContext = createContext();

export const ProfileModalProvider = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const showModal = () => setIsVisible(true);
  const hideModal = () => setIsVisible(false);

  return (
    <ProfileModalContext.Provider value={{ isVisible, showModal, hideModal }}>
      {children}
    </ProfileModalContext.Provider>
  );
};

export const useProfileModal = () => useContext(ProfileModalContext);
