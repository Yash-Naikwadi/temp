/*
  # Create MedLink Database Schema

  ## Overview
  This migration sets up the complete database schema for the MedLink healthcare records management system.

  ## New Tables
  
  ### 1. `profiles`
  User profile information extending Supabase auth.users
  - `id` (uuid, primary key) - References auth.users
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `role` (text) - Either 'doctor' or 'patient'
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `medical_reports`
  Stores patient medical reports
  - `id` (uuid, primary key) - Unique report ID
  - `patient_id` (uuid) - References profiles(id)
  - `report_name` (text) - Name of the report file
  - `file_url` (text) - URL to stored file (optional for now)
  - `report_type` (text) - Type of report (e.g., Blood Test, ECG)
  - `notes` (text) - Additional notes from patient
  - `uploaded_at` (timestamptz) - Upload timestamp
  - `status` (text) - Status: 'uploaded', 'shared', 'reviewed'

  ### 3. `shared_reports`
  Tracks which reports are shared with which doctors
  - `id` (uuid, primary key) - Unique share ID
  - `report_id` (uuid) - References medical_reports(id)
  - `patient_id` (uuid) - References profiles(id)
  - `doctor_id` (uuid) - References profiles(id)
  - `shared_at` (timestamptz) - When report was shared
  - `doctor_email` (text) - Email of doctor (for reference)

  ### 4. `doctor_feedback`
  Stores doctor's diagnosis and feedback on reports
  - `id` (uuid, primary key) - Unique feedback ID
  - `report_id` (uuid) - References medical_reports(id)
  - `doctor_id` (uuid) - References profiles(id)
  - `patient_id` (uuid) - References profiles(id)
  - `diagnosis` (text) - Doctor's diagnosis/feedback
  - `created_at` (timestamptz) - Feedback timestamp

  ## Security
  - Enable RLS on all tables
  - Patients can only view/edit their own data
  - Doctors can only view reports shared with them
  - Doctors can only add feedback to reports shared with them
  - Users can only update their own profiles
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text NOT NULL CHECK (role IN ('doctor', 'patient')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create medical_reports table
CREATE TABLE IF NOT EXISTS medical_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  report_name text NOT NULL,
  file_url text,
  report_type text,
  notes text,
  uploaded_at timestamptz DEFAULT now(),
  status text DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'shared', 'reviewed'))
);

ALTER TABLE medical_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own reports"
  ON medical_reports FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Patients can insert own reports"
  ON medical_reports FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Patients can update own reports"
  ON medical_reports FOR UPDATE
  TO authenticated
  USING (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Patients can delete own reports"
  ON medical_reports FOR DELETE
  TO authenticated
  USING (patient_id = auth.uid());

-- Create shared_reports table
CREATE TABLE IF NOT EXISTS shared_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES medical_reports(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_email text NOT NULL,
  shared_at timestamptz DEFAULT now()
);

ALTER TABLE shared_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own shares"
  ON shared_reports FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Patients can create shares"
  ON shared_reports FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Patients can delete own shares"
  ON shared_reports FOR DELETE
  TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view shares to them"
  ON shared_reports FOR SELECT
  TO authenticated
  USING (doctor_id = auth.uid() OR doctor_email = (SELECT email FROM profiles WHERE id = auth.uid()));

-- Now add the doctor policy for viewing shared reports
CREATE POLICY "Doctors can view shared reports"
  ON medical_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shared_reports
      WHERE shared_reports.report_id = medical_reports.id
      AND shared_reports.doctor_id = auth.uid()
    )
  );

-- Create doctor_feedback table
CREATE TABLE IF NOT EXISTS doctor_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES medical_reports(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  diagnosis text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE doctor_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view feedback on own reports"
  ON doctor_feedback FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view own feedback"
  ON doctor_feedback FOR SELECT
  TO authenticated
  USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can insert feedback on shared reports"
  ON doctor_feedback FOR INSERT
  TO authenticated
  WITH CHECK (
    doctor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM shared_reports
      WHERE shared_reports.report_id = doctor_feedback.report_id
      AND shared_reports.doctor_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medical_reports_patient_id ON medical_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_shared_reports_doctor_id ON shared_reports(doctor_id);
CREATE INDEX IF NOT EXISTS idx_shared_reports_report_id ON shared_reports(report_id);
CREATE INDEX IF NOT EXISTS idx_doctor_feedback_report_id ON doctor_feedback(report_id);
CREATE INDEX IF NOT EXISTS idx_doctor_feedback_doctor_id ON doctor_feedback(doctor_id);
