// SoftwareCard.tsx
import React from 'react';

interface SoftwareCardProps {
  software: {
    name: string;
    display_name: string;
    auth_type: string;
    oauth_url: string;
  };
  onClick: () => void;
}

const SoftwareCard: React.FC<SoftwareCardProps> = ({ software, onClick }) => {
  return (
    <div className="software-card" onClick={onClick}>
      <h2>{software.display_name}</h2>
      {/* You can add the logo here */}
      {/* <img src={software.logoUrl} alt={software.display_name} /> */}
    </div>
  );
};

export default SoftwareCard;
