import { createBrowserRouter } from 'react-router-dom';
import MyRestaurant from '../views/MyRestaurant';
import Overview from '../views/Overview';
import Inventory from '../views/Inventory';
import Recipes from '../views/Recipes';
import Layout from '../components/Layout';

export const router = createBrowserRouter([
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
    ],
  },
]);
