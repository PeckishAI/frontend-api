import classNames from 'classnames';
import LottieFile from '../../Lottie/Lottie';
import styles from './EmptyPage.module.scss';

type Props = {
  title: string;
  description: string;
  className?: string;
};

const EmptyPage = (props: Props) => {
  return (
    <div className={classNames(styles.layout, props.className)}>
      <LottieFile type="empty" width="30%" />
      <h1 className={styles.title}>{props.title}</h1>
      <p className={styles.description}>{props.description}</p>
    </div>
  );
};

export default EmptyPage;
