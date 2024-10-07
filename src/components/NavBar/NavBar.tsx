import styles from './NavBar.module.scss';

interface NavBarProps { }

export const NavBar = ({ }: NavBarProps) => (
  <div className={styles.navBar}>
    NavBar Component
  </div>
);
