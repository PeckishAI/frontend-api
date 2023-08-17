import { createBrowserRouter, Navigate } from 'react-router-dom';
import MyRestaurant from '../views/MyRestaurant';
import Overview from '../views/Overview/Overview';
import Inventory from '../views/Inventory';
import Recipes from '../views/Recipes';
import Onboarding from '../views/Onboarding';
import Layout from '../components/Layout';
import { LoginHandler } from './LoginHandler';

export const router = createBrowserRouter([
  {
    index: true,
    element: <Navigate to={'/overview'} />,
  },
  {
    path: '/login-handler',
    element: <LoginHandler />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/myRestaurant',
        element: <MyRestaurant />,
      },
      {
        path: '/overview',
        element: <Overview />,
      },
      {
        path: '/inventory',
        element: <Inventory />,
      },
      {
        path: '/recipes',
        element: <Recipes />,
      },
      {
        path: '*',
        element: <Navigate to={'/overview'} />,
      },
    ],
  },
  {
    path: '/onboarding',
    element: <Onboarding />,
  },
]);
