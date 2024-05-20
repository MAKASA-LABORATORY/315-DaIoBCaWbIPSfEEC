import axios from "axios";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import "./Register.css";

Modal.setAppElement("#root");

const Register = () => {
  // Content of the registration page
  const [profileID, setID] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [addingError, setAddingError] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [errorModalIsOpen, setErrorModalIsOpen] = useState(false);
  const [successModalIsOpen, setSuccessModalIsOpen] = useState(false);
  const [forModal, setForModal] = useState("");
  const navigate = useNavigate();

  const handleProfileIDChange = (e) => {
    const value = e.target.value;
    const formattedValue = value.replace(/\D/g, ""); // Remove non-digit characters

    setID(formattedValue);
    setAddingError("");
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    setAddingError("");
  };

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
    setAddingError("");
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    setAddingError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setAddingError("");
  };

  const handleAdd = (e) => {
    e.preventDefault();

    if (profileID.trim() === "") {
      const errorMessage = "Please enter your ID No.";
      setAddingError(errorMessage);
      return;
    }

    if (name.trim() === "") {
      const errorMessage = "Please enter your fullname";
      setAddingError(errorMessage);
      return;
    }

    if (address.trim() === "") {
      const errorMessage = "Please enter your address.";
      setAddingError(errorMessage);
      return;
    }

    if (username.trim() === "") {
      const errorMessage = "Please enter your username";
      setAddingError(errorMessage);
      return;
    }

    if (password.trim() === "") {
      const errorMessage = "Please enter your password";
      setAddingError(errorMessage);
      return;
    }

    setLoading(true);

    axios
      .post("http://localhost:5001/api/add", {
        id_no: profileID,
        name,
        address,
        username,
        password,
      })
      .then((response) => {
        const { error, message } = response.data;

        if (error) {
          if (message === "Oops! Employee does not exist!") {
            setForModal(message);
            setErrorModalIsOpen(true);
            setLoading(false);
          } else {
            setAddingError(message);
            setLoading(false);
          }
        } else {
          setForModal(message);
          setSuccessModalIsOpen(true);
          setLoading(false);
        }
      });
  };

  const handleCloseErrorModal = () => {
    setErrorModalIsOpen(false);
  };

  const handleCloseSuccessModal = () => {
    setSuccessModalIsOpen(false);

    setID("");
    setName("");
    setAddress("");
    setUsername("");
    setPassword("");
    navigate("/");
  };

  return (
    <form>
      <div className="register-info">
        <div className="register-info-input">
          <input
            type="text"
            placeholder="ID No."
            value={profileID}
            onChange={handleProfileIDChange}
          />
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={handleNameChange}
          />
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={handleAddressChange}
          />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={handleUsernameChange}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
          />
          {addingError && <p className="adding-error">{addingError}</p>}
        </div>
        <button
          type="submit"
          className="save-button"
          onClick={handleAdd}
          disabled={isLoading}
        >
          {isLoading ? <div className="loader"></div> : "Register"}
        </button>
      </div>
      <Modal
        isOpen={errorModalIsOpen}
        onRequestClose={handleCloseErrorModal}
        overlayClassName="custom-overlay"
        contentLabel="Error Modal"
        className="universal-modal"
      >
        <div className="modal-header">
          <span className="error-icon">
            <FontAwesomeIcon icon={faTimes} />
          </span>
          <h2 className="universal-title">Error!</h2>
        </div>
        <p>{forModal}</p>
        <button className="ok-button" onClick={handleCloseErrorModal}>
          OK
        </button>
      </Modal>

      <Modal
        isOpen={successModalIsOpen}
        onRequestClose={handleCloseSuccessModal}
        overlayClassName="custom-overlay"
        contentLabel="Success Modal"
        className="universal-modal"
      >
        <div className="modal-header">
          <span className="success-icon">
            <FontAwesomeIcon icon={faCheckCircle} />
          </span>
          <h2 className="universal-title">Success!</h2>
        </div>
        <p>{forModal}</p>
        <button className="ok-button" onClick={handleCloseSuccessModal}>
          OK
        </button>
      </Modal>
    </form>
  );
};

export default Register;
