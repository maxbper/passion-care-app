import React, { useEffect, useState, ReactNode } from 'react';
import GlobalDetailColorContext from './cancerColor';
import { getCancerTypeColor, CancerType } from '../constants/colors/colors';
import { getAuth, User } from 'firebase/auth';

interface UserBasedDetailColorProviderProps {
  children: ReactNode;
}

function UserBasedDetailColorProvider({ children }: UserBasedDetailColorProviderProps) {
  const [detailColor, setDetailColor] = useState(getCancerTypeColor('DEFAULT'));

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user: User | null) => {

      if (user) {
        let fetchedCancerType: CancerType | null = null;

        try {
           fetchedCancerType = 'breast'; // fetch cancer type from db
          const determinedColor = getCancerTypeColor(fetchedCancerType);

          if (determinedColor !== detailColor) {
             setDetailColor(determinedColor);
          }

        } catch (error) {
          console.error('Error fetching user data or determining color:', error);
          setDetailColor(getCancerTypeColor('DEFAULT'));
        }

      } else {
        setDetailColor(getCancerTypeColor('DEFAULT'));
      }
    });

    return () => unsubscribe();

  }, []);

  return (
    <GlobalDetailColorContext.Provider value={detailColor}>
      {children}
    </GlobalDetailColorContext.Provider>
  );
}

export default UserBasedDetailColorProvider;