import React, { useEffect, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DialogBox } from 'shared-ui';
import { LinkedSupplier } from '../../services/supplier.service';
import styles from './SupplierTab.module.scss';
import { SupplierCard, SupplierCardSkeleton } from './components/SupplierCard';
import { toast } from 'react-hot-toast';
import { GLOBAL_CONFIG } from 'shared-config';
import Fuse from 'fuse.js';
import AddSupplierPopup from './components/AddSupplierPopup';
import Skeleton from 'react-loading-skeleton';

let SUPPLIERS: LinkedSupplier[] = [
  {
    uuid: '1',
    name: 'Rekki',
    email: 'supply@rekki.com',
    phone: '020 3887 2992',
    linked: true,
    linkedAt: new Date(),
  },
  {
    uuid: '2',
    name: 'Metro',
    email: 'supply@metro.com',
    phone: '031 8481 7015',
    linked: false,
    invitationKey: 'ef51ca554fadc5a1baa952d3e4',
    linkedAt: new Date(),
  },
];

export type SupplierTabRef = {
  renderOptions: () => React.ReactNode;
};

type Props = {
  searchValue: string;
  setLoadingState: (loading: boolean) => void;
};

export const SupplierTab = React.forwardRef<SupplierTabRef, Props>(
  (props, forwardedRef) => {
    const { t } = useTranslation('common');

    const [isLoading, setLoading] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deletingSupplierUUID, setDeletingSupplierUUID] = useState<
      string | null
    >(null);
    const [showAddPopup, setShowAddPopup] = useState(false);

    // Render options for the tab bar
    useImperativeHandle(
      forwardedRef,
      () => ({
        renderOptions: () => (
          <Button
            value={t('inventory.addSupplierBtn')}
            type="primary"
            onClick={() => setShowAddPopup(true)}
          />
        ),
      }),
      []
    );

    useEffect(() => {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }, []);

    const handleCopyInvitationLink = (invitationKey?: string) => {
      if (!invitationKey) {
        toast.error('No invitation link found');
        return;
      }

      const link = `${GLOBAL_CONFIG.supplierUrl}/invitation/${invitationKey}`;
      navigator.clipboard.writeText(link);

      toast.success('Invitation link copied to clipboard');
    };

    const handleDeleteSupplier = () => {
      setShowDeleteDialog(false);
      toast.promise(
        new Promise((resolve) =>
          setTimeout(() => {
            SUPPLIERS = SUPPLIERS.filter(
              (s) => s.uuid !== deletingSupplierUUID
            );
            setDeletingSupplierUUID(null);
            resolve(true);
          }, 1000)
        ),
        {
          loading: 'Deleting supplier...',
          success: 'Supplier deleted',
          error: 'Error deleting supplier',
        }
      );
    };

    const suppliers = props.searchValue
      ? new Fuse(SUPPLIERS, {
          keys: ['name', 'email', 'phone'],
          distance: 10,
        })
          .search(props.searchValue)
          .map((r) => r.item)
      : SUPPLIERS;

    const linkedSuppliers = suppliers.filter((s) => s.linked);
    const pendingSuppliers = suppliers.filter((s) => !s.linked);

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
        {linkedSuppliers.length > 0 && (
          <>
            <h1 className={styles.sectionTitle}>Accepted invitations</h1>
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
            <h1 className={styles.sectionTitle}>Pending invitations</h1>
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
        )}

        <DialogBox
          type="warning"
          msg="Révoquer l'accès à l'inventaire"
          subMsg="Voulez-vous supprimer l'accès de REKKI à votre inventaire ?"
          revele={showDeleteDialog}
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
            // TEMPORARY (until we have the backend)
            SUPPLIERS.push({
              ...supplier,
              uuid: Math.random().toString(),
              linked: false,
              linkedAt: new Date(),
            });
          }}
        />
      </>
    );
  }
);

SupplierTab.displayName = 'SupplierTab';
