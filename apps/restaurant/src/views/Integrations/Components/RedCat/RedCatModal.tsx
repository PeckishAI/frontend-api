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
  toggleModal: () => void;
  LoginModal: () => void;
  pos?: POS;
  modalData: any;
  setRetrieveDataStatus: () => void;
  setCommonModalVisible: () => void;
};

const RedCatModal = (props: Props) => {
  const { t } = useTranslation(['common', 'validation', 'onboarding']);
  const userId = useUserStore((state) => state.user?.user.user_uuid);

  const a = props?.modalData?.data?.third_party_restaurants;
  const units = props?.modalData?.data?.peckish_restaurants;
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

    if (newRest[selectedRow.restaurant_name]) {
      const newNewRest = { ...newRest };
      delete newNewRest[selectedRow.restaurant_name];
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
        [selectedRow.restaurant_uuid]: value,
      }));
    } else {
      const newSync = { ...sync };
      delete newSync[selectedRow.restaurant_uuid];
      setSync(newSync);
    }

    setUsedSuppliers(newUsedSuppliers);
  };

  const handleAdd = (index) => {
    const selectedRow = rows[index];

    setNewRest((prev) => {
      const updatedNewRest = { ...prev };

      if (
        updatedNewRest[selectedRow.restaurant_name] ===
        selectedRow.restaurant_uuid
      ) {
        delete updatedNewRest[selectedRow.restaurant_name];
      } else {
        updatedNewRest[selectedRow.restaurant_name] =
          selectedRow.restaurant_uuid;
      }

      return updatedNewRest;
    });

    const newSync = { ...sync };
    delete newSync[selectedRow.restaurant_uuid];
    setSync(newSync);

    const newUsedSuppliers = { ...usedSuppliers };
    delete newUsedSuppliers[selectedRow.selectedSupplier];
    setUsedSuppliers(newUsedSuppliers);

    const newRows = [...rows];
    newRows[index].selectedSupplier = '';
    setRows(newRows);
  };

  const handleClick = () => {
    const pairedData = {
      sync_restaurant_details: sync,
      onboard_restaurants_details: newRest,
      token: props?.modalData?.data?.token || '',
      username: props?.modalData?.data?.username,
      password: props?.modalData?.data?.password,
    };

    let apiUrl;
    if (props.pos?.name === 'red_cat') {
      apiUrl = `/pos/red-cat/sync-add-restaurant/${userId}`;
    } else if (props.pos?.name === 'vitamojo') {
      apiUrl = `/pos/vitamojo/sync-add-restaurant/${userId}`;
    } else {
      apiUrl = `/pos/${props?.pos?.name}/sync-add-restaurant/${userId}`;
    }

    setLoading(true);

    axiosIntegrationClient
      .post(apiUrl, pairedData)
      .then((res) => {
        props.setRetrieveDataStatus(null);
        props.LoginModal();
        props.setCommonModalVisible(false);
        toast.success('Restaurant synced to Peckish successfully!');
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
    return units.filter((unit) => !usedSuppliers[unit?.restaurant_uuid]);
  };

  return (
    <Popup
      isVisible={props.isVisible}
      onRequestClose={props.toggleModal}
      title={t('onboarding:restaurant.modal.title')}
      subtitle={t('onboarding:restaurant.modal.description')}>
      <div
        className="modal-content"
        style={{ maxHeight: '400px', overflowY: 'auto', padding: '16px' }}>
        {loading ? (
          <Loading />
        ) : (
          rows?.map((row, index) => (
            <div key={index} className="input-dropdown-pair">
              <span className="span">{row.restaurant_name || ''}</span>
              <div className="select">
                <Select
                  placeholder="restaurant"
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
                type={newRest[row.restaurant_name] ? 'primary' : 'secondary'}
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
