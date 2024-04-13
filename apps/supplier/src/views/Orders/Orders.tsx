import { useTranslation } from 'react-i18next';
import { Table, Tabs, Input, OrderDetail } from 'shared-ui';
import { ColumnDefinitionType } from 'shared-ui/components/Table/Table';
import Dropdown, {
  DropdownOptionsDefinitionType,
} from 'shared-ui/components/Dropdown/Dropdown';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { Tooltip } from 'react-tooltip';
import { orderService } from '../../services';
import { useSupplierStore } from '../../store/useSupplierStore';
import toast from 'react-hot-toast';

// type Props = {};
type Ingredient = {
  name: string;
  quantity: number;
  unit: string;
  price: number;
  availability: boolean | 'N/A';
};
export type Order = {
  id: string;
  orderDate: string;
  deliveryDate: string;
  customer: string;
  status: string;
  detail: string;
  price: number;
  note: string;
  ingredients: Ingredient[];
};

const tabs = ['Orders'];

const availabilityOptions: DropdownOptionsDefinitionType[] = [
  {
    label: 'Yes',
    value: 'true',
  },
  {
    label: 'No',
    value: 'false',
  },
];

const Orders = () => {
  const { t } = useTranslation('common');
  const supplierUUID = useSupplierStore((s) => s.supplier?.uuid);

  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<{
    [key: string]: string;
  }>({});
  const [orderList, setOrderList] = useState<Order[]>([]);
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState<Order | null>(null);

  const toggleTab = (tabIndex: number) => {
    setSelectedTab(tabIndex);
  };

  const sendNewOrderStatus = useCallback(
    (row: Order, value: string) => {
      setSelectedOrderStatus((oldState) => ({
        ...oldState,
        [row.id]: value,
      }));
    },
    [setSelectedOrderStatus]
  );

  useEffect(() => {
    if (!supplierUUID) return;
    orderService
      .getOrderList(supplierUUID)
      .then((res) => {
        console.log(res);
        setOrderList(res);
      })
      .catch((err) => {
        toast.error(err.message);
      });
  }, [supplierUUID]);

  const handleOnSearchValueChange = (value: string) => {
    setSearchValue(value);
  };

  const handleAvailabilitiesChange = (index: number, val: string) => {
    // console.log('aval change : ', index, val);
    // const newAvailabilities = [...availabilities];
    // newAvailabilities[index] = val as 'true' | 'false';
    // setAvailabilities(newAvailabilities);
  };

  const columns: ColumnDefinitionType<Order, keyof Order>[] = useMemo(
    () => [
      { key: 'id', header: t('orderId') },
      { key: 'orderDate', header: t('orderDate') },
      { key: 'deliveryDate', header: t('deliveryDate') },
      { key: 'customer', header: t('customer') },
      {
        key: 'status',
        header: t('status'),
      },
      {
        key: 'price',
        header: t('price'),
        renderItem: ({ row }) => `${row.price} €`,
        classname: 'column-bold',
      },
      {
        key: 'detail',
        header: t('detail'),
        renderItem: ({ row }) => {
          return (
            <>
              <i
                className="fa-solid fa-arrow-up-right-from-square view-detail"
                data-tooltip-id="detail-tooltip"
                data-tooltip-content={t('viewDetail')}
                onClick={() => setShowOrderDetail(row)}></i>
            </>
          );
        },
      },
    ],
    [selectedOrderStatus, sendNewOrderStatus, t]
  );
  const detailColumns: ColumnDefinitionType<Ingredient, keyof Ingredient>[] = [
    {
      key: 'name',
      header: t('name'),
    },
    {
      key: 'quantity',
      header: t('quantity'),
    },
    {
      key: 'unit',
      header: t('unit'),
    },
    {
      key: 'price',
      header: t('price'),
    },
    {
      key: 'availability',
      header: t('availability'),
      renderItem: ({ row, i }) => (
        <Dropdown
          options={availabilityOptions}
          selectedOption={String(row.availability) as 'true' | 'false'}
          onOptionChange={(val) => handleAvailabilitiesChange(i, val)}
        />
      ),
    },
  ];

  return (
    <div className="orders">
      <div className="tabs-and-tools">
        <Tabs tabs={tabs} onClick={toggleTab} selectedIndex={selectedTab} />
        <div className="tools">
          <Input
            type="text"
            value={searchValue ?? ''}
            placeholder={t('search')}
            onChange={(value) => {
              handleOnSearchValueChange(value);
            }}
          />
        </div>
      </div>

      <OrderDetail
        isVisible={showOrderDetail !== null}
        onRequestClose={() => setShowOrderDetail(null)}
        upperBanner={[
          {
            title: t('orders.deliveryDate'),
            value: showOrderDetail?.orderDate ?? '',
          },
          { title: t('price'), value: showOrderDetail?.price ?? 0 },
          {
            title: t('orders.status'),
            value: showOrderDetail?.status ?? '',
          },
        ]}
        tableHeaders={detailColumns}
        tableData={showOrderDetail?.ingredients ?? []}
        note={showOrderDetail?.note}
      />
      {selectedTab === 0 && <Table data={orderList} columns={columns} />}
      <Tooltip className="tooltip" id="detail-tooltip" />
    </div>
  );
};

export default Orders;
