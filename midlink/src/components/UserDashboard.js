import React, { useState } from "react";
import { Upload, User, FileText, Share2, Eye } from "lucide-react";
import "./UserDashboard.css";

function UserDashboard() {
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [doctorEmail, setDoctorEmail] = useState("");

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleShare = (e) => {
    e.preventDefault();
    alert(`Document shared with ${doctorEmail}`);
    setShowShareModal(false);
  };

  return (
    <div className="user-dashboard">
      {/* 🧭 NAVBAR */}
      <nav className="navbar">
        <h1>User Dashboard</h1>
        <div>
          <button
            onClick={() => setActiveTab("profile")}
            className={activeTab === "profile" ? "active" : ""}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("report")}
            className={activeTab === "report" ? "active" : ""}
          >
            Report
          </button>
        </div>
      </nav>

      {/* 👤 PROFILE SECTION */}
      {activeTab === "profile" && (
        <section className="profile-section">
          <div className="profile-content">
            <div className="profile-left">
              <h2>Hello, John!</h2>
              <p>Welcome back to your health dashboard.</p>

              <div className="profile-card">
                <p>
                  <strong>Disease:</strong> Diabetes Type II
                </p>
                <p>
                  <strong>Next Test Date:</strong> 25 Oct 2025
                </p>
                <p>
                  <strong>Progress:</strong> Improving (80%)
                </p>
              </div>
            </div>
            <img
              src="https://via.placeholder.com/180"
              alt="user"
              className="profile-img"
            />
          </div>
        </section>
      )}

      {/* 📄 REPORT SECTION */}
      {activeTab === "report" && (
        <section className="report-section">
          <div className="report-box">
            <h2>
              <Upload size={22} /> Upload Report
            </h2>

            <input type="file" onChange={handleFileChange} />
            {selectedFile && (
              <p style={{ color: "#94a3b8", marginBottom: "1rem" }}>
                Selected file: {selectedFile.name}
              </p>
            )}

            <div className="button-row">
              <button className="btn btn-view">
                <Eye size={18} /> View Document
              </button>
              <button
                className="btn btn-share"
                onClick={() => setShowShareModal(true)}
              >
                <Share2 size={18} /> Share Document
              </button>
            </div>

            {/* 📋 PREVIOUS REPORTS */}
            <div className="report-history">
              <h3>
                <FileText size={20} /> Previous Reports
              </h3>
              <table>
                <thead>
                  <tr>
                    <th>Report Name</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Blood Test Report.pdf</td>
                    <td>01 Oct 2025</td>
                    <td>Uploaded</td>
                  </tr>
                  <tr>
                    <td>ECG Report.pdf</td>
                    <td>10 Sept 2025</td>
                    <td>Shared</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* 🪟 SHARE MODAL */}
      {showShareModal && (
        <div className="modal-bg">
          <div className="modal">
            <h3>Share Report</h3>
            <form onSubmit={handleShare}>
              <input
                type="email"
                required
                placeholder="Doctor's Email"
                value={doctorEmail}
                onChange={(e) => setDoctorEmail(e.target.value)}
              />
              <div className="modal-buttons">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="cancel"
                >
                  Cancel
                </button>
                <button type="submit" className="share">
                  Share
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
