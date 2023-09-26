import { Navigate } from 'react-router-dom';
import { userSession } from @peckishai/user-management;

export const Logout = () => {
  userSession.clear();

  return <Navigate to={'/'} />;
};
