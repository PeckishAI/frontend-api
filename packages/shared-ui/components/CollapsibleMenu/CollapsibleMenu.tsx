import { ReactNode, useRef, useState } from 'react';
import styles from './CollapsibleMenu.module.scss';
import classNames from 'classnames';
import { FaChevronDown } from 'react-icons/fa';

type Props = {
  children: ReactNode;
  header: ReactNode | string;
  defaultState?: boolean;
};

export const CollapsibleMenu = (props: Props) => {
  const [isMenuOpen, setMenuOpen] = useState(props.defaultState ?? false);
  const contentRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const getMaxHeight = () => {
    if (!contentRef.current) return '0';
    return isMenuOpen ? `${contentRef.current.scrollHeight}px` : '0';
  };

  return (
    <div
      className={classNames(styles.collapsibleMenu, {
        [styles.open]: isMenuOpen,
      })}>
      <div className={styles.header} onClick={toggleMenu}>
        <FaChevronDown className={styles.chevron} />
        {typeof props.header === 'string' ? (
          <p>{props.header}</p>
        ) : (
          props.header
        )}
      </div>
      <div
        ref={contentRef}
        className={styles.content}
        style={{ maxHeight: getMaxHeight() }}>
        {props.children}
      </div>
    </div>
  );
};
