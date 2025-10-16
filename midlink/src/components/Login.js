import React, { useState } from "react";
import "./Login.css";
import { RiFilePaper2Line } from "react-icons/ri";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLogin = location.pathname === "/login";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.email || !formData.password || !formData.role) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profileData && profileData.role !== formData.role) {
        setError(`Please select your correct role: ${profileData.role}`);
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      if (formData.role === "doctor") {
        navigate("/doctor");
      } else {
        navigate("/user");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.fullName ||
      !formData.role
    ) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: data.user.id,
          email: formData.email,
          full_name: formData.fullName,
          role: formData.role,
        },
      ]);

      if (profileError) throw profileError;

      if (formData.role === "doctor") {
        navigate("/doctor");
      } else {
        navigate("/user");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

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
            <button
              className={isLogin ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
            >
              Login
            </button>
            <button
              className={!isLogin ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                navigate("/register");
              }}
            >
              Register
            </button>
          </div>
        </div>

        <div className="auth-container">
          {error && <div className="error-message">{error}</div>}

          {isLogin ? (
            <div className="loginform">
              <h2>Welcome Back</h2>
              <form onSubmit={handleLogin}>
                <label>
                  Email
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label>
                  Select Role
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Select Role --</option>
                    <option value="doctor">Doctor</option>
                    <option value="patient">Patient</option>
                  </select>
                </label>
                <button type="submit" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>
              <p>
                Not a Member?{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/register");
                  }}
                >
                  Signup now
                </button>
              </p>
            </div>
          ) : (
            <div className="registerform">
              <h2>Create Account</h2>
              <form onSubmit={handleRegister}>
                <label>
                  Full Name
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label>
                  Confirm Password
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label>
                  Select Role
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Select Role --</option>
                    <option value="doctor">Doctor</option>
                    <option value="patient">Patient</option>
                  </select>
                </label>
                <button type="submit" disabled={loading}>
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/login");
                    }}
                  >
                    Log in
                  </button>
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
