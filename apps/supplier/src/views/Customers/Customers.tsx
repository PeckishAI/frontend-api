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
import { Tooltip } from 'react-tooltip';
import { customersService } from '../../services/customers.service';
import CustomerCard from '../../components/CustomerCard/CustomerCard';
import { toast } from 'react-hot-toast';
import { useSupplierStore } from '../../store/useSupplierStore';

export type Customer = {
  uuid: string;
  name: string;
  address: string;
  city: string;
  country: string;
  created_at?: Date;
};

type Props = {};

const Customers = (props: Props) => {
  const { t } = useTranslation(['common', 'ingredient']);
  const supplierUUID = useSupplierStore((s) => s.supplier?.uuid);

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
      header: t('unit'),
      width: '10%',
    },
    {
      key: 'ordered',
      header: 'Ordered',
      width: '10%',
      renderItem: ({ row }) =>
        row.ordered === true
          ? 'true'
          : row.ordered === false
          ? 'false'
          : row.ordered === 'N/A'
          ? 'N/A'
          : '-',
    },
  ];

  const [clickedRestaurand, setClickedRestaurand] = useState<Customer | null>(
    null
  );
  const [searchInput, setSearchInput] = useState('');
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [customerDetail, setCustomerDetail] = useState<
    IngredientForCustomers[]
  >([]);
  const [sharingLink, setSharingLink] = useState('');
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingCustomerDetail, setLoadingCustomerDetail] = useState(false);

  useEffect(() => {
    if (!supplierUUID) return;
    setLoadingCustomers(true);
    customersService
      .getCustomers(supplierUUID)
      .then((res) => {
        console.log('customers list :', res);
        setCustomerList(res);
      })
      .catch((err) => {
        toast.error(err.message);
      })
      .finally(() => {
        setLoadingCustomers(false);
      });
  }, [supplierUUID]);

  const handleOnSearchInputChange = (value: string) => {
    setSearchInput(value);
  };
  const filteredCustomers =
    customerList.length > 0
      ? customerList.filter((c) =>
          c.name.toLowerCase().includes(searchInput.toLowerCase())
        )
      : [];

  const handleRestaurantDetailClick = (restaurant: Customer) => {
    setClickedRestaurand(restaurant);
    setLoadingCustomerDetail(true);
    customersService
      .getCustomerDetail(restaurant.uuid)
      .then((res) => {
        console.log('restaurant detail :', res);
        setCustomerDetail(res);
      })
      .catch((err) => {
        console.log(err);
        setClickedRestaurand(null);
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
          {filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.uuid}
              customer={customer}
              onClick={() => handleRestaurantDetailClick(customer)}
              onRemove={() => handleRemove(customer.uuid)}
            />
          ))}
        </div>
      )}
      <SidePanel
        isOpen={clickedRestaurand ? true : false}
        onRequestClose={() => setClickedRestaurand(null)}
        loading={loadingCustomerDetail}>
        <>
          <div className="metrics">
            <div className="metric">
              <span className="label">{t('name')}</span>
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
              <span className="value">N/A</span>
            </div>
            <div className="metric">
              <span className="label">Past orders</span>
              <span className="value">N/A</span>
            </div>
          </div>
          <Table columns={columns} data={customerDetail} />
        </>
      </SidePanel>

      <Tooltip className="tooltip" id="customer-tooltip" />
      {loadingCustomers && <LoadingAbsolute />}
    </div>
  );
};

export default Customers;
