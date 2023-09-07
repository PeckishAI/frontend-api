import { createBrowserRouter } from 'react-router-dom';
import Orders from '../views/Orders';
import Catalog from '../views/Catalog';
import Map from '../views/Map';
import Layout from '../components/Layout';
import Customers from '../views/Customers/Customers';
import SharingLink from '../views/SharingLink/SharingLink';
import RestaurantPreview from '../views/RestaurantPreview/RestaurantPreview';

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
      {
        path: '/customers',
        element: <Customers />,
      },
    ],
  },
  {
    path: '/sharing-link',
    element: <SharingLink />,
  },
]);
