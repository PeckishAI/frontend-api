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

    const [showAddPopup, setShowAddPopup] = useState(false);

    const restaurantUUID = useRestaurantStore(
      (state) => state.selectedRestaurantUUID
    );

    const fetchSuppliersAndSync = async () => {
      try {
        const data =
          await supplierService.getRestaurantSuppliers(restaurantUUID);
        setSuppliers(data);

        handleSync();
      } catch (error) {
        console.error('Error fetching suppliers or syncing:', error);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };

    // Render options for the tab bar
    useImperativeHandle(
      forwardedRef,
      () => {
        props.forceOptionsUpdate();

        return {
          renderOptions: () => (
            <Button
              value={t('inventory.addSupplierBtn')}
              type="primary"
              onClick={() => setShowAddPopup(true)}
            />
          ),
        };
      },
      []
    );

    useEffect(() => {
      if (!restaurantUUID) return;

      fetchSuppliersAndSync();
    }, [restaurantUUID]);

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
            .revokeSupplierAccess(restaurantUUID, deletingSupplierUUID!)
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
              console.log('res', res);
              setSyncingSupplierUUID(null);
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
              console.log('res', res);
              setSyncingSupplierUUID(null);
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
      setShowDialog(false);
      new Promise((resolve, reject) =>
        supplierService
          .getSync(restaurantUUID)
          .then((res) => {
            setSyncContacts(res);
            setSyncingSupplierUUID(null);
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

    // const linkedSuppliers = suppliersFiltered.filter((s) => s.linked);
    // const pendingSuppliers = suppliersFiltered.filter((s) => !s.linked);

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
                    setSyncingSupplierUUID(supplier.uuid);
                  }}
                />
              ))}
            </div>
          </>
        )}

        {pendingSuppliers.length > 0 && (
          <>
            <h1 className={styles.sectionTitle}>
              {t('suppliers.pendingInvitations')}
            </h1>
            <div className={styles.cardContainer}>
              {pendingSuppliers.map((supplier) => (
                <SupplierCard
                  key={supplier.uuid}
                  supplier={supplier}
                  onPressCopy={() =>
                    handleCopyInvitationLink(supplier.invitationKey)
                  }
                  onPressDelete={() => {
                    setShowDeleteDialog(true);
                    setDeletingSupplierUUID(supplier.uuid);
                  }}
                />
              ))}
            </div>
          </>
        )} */}

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
          isVisible={showAddPopup}
          onRequestClose={() => setShowAddPopup(false)}
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
        />
        <Tooltip className="tooltip" id="suppliers-tooltip" delayShow={500} />
      </>
    );
  }
);

SupplierTab.displayName = 'SupplierTab';
