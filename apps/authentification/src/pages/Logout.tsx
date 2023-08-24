import { Navigate } from 'react-router-dom';
import { userSession } from 'user-management';

export const Logout = () => {
  userSession.clear();

  return <Navigate to={'/'} />;
};
