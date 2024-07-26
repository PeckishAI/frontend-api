import { Menu, MenuItem } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';
import { FaPhone, FaSync, FaTrash } from 'react-icons/fa';
import { FiCopy, FiMoreVertical } from 'react-icons/fi';
import { MdAlternateEmail } from 'react-icons/md';
import { LinkedSupplier } from '../../../../services';
import styles from './SupplierCard.module.scss';
import dayjs from 'dayjs';
import Skeleton from 'react-loading-skeleton';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

type Props = {
  supplier: LinkedSupplier;
  onPressDelete: () => void;
  onPressCopy?: () => void;
  onKey?: () => void;
};

export const SupplierCard = ({
  supplier,
  onPressCopy,
  onPressDelete,
  onKey,
}: Props) => {
  const { t } = useTranslation('common');
  const renderMoreOptions = () => (
    <Menu
      menuButton={
        <div className={styles.cardMore}>
          <FiMoreVertical />
        </div>
      }
      transition
      align="end">
      {!supplier.linked && (
        <MenuItem onClick={onPressCopy}>
          <FiCopy className={styles.menuIcon} />
          {t('suppliers.copyLink')}
        </MenuItem>
      )}
      {/* <MenuItem disabled>
        <FaEdit className={styles.menuIcon} />
        Edit
      </MenuItem> */}
      <MenuItem className={styles.menuDelete} onClick={onPressDelete}>
        <FaTrash className={styles.menuIcon} />
        {t('suppliers.revokeAccess')}
      </MenuItem>
      <MenuItem onClick={onKey}>
        <FaSync className={styles.menuIcon} />
        {t('suppliers.sync')}
      </MenuItem>
    </Menu>
  );

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{supplier.name}</h3>

        {renderMoreOptions()}
      </div>
      <p className={styles.cardLinkedAt}>
        {dayjs(supplier.linkedAt).calendar()}
      </p>
      <div className={styles.cardContactContainer}>
        {supplier.phone && (
          <a className={styles.cardContactText} href={`tel:${supplier.phone}`}>
            <FaPhone className={styles.cardContactIcon} />
            {supplier.phone}
          </a>
        )}
        {supplier.email && (
          <a
            className={styles.cardContactText}
            href={`mailto:${supplier.email}`}>
            <MdAlternateEmail className={styles.cardContactIcon} />
            {supplier.email}
          </a>
        )}
      </div>
      {supplier.linked ? (
        <i
          className={classNames('fa-solid fa-link', styles.linked)}
          data-tooltip-content={t('suppliers.linked')}
          data-tooltip-id="suppliers-tooltip"></i>
      ) : (
        <i
          className={classNames('fa-solid fa-hourglass-half', styles.unlinked)}
          data-tooltip-content={t('suppliers.waitLink')}
          data-tooltip-id="suppliers-tooltip"></i>
      )}
    </div>
  );
};

export const SupplierCardSkeleton = () => {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Skeleton width={100} />
        </h3>
      </div>
      <p className={styles.cardLinkedAt}>
        <Skeleton width={150} />
      </p>
      <div className={styles.cardContactContainer}>
        <a className={styles.cardContactText}>
          <Skeleton width={175} />
        </a>
        <a className={styles.cardContactText}>
          <Skeleton width={175} />
        </a>
      </div>
    </div>
  );
};
