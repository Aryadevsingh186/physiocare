// ============================================================
// PostureCheckPage.jsx  –  Generic reusable posture-check page
// ============================================================
// Usage:
//   import PostureCheckPage from './PostureCheckPage';
//   <PostureCheckPage
//     exerciseTitle="Bicep Curls"
//     navigateTo="/BicepCurls"
//     postureItems={[...]}
//   />
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const styles = `
  .posture-main {
    min-height: 100vh;
    background-color: #ffffff;
    padding: 16px;
  }

  .posture-container {
    max-width: 80rem;
    margin: 0 auto;
  }

  .posture-header {
    text-align: center;
    margin-bottom: 48px;
  }

  .posture-header h1 {
    font-size: 3rem;
    font-weight: bold;
    color: #111827;
    margin-bottom: 8px;
  }

  .posture-header p {
    font-size: 1.125rem;
    color: #4b5563;
  }

  .posture-grid {
    display: grid;
    gap: 16px;
    margin-bottom: 48px;
  }

  @media (max-width: 768px) {
    .posture-grid { grid-template-columns: 1fr; }
    .posture-header h1 { font-size: 2rem; }
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    .posture-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (min-width: 1025px) {
    .posture-grid { grid-template-columns: repeat(5, 1fr); }
  }

  /* 4-item exercises */
  .posture-grid.items-4 {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }

  @media (min-width: 1025px) {
    .posture-grid.items-4 { grid-template-columns: repeat(4, 1fr); }
  }

  .posture-card {
    background-color: #f9fafb;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
    transition: border-color 0.3s ease;
  }

  .posture-card:hover { border-color: #059669; }

  .posture-card-image {
    width: 100%;
    height: 160px;
    background-color: #d1fae5;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 16px;
    border: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .posture-card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .posture-card-image .icon-placeholder {
    font-size: 3rem;
  }

  .posture-card h3 {
    font-weight: bold;
    color: #111827;
    margin-bottom: 8px;
    text-align: center;
  }

  .posture-card p {
    font-size: 0.875rem;
    color: #4b5563;
    margin-bottom: 12px;
    text-align: center;
  }

  .posture-checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .posture-checkbox-label input[type="checkbox"] {
    width: 20px;
    height: 20px;
    accent-color: #059669;
    cursor: pointer;
  }

  .posture-checkbox-label span {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
  }

  .posture-confirmation {
    background-color: #d1fae5;
    border: 2px solid #6ee7b7;
    border-radius: 12px;
    padding: 32px;
    margin-bottom: 32px;
  }

  .posture-confirmation-header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 24px;
  }

  .posture-confirmation-icon {
    width: 24px;
    height: 24px;
    color: #059669;
    flex-shrink: 0;
    margin-top: 4px;
  }

  .posture-confirmation-text h3 {
    font-size: 1.25rem;
    font-weight: bold;
    color: #111827;
    margin-bottom: 8px;
  }

  .posture-confirmation-text p { color: #374151; }

  .posture-button {
    width: 100%;
    padding: 16px 24px;
    border-radius: 8px;
    font-weight: bold;
    font-size: 1.125rem;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .posture-button-enabled {
    background-color: #059669;
    color: #ffffff;
  }

  .posture-button-enabled:hover { background-color: #047857; }

  .posture-button-disabled {
    background-color: #d1d5db;
    color: #9ca3af;
    cursor: not-allowed;
  }

  .posture-success {
    min-height: 100vh;
    background-color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }

  .posture-success-content {
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .posture-success-icon { display: flex; justify-content: center; }

  .posture-success-icon svg {
    width: 80px;
    height: 80px;
    color: #059669;
  }

  .posture-success-content h1 {
    font-size: 2.25rem;
    font-weight: bold;
    color: #111827;
  }

  .posture-success-content p {
    font-size: 1.25rem;
    color: #4b5563;
  }

  .posture-button-group {
    margin-top: 32px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 384px;
    margin-left: auto;
    margin-right: auto;
  }

  .posture-button-secondary {
    background-color: #e5e7eb;
    color: #111827;
  }

  .posture-button-secondary:hover { background-color: #d1d5db; }
`;

/**
 * Generic PostureCheckPage
 *
 * Props:
 *  - exerciseTitle {string}    e.g. "Squat"
 *  - navigateTo   {string}    route to push after confirmation e.g. "/Squat"
 *  - postureItems {Array<{
 *        id: string,
 *        title: string,
 *        instruction: string,
 *        image?: any,       // imported image (optional)
 *        icon?: string,     // emoji fallback when no image (optional)
 *    }>}
 */
export default function PostureCheckPage({ exerciseTitle, navigateTo, postureItems }) {
  const navigate = useNavigate();
  const [postureConfirmed, setPostureConfirmed] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});

  const allChecked = postureItems.every((item) => checkedItems[item.id]);

  const handleCheckboxChange = (id, checked) => {
    setCheckedItems((prev) => ({ ...prev, [id]: checked }));
  };

  const handleStartExercise = () => {
    if (allChecked) setPostureConfirmed(true);
  };

  const gridClass = `posture-grid${postureItems.length === 4 ? ' items-4' : ''}`;

  if (postureConfirmed) {
    return (
      <>
        <style>{styles}</style>
        <main className="posture-success">
          <div className="posture-success-content">
            <div className="posture-success-icon">
              <CheckCircle2 />
            </div>
            <h1>Great Form!</h1>
            <p>You're ready to start the exercise.</p>
            <div className="posture-button-group">
              <button
                onClick={() => {
                  setPostureConfirmed(false);
                  setCheckedItems({});
                }}
                className="posture-button posture-button-secondary"
              >
                Back to Check
              </button>
              <button
                onClick={() => navigate(navigateTo)}
                className="posture-button posture-button-enabled"
              >
                Start Exercise
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <>
      <style>{styles}</style>
      <main className="posture-main">
        <div className="posture-container">
          <div className="posture-header">
            <h1>CHECK YOUR POSTURE</h1>
            <p>{exerciseTitle} Exercise</p>
          </div>

          <div className={gridClass}>
            {postureItems.map((item) => (
              <div key={item.id} className="posture-card">
                <div className="posture-card-image">
                  {item.image ? (
                    <img src={item.image} alt={item.title} />
                  ) : (
                    <span className="icon-placeholder">{item.icon ?? '🏋️'}</span>
                  )}
                </div>
                <h3>{item.title}</h3>
                <p>{item.instruction}</p>
                <label className="posture-checkbox-label">
                  <input
                    type="checkbox"
                    checked={checkedItems[item.id] || false}
                    onChange={(e) => handleCheckboxChange(item.id, e.target.checked)}
                  />
                  <span>Done</span>
                </label>
              </div>
            ))}
          </div>

          <div className="posture-confirmation">
            <div className="posture-confirmation-header">
              <AlertCircle className="posture-confirmation-icon" />
              <div className="posture-confirmation-text">
                <h3>Important</h3>
                <p>
                  Review all posture checkpoints above and check them off. Proper
                  form prevents injury and maximises effectiveness.
                </p>
              </div>
            </div>

            <button
              onClick={handleStartExercise}
              disabled={!allChecked}
              className={`posture-button ${
                allChecked ? 'posture-button-enabled' : 'posture-button-disabled'
              }`}
            >
              {allChecked
                ? 'Start Exercise'
                : `Check all posture points (${checkedCount}/${postureItems.length})`}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
