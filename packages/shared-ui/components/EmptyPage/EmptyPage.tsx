import { Lottie } from '../..';
import styles from './EmptyPage.module.scss';

type Props = {
  title: string;
  description: string;
};

const EmptyPage = (props: Props) => {
  return (
    <div className={styles.layout}>
      <Lottie type="empty" width="30%" />
      <h1 className={styles.title}>{props.title}</h1>
      <p className={styles.description}>{props.description}</p>
    </div>
  );
};

export default EmptyPage;
