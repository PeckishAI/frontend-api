import { FaRegMoneyBillAlt } from 'react-icons/fa';
import { PiBankBold } from 'react-icons/pi';
import { HiOutlineUserGroup } from 'react-icons/hi';
import { MdOutlineSavings } from 'react-icons/md';
import { TrendCard } from './components/TrendCard';
import { prettyNumber } from '../../utils/helpers';
import styles from './Overview.module.scss';
import { ForecastCard } from './components/ForecastCard';
import { Tooltip } from 'react-tooltip';

// import dayjs from 'dayjs';
type Props = {};

type ForecastDay = {
  date: Date;
  revenue: number;
  profit: number;
  sales: number;
  savings: number;
};

export type Forecast = {
  // ISO currency
  currency: 'EUR' | 'USD';
  days: ForecastDay[];
};

const Overview = (props: Props) => {
  return (
    <>
      <div>
        <div className={styles.trends}>
          <TrendCard
            title="Revenue"
            value={`${prettyNumber(752152)}€`}
            icon={<FaRegMoneyBillAlt />}
            percentage={-3.5}
          />
          <TrendCard
            title="Profit"
            value={`${prettyNumber(7521)}€`}
            icon={<PiBankBold />}
            percentage={-5}
          />
          <TrendCard
            title="Sales"
            value={prettyNumber('42')}
            icon={<HiOutlineUserGroup />}
            percentage={3}
          />
          <TrendCard
            title="Revenue"
            value={prettyNumber('150€')}
            icon={<MdOutlineSavings />}
            percentage={0}
          />
        </div>
        <ForecastCard />
      </div>
      <Tooltip id="overview-tooltip" />
    </>
  );
};

export default Overview;
