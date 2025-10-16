import React, { useState } from "react";
import { FileText, MessageSquare, User, ClipboardCheck } from "lucide-react";
import "./DoctorDashboard.css";

function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState("patients");
  const [selectedReport, setSelectedReport] = useState(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [history, setHistory] = useState([
    {
      patient: "John Doe",
      report: "Blood Test Report.pdf",
      date: "01 Oct 2025",
      feedback: "Blood sugar level improving. Continue medication.",
    },
  ]);

  const reports = [
    {
      patient: "John Doe",
      reportName: "Blood Test Report.pdf",
      date: "01 Oct 2025",
      status: "Shared",
    },
    {
      patient: "Jane Smith",
      reportName: "ECG Report.pdf",
      date: "10 Oct 2025",
      status: "New",
    },
  ];

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (selectedReport && diagnosis.trim() !== "") {
      setHistory([
        ...history,
        {
          patient: selectedReport.patient,
          report: selectedReport.reportName,
          date: new Date().toLocaleDateString(),
          feedback: diagnosis,
        },
      ]);
      alert("Diagnosis/Feedback submitted successfully!");
      setDiagnosis("");
      setSelectedReport(null);
    }
  };

  return (
    <div className="doctor-dashboard">
      {/* 🧭 NAVBAR */}
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
        </div>
      </nav>

      {/* 👨‍⚕️ PATIENT REPORTS */}
      {activeTab === "patients" && (
        <section className="patients-section">
          <div className="patients-box">
            <h2>
              <FileText size={22} /> Shared Patient Reports
            </h2>
            <table>
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Report Name</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report, index) => (
                  <tr key={index}>
                    <td>{report.patient}</td>
                    <td>{report.reportName}</td>
                    <td>{report.date}</td>
                    <td>{report.status}</td>
                    <td>
                      <button
                        className="btn-view"
                        onClick={() => setSelectedReport(report)}
                      >
                        <MessageSquare size={16} /> Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 🩺 FEEDBACK MODAL */}
          {selectedReport && (
            <div className="modal-bg">
              <div className="modal">
                <h3>
                  Review Report - {selectedReport.reportName}
                </h3>
                <form onSubmit={handleFeedbackSubmit}>
                  <textarea
                    required
                    placeholder="Enter diagnosis or feedback..."
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                  ></textarea>
                  <div className="modal-buttons">
                    <button
                      type="button"
                      onClick={() => setSelectedReport(null)}
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

      {/* 📋 DIAGNOSIS HISTORY */}
      {activeTab === "history" && (
        <section className="history-section">
          <h2>
            <ClipboardCheck size={22} /> Diagnosis History
          </h2>
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
              {history.map((item, index) => (
                <tr key={index}>
                  <td>{item.patient}</td>
                  <td>{item.report}</td>
                  <td>{item.date}</td>
                  <td>{item.feedback}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

export default DoctorDashboard;
