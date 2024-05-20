import React from "react";
import "./userInfo.css";
import Checking from "./Checking";

const UserInfo = ({
  loggedIn,
  name,
  profileID,
  position,
  address,
  handleLogout,
  handleStartChecking,
}) => {
  return (
    <div className="user-info-container">
      <div className="user-info">
        <div className="tab">
          <button className="logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
        <div className="top-info-container">
          <div className="top-info">
            <h2>Welcome, {name}!</h2>
            <div className="user-info-input">
              <p>
                <strong>Profile ID:</strong> {profileID}
              </p>
              <p>
                <strong>Name:</strong> {name}
              </p>
              <p>
                <strong>Position:</strong> {position}
              </p>
              <p>
                <strong>Address:</strong> {address}
              </p>
              <br />
            </div>
            <div className="checking">
              <Checking />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
