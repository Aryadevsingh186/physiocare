// ============================================================
// BicepCurlsPostureCheckPage.jsx  (refactored)
// ============================================================
// Drop-in replacement for the original PostureCheckPage.jsx
// Now uses the shared PostureCheckPage component.
// ============================================================

import PostureCheckPage from './PostureCheckPage';

import backStraightImg    from '../../assets/posture-back-straight.jpg';
import shouldersDownImg   from '../../assets/posture-shoulders-down.jpg';
import elbowsCloseImg     from '../../assets/posture-elbows-close.jpg';
import wristsNeutralImg   from '../../assets/posture-wrists-neutral.jpg';
import controlledMotionImg from '../../assets/posture-controlled-motion.jpg';

const bicepCurlPostureItems = [
  {
    id: 'back',
    title: 'Back Straight',
    instruction:
      'Keep your back straight and core engaged — no slouching or leaning back.',
    image: backStraightImg,
  },
  {
    id: 'shoulders',
    title: 'Shoulders Down',
    instruction:
      "Set your shoulders down and back — don't shrug while curling.",
    image: shouldersDownImg,
  },
  {
    id: 'elbows',
    title: 'Elbows Close',
    instruction:
      'Hold elbows close to your torso — only your forearms should move.',
    image: elbowsCloseImg,
  },
  {
    id: 'wrists',
    title: 'Wrists Neutral',
    instruction:
      "Keep wrists neutral and straight — don't bend them up or down.",
    image: wristsNeutralImg,
  },
  {
    id: 'motion',
    title: 'Controlled Motion',
    instruction:
      'Curl the weight in a slow, controlled motion — lift and lower with control.',
    image: controlledMotionImg,
  },
];

export default function BicepCurlsPostureCheckPage() {
  return (
    <PostureCheckPage
      exerciseTitle="Bicep Curl"
      navigateTo="/BicepCurls"
      postureItems={bicepCurlPostureItems}
    />
  );
}
