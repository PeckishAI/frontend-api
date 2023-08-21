import BlankPicture from '../../asset/images/blank-profile.png';
import styles from './ProfilePicture.module.scss';

type Props = {
  picture?: string;
  alt?: string;
  tooltip?: string;
};

const ProfilePicture = (props: Props) => {
  return (
    <div className={styles.userPicture}>
      <img
        src={props.picture ?? BlankPicture}
        alt={props.alt ?? 'Profile Picture'}
      />
      {props.tooltip && (
        <div className={styles.tooltip}>
          <p className={styles.tooltipText}>{props.alt}</p>
        </div>
      )}
    </div>
  );
};
export default ProfilePicture;
