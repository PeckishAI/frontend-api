import { createBrowserRouter } from 'react-router-dom';
import Orders from '../views/Orders';
import Catalog from '../views/Catalog';
import Map from '../views/Map';
import Layout from '../components/Layout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
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
    ],
  },
]);
