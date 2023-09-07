import { Button, Input, Table } from 'shared-ui';
import './style.scss';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Props = {};

const SharingLink = (props: Props) => {
  return (
    <div className="sharing-link-view">
      <h1>peckish</h1>
      <h2>Burger king wants to colaborate with you.</h2>
      <div className="invitation">
        <p>
          By accepting the invitation, you can then view burger king's inventory
          and offer your products to this restaurant. It's an easy way to expand
          your network.
        </p>
        <Button
          type="primary"
          value="Accept"
          onClick={() => alert('redirection to login view')}
        />
      </div>
    </div>
  );
};

export default SharingLink;
