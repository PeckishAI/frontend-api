import classnames from 'classnames';
import styles from './Popup.module.scss';

type Props = {
  isVisible: boolean;
  onRequestClose: () => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  maxWidth?: number;
  scrollable?: boolean;
};

const Popup = (props: Props) => {
  return (
    <div
      className={classnames(styles.modal, {
        [styles.visible]: props.isVisible,
      })}
      onClick={props.onRequestClose}>
      <div className={styles.centeringContainer}>
        <div
          className={classnames(styles.modalContent, {
            [styles.scrollableContent]: props.scrollable, // Apply scrollable style conditionally
          })}
          style={{ maxWidth: props.maxWidth }}
          onClick={(e) => e.stopPropagation()}>
          {props.title && <h3 className={styles.modalTitle}>{props.title}</h3>}
          {props.subtitle && (
            <p className={styles.modalSubtitle}>{props.subtitle}</p>
          )}
          <div className={props.scrollable ? styles.scrollableContent : ''}>
            {props.children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Popup;
