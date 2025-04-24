import { useContext, createContext } from 'react';
import { getCancerTypeColor } from '../constants/colors/colors';

const defaultColor = getCancerTypeColor('DEFAULT');
const GlobalDetailColorContext = createContext<string>(defaultColor);

export const useUserColor = () => {
  const contextValue = useContext(GlobalDetailColorContext);

  if (contextValue === defaultColor && typeof contextValue !== 'string') {
     console.warn('useUserColor hook might be used outside of UserBasedDetailColorProvider.');
  }

  return contextValue; 
};

export default GlobalDetailColorContext;