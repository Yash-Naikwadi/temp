import React from "react";
import "./Login.css";
import { RiFilePaper2Line } from "react-icons/ri";
import { useLocation, useNavigate } from "react-router-dom";

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine current mode based on URL
  const isLogin = location.pathname === "/login";

  return (
    <div className="auth-page">
      <div className="leftbox">
        <div className="circle circle1"></div>
        <div className="circle circle2"></div>

        <div className="content">
          <div className="logo-icon">
            <RiFilePaper2Line size={40} color="#fff" />
          </div>
          <h2 className="logo-text">MedLink</h2>
          <h1 className="f">Your Health, Your Data, Your </h1>
          <h1 className="s">Control.</h1>
          <p>
            Securely manage and share your health records with blockchain
            technology, ensuring privacy and ownership.
          </p>
        </div>
      </div>

      <div className="rightbox">
        <div className="auth-header">
          <h1>
            Secure <span>Access</span>
          </h1>
          <div className="tabs">
            <a
              href="#"
              className={isLogin ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
            >
              Login
            </a>
            <a
              href="#"
              className={!isLogin ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                navigate("/register");
              }}
            >
              Register
            </a>
          </div>
        </div>

        <div className="auth-container">
          {isLogin ? (
            <div className="loginform">
              <h2>Welcome Back</h2>
              <form>
                <label>
                  Email
                  <input type="email" placeholder="Enter your email" />
                </label>
                <label>
                  Password
                  <input type="password" placeholder="Enter your password" />
                </label>
                <label>
                  Select Role
                  <select>
                    <option value="">-- Select Role --</option>
                    <option value="doctor">Doctor</option>
                    <option value="patient">Patient</option>
                  </select>
                </label>
                <a href="#">Forget Password?</a>
                <button>Login</button>
              </form>
              <p>
                Not a Member?{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/register");
                  }}
                >
                  Signup now
                </a>
              </p>
            </div>
          ) : (
            <div className="registerform">
              <h2>Create Account</h2>
              <form>
                <label>
                  Username
                  <input type="text" placeholder="Enter username" />
                </label>
                <label>
                  Password
                  <input type="password" placeholder="Enter password" />
                </label>
                <label>
                  Confirm Password
                  <input type="password" placeholder="Re-enter password" />
                </label>
                <label>
                  Select Role
                  <select>
                    <option value="">-- Select Role --</option>
                    <option value="doctor">Doctor</option>
                    <option value="patient">Patient</option>
                  </select>
                </label>
                <button>Create Account</button>
                <p>
                  Already have an account?{" "}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/login");
                    }}
                  >
                    Log in
                  </a>
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
