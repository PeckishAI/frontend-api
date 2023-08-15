import React, { useState, useEffect } from 'react';
import SoftwareCard from '../onboarding/SoftwareCard';
import LoginModal from '../onboarding/LoginModal';
import ProgressBar from '../onboarding/ProgressBar';
import './Onboarding.css';

interface Software {
  name: string;
  display_name: string;
  auth_type: string;
  oauth_url: string;
}

const Onboarding: React.FC = () => {
  const [softwareList, setSoftwareList] = useState<Software[]>([]);
  const [selectedSoftware, setSelectedSoftware] = useState<Software | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('http://localhost:8080/onboarding')
      .then((response) => response.json())
      .then((data: Software[]) => {
        setSoftwareList(data);
      })
      .catch((error) => console.error('Error when receiving data:', error));
  }, []);

  const handleSoftwareClick = (software: Software) => {
    setSelectedSoftware(software);
    setShowModal(true);
  };

  const handleLogin = async () => {
    try {
      setShowModal(false);
      setShowProgressBar(true);

      // Send login data to the owner server and process authentication
      // ...

      // After successful authentication, hide the progress bar
      setTimeout(() => {
        setShowProgressBar(false);
        window.location.href = '/restaurants';
      }, 3000); // 3 seconds
    } catch (error) {
      setShowProgressBar(false);
      console.error('Login failed:', error);
    }
  };

  const filteredSoftwareList = softwareList.filter((software) =>
    software.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="onboarding-container">
      <input
        type="text"
        placeholder="Search software"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      <div className="software-card-container">
        {filteredSoftwareList.map((software) => (
          <SoftwareCard
            key={software.name}
            software={software}
            onClick={() => handleSoftwareClick(software)}
          />
        ))}
      </div>
      {selectedSoftware && showModal && (
        <LoginModal software={selectedSoftware} onLogin={handleLogin} />
      )}
      {showProgressBar && <ProgressBar />}
    </div>
  );
};

export default Onboarding;
