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
        row.ordered === true ? 'true' : row.ordered === false ? 'false' : '-',
    },
  ];

  const [clickedRestaurand, setClickedRestaurand] = useState<
    Restaurant | undefined
  >(undefined);
  const [searchInput, setSearchInput] = useState('');
  const [customerList, setCustomerList] = useState<Restaurant[]>([]);
  const [customerDetail, setCustomerDetail] = useState<
    IngredientForCustomers[]
  >([]);
  const [sharingLink, setSharingLink] = useState('');
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingCustomerDetail, setLoadingCustomerDetail] = useState(false);

  useEffect(() => {
    setLoadingCustomers(true);
    customersService
      .getCustomers()
      .then((res) => {
        console.log('customers list :', res.data);
        setCustomerList(res.data);
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
        setCustomerDetail(res.data);
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
              <span className="value">5</span>
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
