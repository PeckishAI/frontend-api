import { createBrowserRouter, Navigate } from 'react-router-dom';
import MyRestaurant from '../views/MyRestaurant';
import Overview from '../views/Overview/Overview';
import Inventory from '../views/Inventory';
import Recipes from '../views/Recipes';
import Onboarding from '../views/Onboarding/Onboarding';
import Layout from '../components/Layout';
import { ProtectedRoute } from './ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      // {
      //   index: true,
      //   element: <Navigate to={'/overview'} />,
      // },
      {
        path: '/onboarding',
        element: <Onboarding />,
      },
      {
        path: '/',
        element: <Layout />,
        children: [
          {
            index: true,
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
            element: <Navigate to={'/'} />,
          },
        ],
      },
    ],
  },
  {
    path: '/onboarding',
    element: <Onboarding />,
  },
]);
