import React, { useState, useEffect } from 'react';
import { SidePanel, Table, Button, Input, DatePicker } from 'shared-ui';
import styles from './OrderDetail.module.scss';
import { ColumnDefinitionType } from 'shared-ui/components/Table/Table';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { useRestaurantStore } from '../../../../apps/restaurant/src/store/useRestaurantStore';
import supplierService, {
  SupplierIngredient,
} from '../../../../apps/restaurant/src/services/supplier.service';
import { inventoryService } from '../../../../apps/restaurant/src/services/inventory.service';
import { Unit } from '../../../../apps/restaurant/src/services/index';

type OrderItem = {
  uuid?: string;
  ingredientUUID: string;
  ingredientName: string;
  quantity: number;
  unitUUID?: string;
  unitName: string;
  price: number;
  receivedQuantity?: number;
  supplierUUID: string;
};

type Props = {
  isVisible: boolean;
  onRequestClose: () => void;
  upperBanner: {
    title: string;
    value: string | number;
  }[];
  tableData: OrderItem[];
  note?: string;
  footerContent?: React.ReactNode;
  orderStatus: string;
  onSave: (data: {
    tableData: OrderItem[];
    deliveryDate: Date;
    status: string;
  }) => void;
  isLoading: boolean;
};

export const OrderDetail = (props: Props) => {
  const { t } = useTranslation(['placeOrder']);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isReceiveMode, setIsReceiveMode] = useState(false);
  const [supplierIngredients, setSupplierIngredients] = useState<
    SupplierIngredient[]
  >([]);
  const [editableTableData, setEditableTableData] = useState<OrderItem[]>(
    props.tableData || []
  );
  const [allUnits, setAllUnits] = useState<Unit[]>([]);
  const [ingredientUnits, setIngredientUnits] = useState<Unit[]>([]);
  const [otherUnits, setOtherUnits] = useState<Unit[]>([]);
  const [rowUnits, setRowUnits] = useState<
    Record<number, { ingredientUnits: Unit[]; otherUnits: Unit[] }>
  >({});
  const [calculatedPrices, setCalculatedPrices] = useState<number[]>([]);
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null);

  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );

  useEffect(() => {
    const fetchUnits = async () => {
      if (selectedRestaurantUUID) {
        const units = await inventoryService.getUnits(selectedRestaurantUUID);
        setAllUnits(units);
      }
    };
    fetchUnits();
  }, [selectedRestaurantUUID]);

  useEffect(() => {
    const fetchSupplierIngredients = async (supplierUUID: string) => {
      if (selectedRestaurantUUID && supplierUUID) {
        const data = await supplierService.getSupplierIngredient(
          selectedRestaurantUUID,
          supplierUUID
        );
        if (data) {
          setSupplierIngredients(data);

          // Initialize unit options for each row based on the current ingredient
          const newRowUnits: Record<
            number,
            { ingredientUnits: Unit[]; otherUnits: Unit[] }
          > = {};
          editableTableData.forEach((row, index) => {
            const currentIngredient = data.find(
              (ingredient) => ingredient.name === row.ingredientName
            );
            const currentIngredientUnits = currentIngredient?.units || [];
            const newOtherUnits = allUnits.filter(
              (unit) =>
                !currentIngredientUnits.some(
                  (ingUnit) => ingUnit.unit_name === unit.unit_name
                )
            );
            newRowUnits[index] = {
              ingredientUnits: currentIngredientUnits,
              otherUnits: newOtherUnits,
            };
          });
          setRowUnits(newRowUnits);
        }
      }
    };

    if (isEditMode && editableTableData.length > 0) {
      fetchSupplierIngredients(editableTableData[0].supplierUUID);
    }
  }, [isEditMode, selectedRestaurantUUID, editableTableData, allUnits]);

  useEffect(() => {
    if (editableTableData.length > 0) {
      const currentIngredientName = editableTableData[0].ingredientName;
      const currentIngredient = supplierIngredients.find(
        (ingredient) => ingredient.name === currentIngredientName
      );
      const currentIngredientUnits = currentIngredient?.units || [];
      setIngredientUnits(currentIngredientUnits);
      setOtherUnits(
        allUnits.filter(
          (unit) =>
            !currentIngredientUnits.some(
              (ingUnit) => ingUnit.unit_name === unit.unit_name
            )
        )
      );
    }
  }, [editableTableData, supplierIngredients, allUnits]);

  useEffect(() => {
    recalculatePrices();
  }, [editableTableData, supplierIngredients]);

  const recalculatePrices = () => {
    const newCalculatedPrices = editableTableData.map((row) => {
      const ingredient = supplierIngredients.find(
        (ingredient) => ingredient.name === row.ingredientName
      );
      const unit = ingredient?.units.find(
        (unit) => unit.unit_uuid === row.unitUUID
      );
      const unitCost = unit?.unit_cost || 0;
      return unitCost * row.quantity;
    });
    setCalculatedPrices(newCalculatedPrices);
  };

  const addNewRow = () => {
    const newRow: OrderItem = {
      ingredientUUID: '',
      ingredientName: '',
      quantity: 0,
      unitName: '',
      price: 0,
      supplierUUID: '', // Use a default or selected supplier UUID
    };
    setEditableTableData((prev) => [...prev, newRow]);
  };

  const columns: ColumnDefinitionType<OrderItem>[] = [
    {
      key: 'ingredientName',
      header: t('ingredientName'),
      renderItem: ({ row, index }) =>
        isEditMode ? (
          <Select
            options={supplierIngredients.map((ingredient) => ({
              value: ingredient.name,
              label: ingredient.name,
            }))}
            defaultValue={{
              value: row.ingredientName,
              label: row.ingredientName,
            }}
            onChange={(selectedOption) => {
              const newData = [...editableTableData];
              const selectedIngredient = supplierIngredients.find(
                (ingredient) => ingredient.name === selectedOption?.value
              );
              if (selectedIngredient) {
                newData[index].ingredientName = selectedIngredient.name;
                newData[index].ingredientUUID =
                  selectedIngredient.ingredient_uuid;
              }
              setEditableTableData(newData);
              const newIngredientUnits = selectedIngredient?.units || [];
              const newOtherUnits = allUnits.filter(
                (unit) =>
                  !newIngredientUnits.some(
                    (ingUnit) => ingUnit.unit_name === unit.unit_name
                  )
              );
              setRowUnits((prev) => ({
                ...prev,
                [index]: {
                  ingredientUnits: newIngredientUnits,
                  otherUnits: newOtherUnits,
                },
              }));
            }}
          />
        ) : (
          row.ingredientName
        ),
    },
    {
      key: 'quantity',
      header: isReceiveMode ? t('Ordered QTY') : t('quantity'),
      renderItem: ({ row, index }) =>
        isEditMode ? (
          <Input
            type="number"
            value={row.quantity}
            onChange={(value) => {
              const newValue = Number(value);
              if (!isNaN(newValue)) {
                const newData = [...editableTableData];
                const currentRow = { ...newData[index] };
                currentRow.quantity = newValue;
                newData[index] = currentRow;
                setEditableTableData(newData);
                recalculatePrices(); // Trigger recalculation
              }
            }}
          />
        ) : (
          row.quantity
        ),
    },
    ...(isReceiveMode
      ? [
          {
            key: 'receivedQuantity' as keyof OrderItem,
            header: t('Received QTY'),
            renderItem: ({ row, index }) => {
              return (
                <Input
                  type="number"
                  width="20px"
                  value={
                    row.receivedQuantity !== null
                      ? row.receivedQuantity
                      : row.quantity
                  }
                  onChange={(value) => {
                    const newValue = Number(value);
                    if (!isNaN(newValue)) {
                      const newData = [...editableTableData];
                      newData[index].receivedQuantity = newValue;
                      setEditableTableData(newData);
                      console.log(editableTableData);
                    }
                  }}
                />
              );
            },
          },
        ]
      : []),
    {
      key: 'unitName',
      header: t('unit'),
      renderItem: ({ row, index }) => {
        const currentRowUnits = rowUnits[index] || {
          ingredientUnits: [],
          otherUnits: [],
        };
        const unitSelectOptions = [
          {
            label: 'Existing Units',
            options: currentRowUnits.ingredientUnits.map((unit) => ({
              label: unit.unit_name,
              value: unit.unit_uuid,
            })),
          },
          {
            label: 'Other Units',
            options: currentRowUnits.otherUnits.map((unit) => ({
              label: unit.unit_name,
              value: unit.unit_uuid,
            })),
          },
        ].filter((group) => group.options.length > 0);

        return isEditMode ? (
          <Select
            options={unitSelectOptions}
            defaultValue={{
              value: row.unitUUID,
              label: row.unitName,
            }}
            onChange={(selectedOption) => {
              const newData = [...editableTableData];
              const currentRow = { ...newData[index] };
              currentRow.unitUUID = selectedOption?.value || '';
              const selectedUnit = currentRowUnits.ingredientUnits.find(
                (unit) => unit.unit_uuid === selectedOption?.value
              );
              const newUnitCost = selectedUnit?.unit_cost || 0;
              currentRow.price = newUnitCost;
              newData[index] = currentRow;
              setEditableTableData(newData);
            }}
          />
        ) : (
          row.unitName
        );
      },
    },
    {
      key: 'price',
      header: t('price'),
      renderItem: ({ row, index }) => {
        const isExistingUnit = ingredientUnits.some(
          (unit) => unit.unit_uuid === row.unitUUID
        );
        if (isEditMode && !isExistingUnit) {
          return (
            <Input
              type="number"
              value={row.price}
              onChange={(value) => {
                const newValue = Number(value);
                if (!isNaN(newValue)) {
                  const newData = [...editableTableData];
                  newData[index] = { ...newData[index], price: newValue };
                  setEditableTableData(newData);
                }
              }}
            />
          );
        } else {
          return <span>{row.price * row.quantity}</span>;
        }
      },
    },
  ];

  if (props.orderStatus !== 'draft' && props.orderStatus !== 'pending') {
    columns.push({ key: 'receivedQuantity', header: t('receivedQuantity') });
  }

  return (
    <SidePanel
      loading={props.isLoading}
      isOpen={props.isVisible}
      onRequestClose={props.onRequestClose}
      className={styles.sidePanel}>
      <div className={styles.infosContainer}>
        {props.upperBanner.map((info) => (
          <div key={info.value} className={styles.info}>
            <p className={styles.infoTitle}>{info.title}</p>
            <p className={styles.infoValue}>
              {info.title === 'Delivery Date' && isEditMode ? (
                <DatePicker
                  size="small"
                  selected={deliveryDate}
                  dateFormat="yyyy-MM-dd"
                  onChange={(date) => setDeliveryDate(date)}
                  placeholderText={'Select Delivery Date'}
                  minDate={new Date()}
                />
              ) : (
                info.value
              )}
            </p>
          </div>
        ))}
        <div className={styles.buttonContainer}>
          {props.orderStatus === 'pending' && (
            <Button
              type="primary"
              value={!isReceiveMode ? 'Receive Stock' : 'Validate'}
              onClick={() => {
                if (!isReceiveMode) {
                  setIsReceiveMode(true);
                } else {
                  props.onSave({
                    tableData: editableTableData,
                    deliveryDate,
                    status: 'received',
                  });
                }
              }}
            />
          )}
          {props.orderStatus !== 'draft' && props.orderStatus !== 'pending' && (
            <span>{t('received')}</span>
          )}
        </div>
      </div>
      {props.note && (
        <p className={styles.note}>
          <span className={styles.label}>{t('addedNote')}: </span>
          {props.note}
        </p>
      )}
      <Table
        columns={columns}
        data={isEditMode ? editableTableData : props.tableData}
      />
      {isEditMode && (
        <Button
          value={t('addIngredient')}
          type="secondary"
          onClick={addNewRow}
        />
      )}
      {props.footerContent}
      <div className={styles.buttonContainer}>
        {props.orderStatus === 'draft' && (
          <>
            <Button
              value={isEditMode ? 'Save' : 'Edit'}
              type={isEditMode ? 'primary' : 'secondary'}
              onClick={() => {
                if (isEditMode) {
                  props.onSave({
                    tableData: editableTableData,
                    deliveryDate,
                    status: 'draft',
                  });
                }
                setIsEditMode(!isEditMode);
              }}
            />
            {!isEditMode && (
              <Button
                value="Approve"
                type="primary"
                onClick={() => {
                  props.onSave({
                    tableData: editableTableData,
                    deliveryDate,
                    status: 'pending',
                  });
                }}
              />
            )}
          </>
        )}
      </div>
    </SidePanel>
  );
};
