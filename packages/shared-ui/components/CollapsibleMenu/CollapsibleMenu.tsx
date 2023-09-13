import { ReactNode, useEffect, useRef, useState } from 'react';
import styles from './CollapsibleMenu.module.scss';
import classNames from 'classnames';
import { FaChevronDown } from 'react-icons/fa';

type Props = {
  children: ReactNode;
  header: ReactNode | string;
  className?: string;
  defaultState?: boolean;
};

export const CollapsibleMenu = (props: Props) => {
  const [isMenuOpen, setMenuOpen] = useState(props.defaultState ?? false);
  const contentRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    if (!contentRef.current) return;

    contentRef.current.style.maxHeight = isMenuOpen
      ? `${contentRef.current.scrollHeight}px`
      : '0';
  }, [isMenuOpen, props.children]);

  return (
    <div
      className={classNames(styles.collapsibleMenu, props.className, {
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
      <div ref={contentRef} className={styles.content}>
        {props.children}
      </div>
    </div>
  );
};
