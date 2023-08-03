import './navbar.scss';
import { useLocation } from 'react-router-dom';
type Props = {};

const userLogged = false;

const Navbar = (props: Props) => {
  const location = useLocation();
  const pathName = location.pathname.replace('/', '');
  const pathNameFormated = pathName.charAt(0).toUpperCase() + pathName.slice(1);

  return (
    <div className="navbar">
      <h2 className="page-title">{pathNameFormated}</h2>
      <div className="nav-actions">
        <div className="refresh icon">
          <i className="fa-solid fa-rotate"></i>
        </div>
        <div className="my-account icon">
          {userLogged ? (
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
          ) : (
            <i className="fa-solid fa-arrow-right-to-bracket"></i>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
