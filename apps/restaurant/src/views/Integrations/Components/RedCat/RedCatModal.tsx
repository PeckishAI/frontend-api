import { useEffect, useState } from 'react';
import './style.scss';
import { Button, Loading, Popup, Select } from 'shared-ui';
import { useTranslation } from 'react-i18next';
import { POS } from '../../Integrations';
import { useUserStore } from '@peckishai/user-management';
import { axiosClient, axiosIntegrationClient } from '../../../../services';
import toast from 'react-hot-toast';

type Props = {
  isVisible: boolean;
  pos?: POS;
  toggleModal: () => void;
  LoginModal: () => void;
  redCatData: any;
  setRetrieveDataStatus: () => void;
  setRedCatModalVisible: () => void;
};

const RedCatModal = (props: Props) => {
  const { t } = useTranslation(['common', 'validation', 'onboarding']);
  const userId = useUserStore((state) => state.user?.user.user_uuid);

  const a = props?.redCatData?.data?.RedCat_restaurant_list;
  const units = props?.redCatData?.data?.peckish_restaurant;
  const [rows, setRows] = useState(a);

  useEffect(() => {
    setRows(a);
  }, [a]);

  const [sync, setSync] = useState({});
  const [newRest, setNewRest] = useState({});
  const [usedSuppliers, setUsedSuppliers] = useState({});
  const [loading, setLoading] = useState(false);

  const handleValueChange = (index, value) => {
    const newRows = [...rows];
    const selectedRow = newRows[index];
    const previousSupplier = selectedRow.selectedSupplier;

    if (newRest[selectedRow.store_name]) {
      const newNewRest = { ...newRest };
      delete newNewRest[selectedRow.store_name];
      setNewRest(newNewRest);
    }

    newRows[index].selectedSupplier = value;
    setRows(newRows);

    const newUsedSuppliers = { ...usedSuppliers };

    if (previousSupplier) {
      delete newUsedSuppliers[previousSupplier];
    }

    if (value) {
      newUsedSuppliers[value] = true;
      setSync((prev) => ({
        ...prev,
        [selectedRow.store_id]: value,
      }));
    } else {
      const newSync = { ...sync };
      delete newSync[selectedRow.store_id];
      setSync(newSync);
    }

    setUsedSuppliers(newUsedSuppliers);
  };

  const handleAdd = (index) => {
    const selectedRow = rows[index];

    setNewRest((prev) => {
      const updatedNewRest = { ...prev };

      if (updatedNewRest[selectedRow.store_name] === selectedRow.store_id) {
        delete updatedNewRest[selectedRow.store_name];
      } else {
        updatedNewRest[selectedRow.store_name] = selectedRow.store_id;
      }

      return updatedNewRest;
    });

    const newSync = { ...sync };
    delete newSync[selectedRow.store_id];
    setSync(newSync);

    const newUsedSuppliers = { ...usedSuppliers };
    delete newUsedSuppliers[selectedRow.selectedSupplier];
    setUsedSuppliers(newUsedSuppliers);

    const newRows = [...rows];
    newRows[index].selectedSupplier = ''; // Clear the selected supplier
    setRows(newRows);
  };

  const handleClick = () => {
    const pairedData = {
      sync,
      new_rest: newRest,
      token: props?.redCatData?.data?.token,
      username: props?.redCatData?.data?.username,
      password: props?.redCatData?.data?.password,
    };
    setLoading(true);

    axiosIntegrationClient
      .post(`/pos/red-cat/sync-add-restaurant/${userId}`, pairedData)
      .then((res) => {
        props.setRetrieveDataStatus(null);
        props.LoginModal();
        props.setRedCatModalVisible(false);
        props.LoginModal();
        toast.success('Success to Restaurant');
        setLoading(false);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      })
      .catch((err) => {
        console.log('Error:', err);
        setLoading(false);
      });
  };

  const getFilteredUnits = () => {
    return units.filter((unit) => !usedSuppliers[unit.restaurant_uuid]);
  };

  return (
    <Popup
      isVisible={props.isVisible}
      onRequestClose={props.toggleModal}
      title={t('onboarding:onboarding.modal.title')}
      subtitle={t(
        props.pos?.auth_type === 'modal'
          ? 'onboarding:onboarding.modal.description.login'
          : 'onboarding:onboarding.modal.description.oauth',
        { name: props.pos?.display_name }
      )}>
      <div
        className="modal-content"
        style={{ maxHeight: '400px', overflowY: 'auto', padding: '16px' }}>
        {loading ? (
          <Loading />
        ) : (
          rows?.map((row, index) => (
            <div key={index} className="input-dropdown-pair">
              <span className="span">{row.store_name || ''}</span>
              <div className="select">
                <Select
                  placeholder="supplier"
                  options={getFilteredUnits()}
                  size="small"
                  isClearable
                  menuPosition="fixed"
                  maxMenuHeight={200}
                  onChange={(value) =>
                    handleValueChange(index, value?.restaurant_uuid ?? '')
                  }
                  getOptionLabel={(option) => option.restaurant_name}
                  getOptionValue={(option) => option.restaurant_uuid}
                  value={
                    units.find(
                      (unit) => unit.restaurant_uuid === row.selectedSupplier
                    ) || null
                  }
                />
              </div>
              <Button
                value="Add to Peckish"
                type={newRest[row.store_name] ? 'primary' : 'secondary'}
                onClick={() => handleAdd(index)}
              />
            </div>
          ))
        )}
        <div className="button-container">
          <Button value="Cancel" type="secondary" onClick={props.toggleModal} />
          <Button
            value="Submit"
            type="primary"
            onClick={handleClick}
            disabled={loading} // Disable submit button while loading
          />
        </div>
      </div>
    </Popup>
  );
};

export default RedCatModal;
