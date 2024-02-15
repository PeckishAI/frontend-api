import React, { useEffect, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DialogBox, EmptyPage } from 'shared-ui';
import supplierService, {
  LinkedSupplier,
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
    const [deletingSupplierUUID, setDeletingSupplierUUID] = useState<
      string | null
    >(null);

    const [showAddPopup, setShowAddPopup] = useState(false);

    const restaurantUUID = useRestaurantStore(
      (state) => state.selectedRestaurantUUID
    );

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

      supplierService.getRestaurantSuppliers(restaurantUUID).then((data) => {
        setSuppliers(data);
        // SUPPLIERS = res;
      });

      setTimeout(() => {
        setLoading(false);
      }, 1000);
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
              />
            ))}
          </div>
        </>

        {/* {linkedSuppliers.length > 0 && (
          <>
            <h1 className={styles.sectionTitle}>
              {t('suppliers.acceptedInvitations')}
            </h1>
            <div className={styles.cardContainer}>
              {linkedSuppliers.map((supplier) => (
                <SupplierCard
                  key={supplier.uuid}
                  supplier={supplier}
                  onPressDelete={() => {
                    setShowDeleteDialog(true);
                    setDeletingSupplierUUID(supplier.uuid);
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
