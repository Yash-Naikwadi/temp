import React, { useState, useEffect } from "react";
import { FileText, MessageSquare, ClipboardCheck, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./DoctorDashboard.css";

function DoctorDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("patients");
  const [selectedReport, setSelectedReport] = useState(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [sharedReports, setSharedReports] = useState([]);
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      } else {
        setLoading(false);
        fetchSharedReports();
        fetchFeedbackHistory();
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSharedReports = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("shared_reports")
          .select(
            `
            *,
            medical_reports (
              id,
              report_name,
              report_type,
              uploaded_at,
              status,
              notes
            ),
            profiles!shared_reports_patient_id_fkey (
              full_name,
              email
            )
          `
          )
          .eq("doctor_id", user.id)
          .order("shared_at", { ascending: false });

        if (error) throw error;
        setSharedReports(data || []);
      }
    } catch (error) {
      console.error("Error fetching shared reports:", error);
    }
  };

  const fetchFeedbackHistory = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("doctor_feedback")
          .select(
            `
            *,
            medical_reports (
              report_name
            ),
            profiles!doctor_feedback_patient_id_fkey (
              full_name
            )
          `
          )
          .eq("doctor_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setFeedbackHistory(data || []);
      }
    } catch (error) {
      console.error("Error fetching feedback history:", error);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReport || !diagnosis.trim()) {
      alert("Please enter diagnosis or feedback");
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error: feedbackError } = await supabase
        .from("doctor_feedback")
        .insert([
          {
            report_id: selectedReport.medical_reports.id,
            doctor_id: user.id,
            patient_id: selectedReport.patient_id,
            diagnosis: diagnosis,
          },
        ]);

      if (feedbackError) throw feedbackError;

      const { error: updateError } = await supabase
        .from("medical_reports")
        .update({ status: "reviewed" })
        .eq("id", selectedReport.medical_reports.id);

      if (updateError) throw updateError;

      alert("Diagnosis submitted successfully!");
      setDiagnosis("");
      setSelectedReport(null);
      fetchSharedReports();
      fetchFeedbackHistory();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Error submitting feedback: " + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return <div className="doctor-dashboard">Loading...</div>;
  }

  return (
    <div className="doctor-dashboard">
      <nav className="navbar">
        <h1>Doctor Dashboard</h1>
        <div>
          <button
            onClick={() => setActiveTab("patients")}
            className={activeTab === "patients" ? "active" : ""}
          >
            Patients
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={activeTab === "history" ? "active" : ""}
          >
            Diagnosis History
          </button>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>

      {activeTab === "patients" && (
        <section className="patients-section">
          <div className="patients-box">
            <h2>
              <FileText size={22} /> Shared Patient Reports
            </h2>
            {sharedReports.length === 0 ? (
              <p style={{ textAlign: "center", color: "#94a3b8" }}>
                No reports shared with you yet
              </p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Report Name</th>
                    <th>Type</th>
                    <th>Date Shared</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sharedReports.map((share) => (
                    <tr key={share.id}>
                      <td>{share.profiles?.full_name || "Unknown"}</td>
                      <td>{share.medical_reports?.report_name}</td>
                      <td>{share.medical_reports?.report_type || "General"}</td>
                      <td>
                        {new Date(share.shared_at).toLocaleDateString()}
                      </td>
                      <td>
                        <span
                          className={`status-badge status-${share.medical_reports?.status}`}
                        >
                          {share.medical_reports?.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-view"
                          onClick={() => setSelectedReport(share)}
                        >
                          <MessageSquare size={16} /> Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {selectedReport && (
            <div className="modal-bg">
              <div className="modal">
                <h3>Review Report</h3>
                <div className="report-details">
                  <p>
                    <strong>Patient:</strong>{" "}
                    {selectedReport.profiles?.full_name}
                  </p>
                  <p>
                    <strong>Report:</strong>{" "}
                    {selectedReport.medical_reports?.report_name}
                  </p>
                  <p>
                    <strong>Type:</strong>{" "}
                    {selectedReport.medical_reports?.report_type || "General"}
                  </p>
                  {selectedReport.medical_reports?.notes && (
                    <p>
                      <strong>Notes:</strong>{" "}
                      {selectedReport.medical_reports?.notes}
                    </p>
                  )}
                </div>
                <form onSubmit={handleFeedbackSubmit}>
                  <textarea
                    required
                    placeholder="Enter diagnosis or feedback..."
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    rows="5"
                  ></textarea>
                  <div className="modal-buttons">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedReport(null);
                        setDiagnosis("");
                      }}
                      className="cancel"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="share">
                      Submit Feedback
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </section>
      )}

      {activeTab === "history" && (
        <section className="history-section">
          <h2>
            <ClipboardCheck size={22} /> Diagnosis History
          </h2>
          {feedbackHistory.length === 0 ? (
            <p style={{ textAlign: "center", color: "#94a3b8" }}>
              No diagnosis history yet
            </p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Report</th>
                  <th>Date</th>
                  <th>Feedback</th>
                </tr>
              </thead>
              <tbody>
                {feedbackHistory.map((item) => (
                  <tr key={item.id}>
                    <td>{item.profiles?.full_name || "Unknown"}</td>
                    <td>{item.medical_reports?.report_name}</td>
                    <td>{new Date(item.created_at).toLocaleDateString()}</td>
                    <td>{item.diagnosis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </div>
  );
}

export default DoctorDashboard;
