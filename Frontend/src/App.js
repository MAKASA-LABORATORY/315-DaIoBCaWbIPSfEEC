import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import Dashboard from "./UserInfo";
import axios from "axios";
import logo from "./images/logo.png";
import web from "./images/web.png";
import SignUp from "./Register";
import iconlogo from "./images/examlogo.png";

const App = () => {
  const [profileID, setID] = useState("");
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [register, setRegister] = useState(false);
  const [isUserLogin, setIsUserLogin] = useState(true); // State to track user or admin login
  const navigate = useNavigate(); // Hook for navigation

  // Function to set logged-in state and save the token and user data to local storage
  const setLoggedInWithLocalStorage = (token, userDetails) => {
    console.log("userDetails:", userDetails);

    if (userDetails && userDetails.hasOwnProperty("0")) {
      const userDetailsData = userDetails["0"];

      if (userDetailsData.hasOwnProperty("id_no")) {
        setID(userDetailsData.id_no);
      }

      if (userDetailsData.hasOwnProperty("name")) {
        setName(userDetailsData.name);
      }

      if (userDetailsData.hasOwnProperty("position")) {
        setPosition(userDetailsData.position);
      }

      if (userDetailsData.hasOwnProperty("address")) {
        setAddress(userDetailsData.address);
      }
    }

    localStorage.setItem("token", token);
    setLoggedIn(true);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setLoginError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setLoginError("");
  };

  const handleRegisterClick = (e) => {
    e.preventDefault();
    setRegister(true);
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (email.trim() === "" || password.trim() === "") {
      const errorMessage = "Please enter both email and password";
      setLoginError(errorMessage);
      return;
    }

    setLoading(true);

    let loginApiEndpoint = isUserLogin ? "userlogin" : "adminlogin"; // Determine which API endpoint to call
    axios
      .post(`http://localhost:5001/api/${loginApiEndpoint}`, {
        username: email,
        password,
      })
      .then((response) => {
        console.log(response.data);
        const { error, message, token, userDetails } = response.data;

        if (error) {
          setLoginError(message);
        } else {
          setLoggedInWithLocalStorage(token, userDetails);
          setLoggedIn(true); // Set loggedIn to true after successful login
          navigate("/dashboard");
        }
      })
      .catch((error) => {
        console.error(error);
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          // The request was made and the server responded with a status code that falls out of the range of 2xx
          alert(`Error: ${error.response.data.message}`);
        } else if (error.request) {
          // The request was made but no response was received
          alert("Error: No response received from the server");
        } else {
          // Something happened in setting up the request that triggered an Error
          alert("Error: Failed to make the request");
        }
      })
      .finally(() => {
        setLoading(false); // Stop loading animation
      });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    setEmail("");
    setPassword("");
    console.clear();
    navigate("/");
  };

  return (
    <div className="App">
      <Routes>
        <Route
          path="/"
          element={
            loggedIn ? (
              <div className="success">
                <div className="background-container"></div>
                <nav className="navbar">
                  <div className="logo-container">
                    <img src={logo} alt="bisu-logo" className="bisu-logo" />
                    <div className="campus-name">
                      <p className="text">
                        BOHOL ISLAND STATE UNIVERSITY
                        <br />
                        BILAR CAMPUS
                        <br />
                        Zamora, Bilar, Bohol
                      </p>
                    </div>
                  </div>
                  <img src={web} alt="website" className="website" />
                </nav>
                <Dashboard
                  loggedIn={loggedIn}
                  name={name}
                  profileID={profileID}
                  position={position}
                  address={address}
                  handleLogout={handleLogout}
                />
              </div>
            ) : (
              <div>
                <div className="background-container"></div>
                <nav className="navbar">
                  <div className="logo-container">
                    <img src={logo} alt="bisu-logo" className="bisu-logo" />
                    <div className="campus-name">
                      <p className="text">
                        BOHOL ISLAND STATE UNIVERSITY
                        <br />
                        BILAR CAMPUS
                        <br />
                        Zamora, Bilar, Bohol
                      </p>
                    </div>
                  </div>
                  <img src={web} alt="website" className="website" />
                </nav>
                <div className="container">
                  <div className="login-container">
                    <div className="user-logo">
                      <img
                        src={iconlogo}
                        alt="icon-logo"
                        className="bisu-logo"
                      />
                      <p className="bibic-header">
                        Bisu Bilar
                        <br />
                        Enrollment Checker
                      </p>
                    </div>
                    {register ? (
                      <div>
                        <SignUp />
                        <p>
                          Already have an account?{" "}
                          <a
                            href="#"
                            className="login-link"
                            onClick={() => setRegister(false)}
                          >
                            Click here to login
                          </a>
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="tab-buttons">
                          <button
                            className={isUserLogin ? "active" : ""}
                            onClick={() => setIsUserLogin(true)}
                          >
                            User
                          </button>
                          <button
                            className={!isUserLogin ? "active" : ""}
                            onClick={() => setIsUserLogin(false)}
                          >
                            Admin
                          </button>
                        </div>
                        <form onSubmit={handleLogin}>
                          <div className="register-info">
                            <div>
                              <input
                                type="text"
                                placeholder="Email"
                                value={email}
                                onChange={handleEmailChange}
                              />
                              <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={handlePasswordChange}
                              />
                              {loginError && (
                                <p className="login-error">{loginError}</p>
                              )}
                            </div>
                            <button
                              className="login"
                              type="submit"
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <div className="loader"></div>
                              ) : (
                                "Login"
                              )}
                            </button>
                            <div>
                              <p>
                                Don't have an account?{" "}
                                <span
                                  className="register-link"
                                  onClick={handleRegisterClick}
                                >
                                  Click here
                                </span>
                              </p>
                            </div>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          }
        />
      </Routes>
    </div>
  );
};

export default App;
