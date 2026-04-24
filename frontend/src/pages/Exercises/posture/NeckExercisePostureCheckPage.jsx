// ============================================================
// NeckExercisePostureCheckPage.jsx
// ============================================================

import PostureCheckPage from './PostureCheckPage';

// Optional: import images when you have them
// import standingTallImg     from '../../assets/neck-standing-tall.jpg';
// import armsForwardImg      from '../../assets/neck-arms-forward.jpg';
// import openArmsImg         from '../../assets/neck-open-arms.jpg';
// import headTiltImg         from '../../assets/neck-head-tilt.jpg';
// import controlledReturnImg from '../../assets/neck-controlled-return.jpg';

const neckPostureItems = [
  {
    id: 'stance',
    title: 'Stand Tall',
    instruction:
      'Stand upright with shoulders relaxed and spine neutral.',
    // image: standingTallImg,
    icon: '🧍',
  },
  {
    id: 'arms',
    title: 'Arms Forward',
    instruction:
      'Keep both arms straight forward at shoulder height.',
    // image: armsForwardImg,
    icon: '🤲',
  },
  {
    id: 'open',
    title: 'Open Arms Wide',
    instruction:
      'Open arms to the sides and squeeze shoulder blades back.',
    // image: openArmsImg,
    icon: '🦅',
  },
  {
    id: 'neck',
    title: 'Gentle Head Tilt',
    instruction:
      'Tilt your head back gently—do not force the movement.',
    // image: headTiltImg,
    icon: '🔙',
  },
  {
    id: 'return',
    title: 'Controlled Return',
    instruction:
      'Bring arms and head back slowly to neutral position.',
    // image: controlledReturnImg,
    icon: '🔄',
  },
];

export default function NeckExercisePostureCheckPage() {
  return (
    <PostureCheckPage
      exerciseTitle="Neck & Shoulder Retraction"
      navigateTo="/NeckExercise"
      postureItems={neckPostureItems}
    />
  );
}