import React, { useEffect, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DialogBox, Dropdown, EmptyPage } from 'shared-ui';
import supplierService, {
  LinkedSupplier,
  SyncSupplier,
} from '../../../services/supplier.service';
import styles from './SupplierTab.module.scss';
import { SupplierCard, SupplierCardSkeleton } from './components/SupplierCard';
import { toast } from 'react-hot-toast';
import { GLOBAL_CONFIG } from 'shared-config';
import Fuse from 'fuse.js';
import AddSupplierPopup from './components/AddSupplierPopup';
import Skeleton from 'react-loading-skeleton';
import { useRestaurantStore } from '../../../store/useRestaurantStore';
import { Tooltip } from 'react-tooltip';

export type SupplierTabRef = {
  renderOptions: () => React.ReactNode;
};

type Props = {
  searchValue: string;
  setLoadingState: (loading: boolean) => void;
  forceOptionsUpdate: () => void;
};

export const SupplierTab = React.forwardRef<SupplierTabRef, Props>(
  (props, forwardedRef) => {
    const { t } = useTranslation('common');

    const [suppliers, setSuppliers] = useState<LinkedSupplier[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [deletingSupplierUUID, setDeletingSupplierUUID] = useState<
      string | null
    >(null);
    const [syncContacts, setSyncContacts] = useState<SyncSupplier[]>([]);
    const [selectedSyncContact, setSelectedSyncContact] = useState<
      string | null
    >(null);
    const [syncingSupplierUUID, setSyncingSupplierUUID] = useState<
      string | null
    >(null);

    const [popupMode, setPopupMode] = useState<'add' | 'edit'>('add');
    const [editSupplier, setEditSupplier] = useState<LinkedSupplier | null>(
      null
    );

    const [showPopup, setShowPopup] = useState(false);

    const handleAddSupplierClick = () => {
      setPopupMode('add');
      setEditSupplier(null);
      setShowPopup(true);
    };

    const handleEditSupplierClick = (supplier: LinkedSupplier) => {
      if (!supplier?.uuid) {
        console.error('No supplier UUID provided for edit');
        toast.error(t('suppliers.errors.invalidSupplier'));
        return;
      }

      // Log to verify the data
      console.log('Editing supplier:', supplier);

      setPopupMode('edit');
      setEditSupplier(supplier);
      setShowPopup(true);
    };

    const [connectedIntegrations, setConnectedIntegrations] =
      useState<boolean>();

    const { restaurantUUID, restaurants } = useRestaurantStore((state) => ({
      restaurantUUID: state.selectedRestaurantUUID,
      restaurants: state.restaurants,
    }));

    const fetchSuppliersAndSync = async () => {
      try {
        const data =
          await supplierService.getRestaurantSuppliers(restaurantUUID);
        setSuppliers(data);
        {
          connectedIntegrations && handleSync();
        }
      } catch (error) {
        console.error('Error fetching suppliers or syncing:', error);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };

    // Render options for the tab bar
    useImperativeHandle(forwardedRef, () => {
      props.forceOptionsUpdate();

      return {
        renderOptions: () => (
          <Button
            value={t('inventory.addSupplierBtn')}
            type="primary"
            onClick={() => handleAddSupplierClick()}
          />
        ),
      };
    }, []);

    useEffect(() => {
      if (!restaurantUUID) return;

      fetchSuppliersAndSync();
    }, [restaurantUUID]);

    useEffect(() => {
      if (!restaurantUUID) return;

      // Log the xero value when restaurantUUID changes
      const selectedRestaurant = restaurants.find(
        (restaurant) => restaurant.uuid === restaurantUUID
      );
      if (selectedRestaurant) {
        selectedRestaurant.provider.forEach((provide) => {
          setConnectedIntegrations(provide.xero);
        });
      }
    }, [restaurants, restaurantUUID]);

    const handleCopyInvitationLink = (invitationKey?: string) => {
      if (!invitationKey) {
        toast.error(t('suppliers.noLink'));
        return;
      }

      const link = `${GLOBAL_CONFIG.supplierUrl}/invitation/${invitationKey}`;
      navigator.clipboard.writeText(link);
      toast.success(t('suppliers.linkCopied'));
    };

    const handleDeleteSupplier = () => {
      if (!restaurantUUID || !deletingSupplierUUID) return;
      setShowDeleteDialog(false);
      toast.promise(
        new Promise((resolve, reject) =>
          supplierService
            .deleteSupplier(deletingSupplierUUID!)
            .then(() => {
              setSuppliers((suppliers) =>
                suppliers.filter((s) => s.uuid !== deletingSupplierUUID)
              );
              setDeletingSupplierUUID(null);
              resolve(true);
            })
            .catch(() => reject())
        ),
        {
          loading: t('suppliers.removeSupplierToast.loading'),
          success: t('suppliers.removeSupplierToast.success'),
          error: t('suppliers.removeSupplierToast.error'),
        }
      );
    };

    const handleSubmit = (contactId?: string) => {
      if (!restaurantUUID || !syncingSupplierUUID) return;

      const contact = syncContacts.find(
        (contact) => contact.contact_id === contactId
      );

      if (contact) {
        // If contactId is provided, use it along with the contact name
        new Promise((resolve, reject) =>
          supplierService
            .addSyncSupplier(
              restaurantUUID,
              syncingSupplierUUID,
              contact.contact_id
            )
            .then((res) => {
              setShowDialog(false);
              fetchSuppliersAndSync();
              toast.success('Supplier sync with Xero');
              resolve(true);
            })
            .catch(() => reject())
        );
      } else {
        // If no contactId is provided, use only the supplier_uuid
        new Promise((resolve, reject) =>
          supplierService
            .addOnlySupplier(restaurantUUID, syncingSupplierUUID)
            .then((res) => {
              setShowDialog(false);
              fetchSuppliersAndSync();
              toast.success('Supplier sync with Xero');
              resolve(true);
            })
            .catch(() => reject())
        );
      }
    };

    const handleSync = () => {
      if (!restaurantUUID) return;
      new Promise((resolve, reject) =>
        supplierService
          .getSync(restaurantUUID)
          .then((res) => {
            setSyncContacts(res);
            resolve(true); // Resolve the promise after successful operation
          })
          .catch(() => reject())
      );
    };

    const suppliersFiltered = props.searchValue
      ? new Fuse(suppliers, {
          keys: ['name', 'email', 'phone'],
          distance: 10,
        })
          .search(props.searchValue)
          .map((r) => r.item)
      : suppliers;

    if (isLoading) {
      return (
        <>
          <h1 className={styles.sectionTitle}>
            <Skeleton width={250} />
          </h1>
          <div className={styles.cardContainer}>
            {[...Array(5)].map((_, i) => (
              <SupplierCardSkeleton key={i} />
            ))}
          </div>
        </>
      );
    }

    return (
      <>
        {suppliers.length === 0 && (
          <EmptyPage
            className={styles.emptyPage}
            title={t('suppliers.emptyPage.title')}
            description={t('suppliers.emptyPage.description')}
          />
        )}
        {suppliersFiltered.length > 0 && (
          <>
            <h1 className={styles.sectionTitle}>{t('suppliers.title')}</h1>
            <div className={styles.cardContainer}>
              {suppliersFiltered.map((supplier) => (
                <SupplierCard
                  key={supplier.uuid}
                  supplier={supplier}
                  onPressDelete={() => {
                    setShowDeleteDialog(true);
                    setDeletingSupplierUUID(supplier.uuid);
                  }}
                  onPressCopy={() =>
                    handleCopyInvitationLink(supplier.invitationKey)
                  }
                  onKey={() => {
                    setShowDialog(true);
                    setSyncingSupplierUUID(supplier?.uuid);
                    handleSync();
                  }}
                  onEdit={() => handleEditSupplierClick(supplier)}
                  connectedIntegrations={connectedIntegrations}
                />
              ))}
            </div>
          </>
        )}

        <DialogBox
          type="warning"
          msg={t('suppliers.removeSupplierPopup.title')}
          subMsg={t('suppliers.removeSupplierPopup.subtitle', {
            name: suppliers.find((s) => s.uuid === deletingSupplierUUID)?.name,
          })}
          isOpen={showDeleteDialog}
          onRequestClose={() => {
            setShowDeleteDialog(false);
            setDeletingSupplierUUID(null);
          }}
          onConfirm={handleDeleteSupplier}
        />

        <DialogBox
          type="warning"
          msg={t('suppliers.syncSupplierPopup.title')}
          subMsg={t('suppliers.syncSupplierPopup.subtitle', {
            name: suppliers.find((s) => s.uuid === syncingSupplierUUID)?.name,
          })}
          isOpen={showDialog}
          onRequestClose={() => {
            setShowDialog(false);
            setSyncingSupplierUUID(null);
          }}
          onConfirm={() =>
            handleSubmit(selectedSyncContact, syncingSupplierUUID)
          }
          disabledConfirm={!selectedSyncContact}>
          <div className={styles.dropdownSection}>
            <Button
              value={t('suppliers.syncSupplierPopup.syncSupplierBtn')}
              onClick={() => handleSubmit()}
              type="primary"
            />
            --OR--
            <Dropdown
              placeholder={t('suppliers.syncSupplierPopup.selectSyncContact')}
              options={syncContacts.map((contact) => ({
                label: contact.name,
                value: contact.contact_id,
              }))}
              selectedOption={selectedSyncContact}
              onOptionChange={(value) => setSelectedSyncContact(value)}
            />
          </div>
        </DialogBox>

        <AddSupplierPopup
          isVisible={showPopup}
          fetchSuppliersAndSync={fetchSuppliersAndSync}
          onRequestClose={() => setShowPopup(false)}
          onSupplierAdded={(supplier) => {
            setSuppliers((suppliers) => [
              ...suppliers,
              {
                ...supplier,
                uuid: Math.random().toString(),
                linked: false,
                linkedAt: new Date(),
              },
            ]);
          }}
          onSupplierUpdated={(updatedSupplier) => {
            setSuppliers((prev) =>
              prev.map((supplier) =>
                supplier.uuid === updatedSupplier.uuid
                  ? updatedSupplier
                  : supplier
              )
            );
          }}
          editSupplier={editSupplier}
          mode={popupMode}
        />
        <Tooltip className="tooltip" id="suppliers-tooltip" delayShow={500} />
      </>
    );
  }
);

SupplierTab.displayName = 'SupplierTab';
