import React, { useState, useEffect } from 'react';
import './Profile.css';

const Profile: React.FC = () => {
  const [fullName, setFullName] = useState('John Doe');
  const [email, setEmail] = useState('johndoe@example.com');
  const [phone, setPhone] = useState('123-456-7890');
  const [avatar, setAvatar] = useState(null); // URL to user's avatar or null

  const handleFullNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(event.target.value);
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(event.target.value);
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      const file = event.target.files?.[0];

      if (file) {
        // Create a FormData object to send the file to the server
        const formData = new FormData();
        formData.append('avatar', file);

        // Send the FormData to the server using fetch or your preferred API method
        const response = await fetch('upload_avatar_endpoint', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          // Update the avatar URL after successful upload
          const newAvatarUrl = await response.json(); // Assuming the server returns the new avatar URL
          setAvatar(newAvatarUrl);
          console.log('Avatar uploaded successfully');
        } else {
          console.error('Error uploading avatar');
        }
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
    }
  };

  const handleSave = async () => {
    try {
      const userData = {
        fullName,
        email,
        phone,
        avatar,
      };

      const response = await fetch('/api/save-user-data', {
        // Should change for real path
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        console.log('User data saved successfully');
        // Clear input fields after saving
        setFullName('');
        setEmail('');
        setPhone('');
      } else {
        console.error('Error saving user data');
      }
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/fetch-user-data'); // Should change for real path
        if (response.ok) {
          const userData = await response.json();
          setFullName(userData.fullName);
          setEmail(userData.email);
          setPhone(userData.phone);
          setAvatar(userData.avatar);
        } else {
          console.error('Error fetching user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleCameraClick = () => {
    // Trigger the hidden input for file selection
    const fileInput = document.getElementById('avatar-input');
    if (fileInput) {
      fileInput.click();
    }
  };

  return (
    <>
      <div className="profile-container">
        <div className="profile-card user-card">
          <div className="profile-header">
            <div className="profile-avatar-container">
              {!avatar ? (
                <div className="avatar-letter">{fullName.charAt(0)}</div>
              ) : (
                <img
                  src={avatar}
                  alt="User Avatar"
                  className="profile-avatar"
                />
              )}
              <div className="avatar-overlay" onClick={handleCameraClick}>
                <i className="fas fa-camera"></i>
                <input
                  type="file"
                  id="avatar-input"
                  onChange={handleAvatarChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            <div className="profile-info">
              <h2>{fullName}</h2>
            </div>
          </div>
          <div className="profile-details">
            <h3>Profile Details</h3>
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={handleFullNameChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={handlePhoneChange}
              />
            </div>
            <div className="profile-save-button">
              <button className="save-button" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
        <div className="profile-card payment-card">
          <h3>Payment Methods</h3>
          <div className="payment-details">
            <div className="form-group">
              <label htmlFor="cardHolder">Card Holder</label>
              <input type="text" id="cardHolder" />
            </div>
            <div className="form-group">
              <label htmlFor="cardNumber">Card Number</label>
              <input type="text" id="cardNumber" />
            </div>
            <div className="form-group">
              <label htmlFor="expiration">Expiration Date</label>
              <input type="text" id="expiration" />
            </div>
            <div className="form-group">
              <label htmlFor="cvv">CVV</label>
              <input type="text" id="cvv" />
            </div>
            <button className="save-button">Save Payment</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
