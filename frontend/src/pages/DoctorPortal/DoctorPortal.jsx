import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DoctorPortal.css';

// Mock data structure
const MOCK_EXERCISES = [
  { id: 1, name: 'Shoulder Rotation', sets: 3, reps: 10, duration: '30 seconds' },
  { id: 2, name: 'Knee Bends', sets: 3, reps: 15, duration: '1 minute' },
  { id: 3, name: 'Neck Stretches', sets: 2, reps: 8, duration: '45 seconds' },
  { id: 4, name: 'Arm Circles', sets: 3, reps: 12, duration: '1 minute' },
  { id: 5, name: 'Back Extension', sets: 3, reps: 10, duration: '50 seconds' },
  { id: 6, name: 'Hip Flexor Stretch', sets: 2, reps: 6, duration: '1 minute 30 seconds' },
];

const DoctorPortal = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('doctor-portal'); // dashboard, addPatient, patientDetail
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [assignedExercises, setAssignedExercises] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    condition: '',
    username: '',
    password: '',
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedPatients = localStorage.getItem('doctorPortalPatients');
    const savedExercises = localStorage.getItem('doctorPortalExercises');
    const savedDoctor = localStorage.getItem('currentDoctor');

    // Check if doctor is logged in
    //if (!savedDoctor) {
     // navigate('/Login');
     // return;
    //}

    if (savedPatients) setPatients(JSON.parse(savedPatients));
    if (savedExercises) setAssignedExercises(JSON.parse(savedExercises));
  }, [navigate]);

  // Save patients to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('doctorPortalPatients', JSON.stringify(patients));
  }, [patients]);

  // Save exercises to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('doctorPortalExercises', JSON.stringify(assignedExercises));
  }, [assignedExercises]);

  const handleAddPatient = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.age || !formData.condition || !formData.username || !formData.password) {
      alert('Please fill in all fields');
      return;
    }

    const newPatient = {
      id: Date.now(),
      ...formData,
      createdDate: new Date().toLocaleDateString(),
    };

    setPatients([...patients, newPatient]);
    
    // Save patient credentials to localStorage for patient portal login
    const allPatients = JSON.parse(localStorage.getItem('patientPortalUsers') || '[]');
    allPatients.push({
      username: formData.username,
      password: formData.password,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      age: formData.age,
      condition: formData.condition,
    });
    localStorage.setItem('patientPortalUsers', JSON.stringify(allPatients));

    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      age: '',
      condition: '',
      username: '',
      password: '',
    });

    setShowAddPatientModal(false);
    alert('Patient added successfully! They can now login with the provided credentials.');
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setCurrentPage('patientDetail');
  };

  const handleAssignExercise = (exerciseId) => {
    if (!selectedPatient) return;

    const patientKey = `patient_${selectedPatient.id}`;
    const currentExercises = assignedExercises[patientKey] || [];

    if (currentExercises.find(e => e.id === exerciseId)) {
      alert('This exercise is already assigned to this patient');
      return;
    }

    const exerciseToAdd = MOCK_EXERCISES.find(e => e.id === exerciseId);
    setAssignedExercises({
      ...assignedExercises,
      [patientKey]: [...currentExercises, exerciseToAdd],
    });

    alert('Exercise assigned successfully!');
  };

  const handleRemoveExercise = (exerciseId) => {
    if (!selectedPatient) return;

    const patientKey = `patient_${selectedPatient.id}`;
    const currentExercises = assignedExercises[patientKey] || [];
    
    setAssignedExercises({
      ...assignedExercises,
      [patientKey]: currentExercises.filter(e => e.id !== exerciseId),
    });
  };

  const handleViewProgress = (patient) => {
    // Save the selected patient info for the progress page
    localStorage.setItem('selectedPatientForProgress', JSON.stringify(patient));
    navigate('/Progress');
  };

  const handleLogout = () => {
    localStorage.removeItem('currentDoctor');
    navigate('/Login');
  };

  const getPatientExercises = () => {
    if (!selectedPatient) return [];
    const patientKey = `patient_${selectedPatient.id}`;
    return assignedExercises[patientKey] || [];
  };

  return (
    <div className="doctor-portal-container">
      {/* Header */}
      <header className="doctor-header">
        <div className="header-content">
          <h1>Doctor Portal</h1>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      {/* Main Content */}
      <div className="doctor-main-content">
        {currentPage === 'doctor-portal' && (
          <div className="dashboard-section">
            <div className="dashboard-header">
              <h2>My Patients</h2>
              <button onClick={() => setShowAddPatientModal(true)} className="add-patient-btn">
                + Add New Patient
              </button>
            </div>

            {patients.length === 0 ? (
              <div className="empty-state">
                <p>No patients added yet. Click "Add New Patient" to get started.</p>
              </div>
            ) : (
              <div className="patients-grid">
                {patients.map(patient => (
                  <div key={patient.id} className="patient-card">
                    <div className="patient-card-header">
                      <h3>{patient.name}</h3>
                      <span className="patient-id">ID: {patient.id}</span>
                    </div>
                    <div className="patient-card-details">
                      <p><strong>Email:</strong> {patient.email}</p>
                      <p><strong>Phone:</strong> {patient.phone}</p>
                      <p><strong>Age:</strong> {patient.age}</p>
                      <p><strong>Condition:</strong> {patient.condition}</p>
                      <p><strong>Added:</strong> {patient.createdDate}</p>
                    </div>
                    <div className="patient-card-actions">
                      <button
                        onClick={() => handleSelectPatient(patient)}
                        className="manage-btn"
                      >
                        Manage Exercises
                      </button>
                      <button
                        onClick={() => handleViewProgress(patient)}
                        className="progress-btn"
                      >
                        View Progress
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentPage === 'patientDetail' && selectedPatient && (
          <div className="patient-detail-section">
            <button onClick={() => setCurrentPage('dashboard')} className="back-btn">
              ← Back to Dashboard
            </button>

            <div className="patient-detail-header">
              <div>
                <h2>{selectedPatient.name}</h2>
                <p className="patient-condition">Condition: {selectedPatient.condition}</p>
              </div>
              <button
                onClick={() => handleViewProgress(selectedPatient)}
                className="progress-btn"
              >
                View Patient Progress
              </button>
            </div>

            <div className="exercises-container">
              <div className="assigned-exercises">
                <h3>Assigned Exercises</h3>
                {getPatientExercises().length === 0 ? (
                  <p className="no-exercises">No exercises assigned yet.</p>
                ) : (
                  <div className="exercises-list">
                    {getPatientExercises().map(exercise => (
                      <div key={exercise.id} className="exercise-item assigned">
                        <div className="exercise-info">
                          <h4>{exercise.name}</h4>
                          <p>Sets: <strong>{exercise.sets}</strong></p>
                          <p>Reps: <strong>{exercise.reps}</strong></p>
                          <p>Duration: <strong>{exercise.duration}</strong></p>
                        </div>
                        <button
                          onClick={() => handleRemoveExercise(exercise.id)}
                          className="remove-btn"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="available-exercises">
                <h3>Available Exercises to Assign</h3>
                <div className="exercises-list">
                  {MOCK_EXERCISES.map(exercise => {
                    const isAssigned = getPatientExercises().some(e => e.id === exercise.id);
                    return (
                      <div key={exercise.id} className={`exercise-item ${isAssigned ? 'disabled' : ''}`}>
                        <div className="exercise-info">
                          <h4>{exercise.name}</h4>
                          <p>Sets: <strong>{exercise.sets}</strong></p>
                          <p>Reps: <strong>{exercise.reps}</strong></p>
                          <p>Duration: <strong>{exercise.duration}</strong></p>
                        </div>
                        <button
                          onClick={() => handleAssignExercise(exercise.id)}
                          className="assign-btn"
                          disabled={isAssigned}
                        >
                          {isAssigned ? 'Already Assigned' : 'Assign'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Patient Modal */}
      {showAddPatientModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Patient</h2>
              <button onClick={() => setShowAddPatientModal(false)} className="close-btn">✕</button>
            </div>

            <form onSubmit={handleAddPatient} className="add-patient-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="form-group">
                <label>Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="30"
                />
              </div>

              <div className="form-group">
                <label>Medical Condition</label>
                <input
                  type="text"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  placeholder="e.g., Back Pain, Knee Injury"
                />
              </div>

              <h3 className="login-credentials-title">Patient Login Credentials</h3>

              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="johndoe123"
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password"
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddPatientModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPortal;
