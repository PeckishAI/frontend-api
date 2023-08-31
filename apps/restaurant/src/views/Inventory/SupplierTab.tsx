import React, { useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'shared-ui';

export type SupplierTabRef = {
  renderOptions: () => React.ReactNode;
  addSupplier: (ok: string) => void;
};

type Props = {
  searchValue: string;
  setLoadingState: (loading: boolean) => void;
};

export const SupplierTab = React.forwardRef<SupplierTabRef, Props>((_, ref) => {
  const { t } = useTranslation('common');

  useImperativeHandle(ref, () => ({
    addSupplier: () => {
      console.log('addSupplier');
    },
    renderOptions: () => (
      <Button
        value={t('inventory.addIngredientBtn')}
        type="primary"
        className="add"
        onClick={() => undefined}
      />
    ),
  }));

  return <div>SuppliersView</div>;
});
