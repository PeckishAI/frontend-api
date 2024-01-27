import { Navigate, createBrowserRouter } from 'react-router-dom';
import Orders from '../views/Orders/Orders';
import Catalog from '../views/Catalog';
import Map from '../views/Map/Map';
import Layout from '../components/Layout';
import Customers from '../views/Customers/Customers';
import SharingLink from '../views/SharingLink/SharingLink';
import Integrations from '../views/Integrations/Integrations';
import { ProtectedRoute } from '@peckishai/user-management';
import OAuthPopup from '../utils/oauth/OAuth2Popup';

export const router = createBrowserRouter([
  {
    path: '/oauth/callback',
    element: <OAuthPopup />,
  },
  {
    path: '/',
    element: <ProtectedRoute clientType="supplier" />,
    children: [
      {
        path: '/',
        element: <Layout />,
        children: [
          {
            path: '/',
            element: <Navigate to={'/orders'} />,
          },
          {
            path: '/orders',
            element: <Orders />,
          },
          {
            path: '/catalog',
            element: <Catalog />,
          },
          {
            path: '/map',
            element: <Map />,
          },
          {
            path: '/integrations',
            element: <Integrations />,
          },
          {
            path: '/customers',
            element: <Customers />,
          },
          {
            path: '*',
            element: <Navigate to={'/orders'} />,
          },
        ],
      },
      {
        path: '/sharing-link',
        element: <SharingLink />,
      },
    ],
  },
]);
