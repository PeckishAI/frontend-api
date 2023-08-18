import './style.scss';
import { Button } from 'shared-ui';

type POS = {
  pos_uuid: string;
  name: string;
  display_name: string;
  button_display?: string;
  auth_type: string;
  oauth_url: string;
  logo_uri: string;
};

type Props = {
  isVisible: boolean;
  pos?: POS;
};

function oauth(auth_type: string | undefined, oauth_url: string | undefined) {
  console.log(auth_type, oauth_url);
}

const LoginModal = (props: Props) => {
  return (
    <div className={'modal ' + (props.isVisible ? ' visible' : '')}>
      <div className="modal-content">
        <div className="modal-header">
          <span className="close">&times;</span>
          <h2>{props.pos?.name}</h2>
        </div>
        <div className="modal-body">
          <label>Email / Username</label>
          <br></br>
          <input type="email" id="username"></input>
          <br></br>
          <label>Password / API KEY</label>
          <br></br>
          <input type="password" id="password"></input>
        </div>
        <div className="modal-footer">
          <Button
            value={'' + props.pos?.button_display}
            type="primary"
            className="login"
            onClick={}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
