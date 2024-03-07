import { create } from 'zustand';
import { useUserStore } from '@peckishai/user-management';
import { supplierService } from '../services';
import i18n from '../translation/i18n';

export type Supplier = {
  uuid: string;
  name: string;
  created_at: Date;
  //   users: Pick<User, 'email' | 'user_uuid' | 'name' | 'picture'>[];
  currency: string | null;
};

type SupplierStore = {
  supplier?: Supplier;
  loadSupplier: () => void;
};

export const useSupplierStore = create<SupplierStore>()((set) => ({
  supplier: undefined,

  loadSupplier: async () => {
    const user = useUserStore.getState().user;
    if (!user) return;

    const supplier = await supplierService.getUserSupplier(user.user_uuid);

    set({ supplier: supplier });
  },
}));

export const useSupplierCurrency = () => {
  const currencyISO = useSupplierStore((state) => {
    return state.supplier?.currency || 'EUR';
  });

  const getSymbol = (currency: string) => {
    const symbol = new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency,
    })
      .formatToParts(0)
      .find((x) => x.type === 'currency');
    return symbol && symbol.value;
  };

  return { currencyISO, currencySymbol: getSymbol(currencyISO) };
};
