// ============================================================
// LegExtensionPostureCheckPage.jsx
// ============================================================
// Covers the seated leg extension machine exercise.
// ============================================================

import PostureCheckPage from './PostureCheckPage';

// Optional: import images when you have them
// import backPadImg       from '../../assets/leg-ext-back-pad.jpg';
// import kneePivotImg     from '../../assets/leg-ext-knee-pivot.jpg';
// import shinPadImg       from '../../assets/leg-ext-shin-pad.jpg';
// import controlledExtImg from '../../assets/leg-ext-controlled.jpg';

const legExtensionPostureItems = [
  {
    id: 'back',
    title: 'Back Flat',
    instruction:
      'Keep your back flat against the pad and sit upright.',
    // image: backPadImg,
    icon: '🪑',
  },
  {
    id: 'knees',
    title: 'Knee Alignment',
    instruction:
      'Align your knees with the machine pivot before starting.',
    // image: kneePivotImg,
    icon: '📐',
  },
  {
    id: 'pad',
    title: 'Pad Position',
    instruction:
      'Place the shin pad just above your ankles, not too high.',
    // image: shinPadImg,
    icon: '🦶',
  },
  {
    id: 'grip',
    title: 'Stable Position',
    instruction:
      'Hold the handles and keep feet facing forward.',
    // image: backPadImg,
    icon: '✊',
  },
  {
    id: 'motion',
    title: 'Controlled Motion',
    instruction:
      'Extend slowly, avoid locking knees, and lower with control.',
    // image: controlledExtImg,
    icon: '⚡',
  },
];

export default function LegExtensionPostureCheckPage() {
  return (
    <PostureCheckPage
      exerciseTitle="Leg Extension"
      navigateTo="/LegExtension"
      postureItems={legExtensionPostureItems}
    />
  );
}