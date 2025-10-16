import React, { useState, useEffect } from "react";
import { Upload, FileText, Share2, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./UserDashboard.css";

function UserDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [doctorEmail, setDoctorEmail] = useState("");
  const [reports, setReports] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportForm, setReportForm] = useState({
    reportName: "",
    reportType: "",
    notes: "",
  });

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      } else {
        fetchProfile();
        fetchReports();
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (error) throw error;
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("medical_reports")
          .select("*")
          .eq("patient_id", user.id)
          .order("uploaded_at", { ascending: false });

        if (error) throw error;
        setReports(data || []);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleReportFormChange = (e) => {
    setReportForm({
      ...reportForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleUploadReport = async (e) => {
    e.preventDefault();
    if (!selectedFile || !reportForm.reportName) {
      alert("Please select a file and enter report name");
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from("medical_reports").insert([
        {
          patient_id: user.id,
          report_name: reportForm.reportName,
          report_type: reportForm.reportType || "General",
          notes: reportForm.notes,
          status: "uploaded",
        },
      ]);

      if (error) throw error;

      alert("Report uploaded successfully!");
      setSelectedFile(null);
      setReportForm({ reportName: "", reportType: "", notes: "" });
      fetchReports();
    } catch (error) {
      console.error("Error uploading report:", error);
      alert("Error uploading report: " + error.message);
    }
  };

  const handleShare = async (e, reportId) => {
    e.preventDefault();
    if (!doctorEmail) {
      alert("Please enter doctor's email");
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: doctorProfile, error: doctorError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", doctorEmail)
        .eq("role", "doctor")
        .maybeSingle();

      if (doctorError) throw doctorError;

      if (!doctorProfile) {
        alert("Doctor not found with this email");
        return;
      }

      const { error: shareError } = await supabase
        .from("shared_reports")
        .insert([
          {
            report_id: reportId,
            patient_id: user.id,
            doctor_id: doctorProfile.id,
            doctor_email: doctorEmail,
          },
        ]);

      if (shareError) throw shareError;

      const { error: updateError } = await supabase
        .from("medical_reports")
        .update({ status: "shared" })
        .eq("id", reportId);

      if (updateError) throw updateError;

      alert(`Document shared with ${doctorEmail}`);
      setShowShareModal(false);
      setDoctorEmail("");
      fetchReports();
    } catch (error) {
      console.error("Error sharing report:", error);
      alert("Error sharing report: " + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return <div className="user-dashboard">Loading...</div>;
  }

  return (
    <div className="user-dashboard">
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
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>

      {activeTab === "profile" && (
        <section className="profile-section">
          <div className="profile-content">
            <div className="profile-left">
              <h2>Hello, {profile?.full_name || "User"}!</h2>
              <p>Welcome back to your health dashboard.</p>

              <div className="profile-card">
                <p>
                  <strong>Email:</strong> {profile?.email}
                </p>
                <p>
                  <strong>Role:</strong>{" "}
                  {profile?.role?.charAt(0).toUpperCase() +
                    profile?.role?.slice(1)}
                </p>
                <p>
                  <strong>Total Reports:</strong> {reports.length}
                </p>
                <p>
                  <strong>Shared Reports:</strong>{" "}
                  {reports.filter((r) => r.status === "shared").length}
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

      {activeTab === "report" && (
        <section className="report-section">
          <div className="report-box">
            <h2>
              <Upload size={22} /> Upload Report
            </h2>

            <form onSubmit={handleUploadReport}>
              <label>
                Report Name
                <input
                  type="text"
                  name="reportName"
                  placeholder="e.g., Blood Test Report"
                  value={reportForm.reportName}
                  onChange={handleReportFormChange}
                  required
                />
              </label>

              <label>
                Report Type
                <input
                  type="text"
                  name="reportType"
                  placeholder="e.g., Blood Test, ECG, X-Ray"
                  value={reportForm.reportType}
                  onChange={handleReportFormChange}
                />
              </label>

              <label>
                Notes (Optional)
                <textarea
                  name="notes"
                  placeholder="Additional notes..."
                  value={reportForm.notes}
                  onChange={handleReportFormChange}
                  rows="3"
                />
              </label>

              <label>
                Select File
                <input type="file" onChange={handleFileChange} required />
              </label>

              {selectedFile && (
                <p style={{ color: "#94a3b8", marginBottom: "1rem" }}>
                  Selected file: {selectedFile.name}
                </p>
              )}

              <button type="submit" className="btn btn-upload">
                <Upload size={18} /> Upload Report
              </button>
            </form>

            <div className="report-history">
              <h3>
                <FileText size={20} /> Your Reports
              </h3>
              {reports.length === 0 ? (
                <p style={{ textAlign: "center", color: "#94a3b8" }}>
                  No reports uploaded yet
                </p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Report Name</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id}>
                        <td>{report.report_name}</td>
                        <td>{report.report_type || "General"}</td>
                        <td>
                          {new Date(report.uploaded_at).toLocaleDateString()}
                        </td>
                        <td>
                          <span
                            className={`status-badge status-${report.status}`}
                          >
                            {report.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-share-small"
                            onClick={() => {
                              setShowShareModal(report.id);
                            }}
                          >
                            <Share2 size={16} /> Share
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>
      )}

      {showShareModal && (
        <div className="modal-bg">
          <div className="modal">
            <h3>Share Report</h3>
            <form onSubmit={(e) => handleShare(e, showShareModal)}>
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
                  onClick={() => {
                    setShowShareModal(false);
                    setDoctorEmail("");
                  }}
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
