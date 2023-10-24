import {
  IconButton,
  Input,
  LoadingAbsolute,
  SidePanel,
  Table,
} from 'shared-ui';
import './style.scss';
import { ColumnDefinitionType } from 'shared-ui/components/Table/Table';
import { useState, useEffect } from 'react';
import { IngredientForCustomers } from '../../services';
import { useTranslation } from 'react-i18next';
import { Restaurant } from '../../../../restaurant/src/store/useRestaurantStore';
import { Tooltip } from 'react-tooltip';
import { customersService } from '../../services/customers.service';
import CustomerCard from '../../components/CustomerCard/CustomerCard';
import { Toaster, toast } from 'react-hot-toast';

type Props = {};

const Customers = (props: Props) => {
  const { t } = useTranslation(['common', 'ingredient']);
  const columns: ColumnDefinitionType<
    IngredientForCustomers,
    keyof IngredientForCustomers
  >[] = [
    {
      key: 'name',
      header: t('ingredient:ingredientName'),
      width: '15%',
      classname: 'column-bold',
    },

    {
      key: 'safetyStock',
      header: t('ingredient:safetyStock'),
      width: '15%',
    },
    {
      key: 'quantity',
      header: t('ingredient:actualStock'),
      width: '15%',
    },
    {
      key: 'unit',
      header: t('ingredient:unit'),
      width: '10%',
    },
    {
      key: 'ordered',
      header: 'Ordered',
      width: '10%',
      renderItem: ({ row }) =>
        row.ordered === true ? 'true' : row.ordered === false ? 'false' : row.ordered === 'N/A' ? 'N/A' : '-',
    },
  ];

  const restaurants = [
    {
      uuid: '1',
      name: 'Chez Pierre',
      address: '123 Main Street',
      city: 'Paris',
      country: 'France',
      created_at: new Date('2022-05-10'),
      currency: 'EUR',
    },
    {
      uuid: '2',
      name: 'La Trattoria',
      address: '456 Elm Avenue',
      city: 'Rome',
      country: 'Italy',
      created_at: new Date('2022-04-22'),
      currency: 'EUR',
    },
    {
      uuid: '3',
      name: "Sam's Diner",
      address: '789 Oak Road',
      city: 'New York',
      country: 'USA',
      created_at: new Date('2022-03-15'),
      currency: 'USD',
    },
    {
      uuid: '4',
      name: 'El Toro',
      address: '101 Pine Lane',
      city: 'Barcelona',
      country: 'Spain',
      created_at: new Date('2022-06-28'),
      currency: 'EUR',
    },
    {
      uuid: '5',
      name: 'Sushi Palace',
      address: '234 Cedar Street',
      city: 'Tokyo',
      country: 'Japan',
      created_at: new Date('2022-07-05'),
      currency: 'JPY',
    },
    {
      uuid: '6',
      name: 'Café de Paris',
      address: '567 Maple Drive',
      city: 'Monaco',
      country: 'Monaco',
      created_at: new Date('2022-04-18'),
      currency: 'EUR',
    },
    {
      uuid: '7',
      name: 'The Great Curry House',
      address: '890 Birch Lane',
      city: 'London',
      country: 'UK',
      created_at: new Date('2022-08-14'),
      currency: 'GBP',
    },
    {
      uuid: '8',
      name: 'Osteria da Luigi',
      address: '111 Redwood Street',
      city: 'Florence',
      country: 'Italy',
      created_at: new Date('2022-09-02'),
      currency: 'EUR',
    },
    {
      uuid: '9',
      name: 'Ristorante Buona Tavola',
      address: '654 Spruce Avenue',
      city: 'Milan',
      country: 'Italy',
      created_at: new Date('2022-10-20'),
      currency: 'EUR',
    },
    {
      uuid: '10',
      name: 'Peking Garden',
      address: '222 Juniper Road',
      city: 'Beijing',
      country: 'China',
      created_at: new Date('2022-11-08'),
      currency: 'CNY',
    },
  ];

  const [clickedRestaurand, setClickedRestaurand] = useState<
    Restaurant | undefined
  >(undefined);
  const [searchInput, setSearchInput] = useState('');
  const [customerList, setCustomerList] = useState<Restaurant[]>(restaurants);
  const [customerDetail, setCustomerDetail] = useState<
    IngredientForCustomers[]
  >([
    { id: '1', name: 'Potatoes', quantity: 34, safetyStock: 12, unit: 'kg', ordered: true },
  { id: '2', name: 'Carrots', quantity: 25, safetyStock: 10, unit: 'unit', ordered: true },
  { id: '3', name: 'Apples', quantity: 50, safetyStock: 20, unit: 'kg', ordered: true },
  { id: '4', name: 'Bananas', quantity: 40, safetyStock: 15, unit: 'unit', ordered: false },
  { id: '5', name: 'Oranges', quantity: 30, safetyStock: 12, unit: 'kg', ordered: false },
  { id: '6', name: 'Chicken', quantity: 15, safetyStock: 5, unit: 'kg', ordered: false },
  { id: '7', name: 'Beef', quantity: 20, safetyStock: 8, unit: 'kg', ordered: 'N/A' },
  { id: '8', name: 'Pasta', quantity: 100, safetyStock: 40, unit: 'g', ordered: 'N/A' },
  { id: '9', name: 'Rice', quantity: 75, safetyStock: 30, unit: 'kg', ordered: 'N/A' },
  { id: '10', name: 'Salmon', quantity: 18, safetyStock: 6, unit: 'l', ordered: 'N/A' },
  ]);
  const [sharingLink, setSharingLink] = useState('');
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingCustomerDetail, setLoadingCustomerDetail] = useState(false);

  useEffect(() => {
    setLoadingCustomers(true);
    customersService
      .getCustomers()
      .then((res) => {
        console.log('customers list :', res.data);
        // setCustomerList(res.data); temp disabled for hardcoded data
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoadingCustomers(false);
      });
  }, []);

  const handleOnSearchInputChange = (value: string) => {
    setSearchInput(value);
  };
  const filteredRestaurants =
    customerList.length > 0
      ? customerList.filter((restaurant) =>
          restaurant.name.toLowerCase().includes(searchInput.toLowerCase())
        )
      : [];

  const handleRestaurantDetailClick = (restaurant: Restaurant) => {
    setClickedRestaurand(restaurant);
    setLoadingCustomerDetail(true);
    customersService
      .getCustomerDetail(restaurant.uuid)
      .then((res) => {
        console.log('restaurant detail :', res.data);
        // setCustomerDetail(res.data); temp disabled for hardcoded data
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoadingCustomerDetail(false);
      });
  };

  const handleRemove = (uuid: string) => {
    const objWithIdIndex = customerList.findIndex((obj) => obj.uuid === uuid);

    if (objWithIdIndex > -1) {
      const updatedList = [...customerList];
      updatedList.splice(objWithIdIndex, 1);
      setCustomerList(updatedList);
    }
  };

  return (
    <div className="customers">
      <div className="tools">
        <Input
          placeholder="Search Restaurant"
          value={searchInput}
          onChange={(val) => handleOnSearchInputChange(val)}
          width="350px"
        />
        <div className="share-catalog">
          <IconButton
            icon={<i className="fa-solid fa-share"></i>}
            tooltipMsg="Share your catalog to a Restaurant"
            tooltipId="customer-tooltip"
            onClick={() =>
              setSharingLink(
                'https://supplier.peckish.com/share-catalog/G798UHbdLfzdrhfjOU1GiuhsWsd'
              )
            }
          />
          {sharingLink && (
            <>
              <div className="overlay" onClick={() => setSharingLink('')}></div>
              <div className="share-catalog-box">
                <p>Invite a restaurant to collaborate with you.</p>
                <span
                  className="sharing-button"
                  onClick={() => {
                    toast.promise(
                      customersService.getShareLink().then((res) => {
                        navigator.clipboard.writeText(res.data);
                        setSharingLink('');
                      }),
                      {
                        loading: 'Generate link...',
                        success: <b>Link Copied!</b>,
                        error: <b>Could not generate link.</b>,
                      }
                    );
                  }}>
                  Get link
                  <i className="fa-solid fa-link"></i>
                </span>
              </div>
            </>
          )}
        </div>
      </div>
      {customerList.length === 0 ? (
        <span id="no-restaurant">No restaurant found.</span>
      ) : (
        <div className="restaurants-slider-cards">
          {filteredRestaurants.map((restaurant) => (
            <CustomerCard
              key={restaurant.uuid}
              restaurant={restaurant}
              onClick={() => handleRestaurantDetailClick(restaurant)}
              onRemove={() => handleRemove(restaurant.uuid)}
            />
          ))}
        </div>
      )}
      <SidePanel
        revele={clickedRestaurand ? true : false}
        onRequestClose={() => setClickedRestaurand(undefined)}
        loading={loadingCustomerDetail}>
        <>
          <div className="metrics">
            <div className="metric">
              <span className="label">Name</span>
              <span className="value">{clickedRestaurand?.name}</span>
            </div>
            <div className="metric">
              <span className="label">Location</span>
              <span className="value">
                {clickedRestaurand?.address},
                <br />
                {clickedRestaurand?.city},
                <br />
                {clickedRestaurand?.country}
              </span>
            </div>
            <div className="metric">
              <span className="label">Open orders</span>
              <span className="value">False</span>
            </div>
            <div className="metric">
              <span className="label">Past orders</span>
              <span className="value">12</span>
            </div>
          </div>
          <Table columns={columns} data={customerDetail} />
        </>
      </SidePanel>

      <Toaster />
      <Tooltip className="tooltip" id="customer-tooltip" />
      {loadingCustomers && <LoadingAbsolute />}
    </div>
  );
};

export default Customers;
